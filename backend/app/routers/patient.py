"""Endpoint Pasien: lihat dokter & jadwal, booking appointment, lihat laporan disetujui."""

from fastapi import APIRouter, Depends, HTTPException

from ..db import get_db, USERS, SCHEDULES, APPOINTMENTS, CASES
from ..security import require_roles
from ..schemas import AppointmentCreate
from ..utils import serialize, oid, now_utc

router = APIRouter(prefix="/patient", tags=["patient"],
                   dependencies=[Depends(require_roles("pasien"))])


@router.get("/doctors")
async def list_doctors():
    docs = await get_db()[USERS].find({"role": "dokter", "status": "active"}).to_list(200)
    return [serialize(d) for d in docs]


@router.get("/schedules")
async def available_schedules(doctor_id: str | None = None):
    """Jadwal approved yang masih punya kuota (booked < quota)."""
    # Only show approved schedules (or legacy schedules without a status field)
    status_filter = {"$or": [{"status": "approved"}, {"status": {"$exists": False}}]}
    q = {**status_filter}
    if doctor_id:
        q["doctor_id"] = doctor_id
    docs = await get_db()[SCHEDULES].find(q).sort("date", 1).to_list(500)
    out = []
    for d in docs:
        d = serialize(d)
        d["available"] = max(0, d.get("quota", 0) - d.get("booked", 0))
        if d["available"] > 0:
            out.append(d)
    return out


@router.post("/appointments", status_code=201)
async def book(body: AppointmentCreate, user: dict = Depends(require_roles("pasien"))):
    db = get_db()
    if not body.complaint or not body.complaint.strip():
        raise HTTPException(status_code=422, detail="Keluhan wajib diisi.")
    sched = await db[SCHEDULES].find_one({"_id": oid(body.schedule_id)})
    if not sched:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan.")
    if sched.get("booked", 0) >= sched.get("quota", 0):
        raise HTTPException(status_code=409, detail="Kuota jadwal sudah penuh.")

    appt = {
        "patient_id": user["id"], "patient_name": user["name"],
        "doctor_id": sched["doctor_id"], "doctor_name": sched["doctor_name"],
        "schedule_id": str(sched["_id"]), "date": sched["date"], "time": sched["start_time"],
        "complaint": body.complaint.strip(),
        "symptom_duration": (body.symptom_duration or "").strip() or None,
        "status": "submitted", "booked_at": now_utc(),
    }
    res = await db[APPOINTMENTS].insert_one(appt)
    await db[SCHEDULES].update_one({"_id": sched["_id"]}, {"$inc": {"booked": 1}})
    appt["_id"] = res.inserted_id
    return serialize(appt)


@router.get("/appointments")
async def my_appointments(user: dict = Depends(require_roles("pasien"))):
    docs = await get_db()[APPOINTMENTS].find({"patient_id": user["id"]}) \
        .sort("booked_at", -1).to_list(200)
    return [serialize(d) for d in docs]


@router.get("/reports")
async def my_reports(user: dict = Depends(require_roles("pasien"))):
    """Hanya kasus yang sudah DISETUJUI dokter."""
    docs = await get_db()[CASES].find(
        {"patient_id": user["id"], "status": "approved"}
    ).sort("reviewed_at", -1).to_list(200)
    return [_patient_safe_report(serialize(d)) for d in docs]


@router.get("/reports/{case_id}")
async def report_detail(case_id: str, user: dict = Depends(require_roles("pasien"))):
    doc = await get_db()[CASES].find_one({"_id": oid(case_id)})
    if not doc or doc.get("patient_id") != user["id"]:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan.")
    if doc.get("status") != "approved":
        raise HTTPException(status_code=403, detail="Laporan belum disetujui dokter.")
    return _patient_safe_report(serialize(doc))


def _patient_safe_report(c: dict) -> dict:
    """
    Versi pasien: SEMBUNYIKAN confidence/probabilitas/Grad-CAM/raw AI recommendation
    (sesuai konteks_2.md — hasil akhir = keputusan dokter).
    """
    return {
        "id": c["id"],
        "patient_name": c.get("patient_name"),
        "doctor_name": c.get("doctor_name"),
        "submitted_at": c.get("submitted_at"),
        "reviewed_at": c.get("reviewed_at"),
        "original_image": c.get("images", {}).get("original_url"),
        "doctor_result": c.get("doctor_result"),
    }
