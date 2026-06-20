"""
Endpoint Dokter: daftar kasus menunggu validasi, detail kasus (data+AI+Grad-CAM),
approve (final diagnosis + rekomendasi) / reject (note -> balik ke Medical Record).
"""

from fastapi import APIRouter, Depends, HTTPException

from ..db import get_db, CASES, SCHEDULES, APPOINTMENTS
from ..security import require_roles
from ..schemas import ApproveBody, RejectBody
from ..utils import serialize, oid, now_utc

router = APIRouter(prefix="/doctor", tags=["doctor"],
                   dependencies=[Depends(require_roles("dokter"))])


def _scope(user: dict, extra: dict | None = None) -> dict:
    """Kasus milik dokter ini (atau yang belum ada dokternya)."""
    q = {"doctor_id": user["id"]}
    if extra:
        q.update(extra)
    return q


@router.get("/dashboard")
async def dashboard(user: dict = Depends(require_roles("dokter"))):
    db = get_db()
    waiting = await db[CASES].count_documents(_scope(user, {"status": "waiting"}))
    approved = await db[CASES].count_documents(_scope(user, {"status": "approved"}))
    rejected = await db[CASES].count_documents(_scope(user, {"status": "rejected"}))
    recent = await db[CASES].find(_scope(user)).sort("submitted_at", -1).limit(10).to_list(10)
    return {
        "waiting": waiting, "approved": approved, "rejected": rejected,
        "recent": [_summary(serialize(c)) for c in recent],
    }


@router.get("/cases")
async def cases(status: str = "waiting", user: dict = Depends(require_roles("dokter"))):
    docs = await get_db()[CASES].find(_scope(user, {"status": status})) \
        .sort("submitted_at", -1).to_list(300)
    return [_summary(serialize(c)) for c in docs]


@router.get("/cases/{case_id}")
async def case_detail(case_id: str, user: dict = Depends(require_roles("dokter"))):
    doc = await get_db()[CASES].find_one({"_id": oid(case_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Kasus tidak ditemukan.")
    return serialize(doc)


@router.post("/cases/{case_id}/approve")
async def approve(case_id: str, body: ApproveBody, user: dict = Depends(require_roles("dokter"))):
    db = get_db()
    doc = await db[CASES].find_one({"_id": oid(case_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Kasus tidak ditemukan.")
    await db[CASES].update_one({"_id": oid(case_id)}, {"$set": {
        "status": "approved",
        "doctor_result": {
            "final_diagnosis": body.final_diagnosis,
            "lifestyle_recommendation": body.lifestyle_recommendation,
            "food_recommendation": body.food_recommendation,
            "follow_up_plan": body.follow_up_plan,
        },
        "reviewed_at": now_utc(), "reviewed_by": user["name"],
    }})
    return serialize(await db[CASES].find_one({"_id": oid(case_id)}))


@router.post("/cases/{case_id}/reject")
async def reject(case_id: str, body: RejectBody, user: dict = Depends(require_roles("dokter"))):
    db = get_db()
    doc = await db[CASES].find_one({"_id": oid(case_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Kasus tidak ditemukan.")
    await db[CASES].update_one({"_id": oid(case_id)}, {"$set": {
        "status": "rejected",
        "doctor_result": {"reject_note": body.reject_note},
        "reviewed_at": now_utc(), "reviewed_by": user["name"],
    }})
    return serialize(await db[CASES].find_one({"_id": oid(case_id)}))


# ---------- Doctor schedule approval ----------

@router.get("/schedules")
async def my_schedules(user: dict = Depends(require_roles("dokter"))):
    """Semua jadwal yang ditetapkan ke dokter ini (semua status)."""
    docs = await get_db()[SCHEDULES].find({"doctor_id": user["id"]}) \
        .sort("date", 1).to_list(500)
    return [serialize(d) for d in docs]


@router.post("/schedules/{schedule_id}/approve")
async def approve_schedule(schedule_id: str, user: dict = Depends(require_roles("dokter"))):
    db = get_db()
    doc = await db[SCHEDULES].find_one({"_id": oid(schedule_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan.")
    if doc.get("doctor_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Anda tidak memiliki akses ke jadwal ini.")
    await db[SCHEDULES].update_one({"_id": oid(schedule_id)}, {"$set": {"status": "approved"}})
    return serialize(await db[SCHEDULES].find_one({"_id": oid(schedule_id)}))


@router.post("/schedules/{schedule_id}/reject")
async def reject_schedule(schedule_id: str, user: dict = Depends(require_roles("dokter"))):
    db = get_db()
    doc = await db[SCHEDULES].find_one({"_id": oid(schedule_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan.")
    if doc.get("doctor_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Anda tidak memiliki akses ke jadwal ini.")
    await db[SCHEDULES].update_one({"_id": oid(schedule_id)}, {"$set": {"status": "rejected"}})
    return serialize(await db[SCHEDULES].find_one({"_id": oid(schedule_id)}))


# ---------- Appointments (untuk kalender dokter) ----------

@router.get("/appointments")
async def my_appointments(user: dict = Depends(require_roles("dokter"))):
    """Semua appointment pasien untuk dokter ini (untuk tampilan kalender)."""
    docs = await get_db()[APPOINTMENTS].find({"doctor_id": user["id"]}) \
        .sort("date", 1).to_list(1000)
    return [serialize(d) for d in docs]


# ---------- Daftar pasien dokter (agregasi dari kasus) ----------

@router.get("/patients")
async def my_patients(user: dict = Depends(require_roles("dokter"))):
    """Pasien yang punya kasus untuk dokter ini, dengan jumlah kasus & kasus terakhir."""
    cursor = get_db()[CASES].find(
        {"doctor_id": user["id"]},
        {"patient_id": 1, "patient_name": 1, "submitted_at": 1, "status": 1},
    ).sort("submitted_at", -1)
    by: dict = {}
    async for c in cursor:
        pid = c.get("patient_id")
        if not pid:
            continue
        if pid not in by:
            by[pid] = {
                "patient_id": pid,
                "patient_name": c.get("patient_name"),
                "case_count": 0,
                "last_submitted_at": c.get("submitted_at").isoformat() if c.get("submitted_at") else None,
                "last_status": c.get("status"),
            }
        by[pid]["case_count"] += 1
    return list(by.values())


# ---------- Riwayat pasien (kasus sebelumnya) ----------

@router.get("/patients/{patient_id}/history")
async def patient_history(patient_id: str, user: dict = Depends(require_roles("dokter"))):
    """Kasus screening pasien sebelumnya (untuk konteks dokter saat review)."""
    docs = await get_db()[CASES].find({"patient_id": patient_id}) \
        .sort("submitted_at", -1).to_list(100)
    out = []
    for c in docs:
        c = serialize(c)
        ai = c.get("ai_result") or {}
        dr = c.get("doctor_result") or {}
        out.append({
            "id": c["id"],
            "submitted_at": c.get("submitted_at"),
            "reviewed_at": c.get("reviewed_at"),
            "status": c.get("status"),
            "ai_label": ai.get("label"),
            "ai_grade": ai.get("grade"),
            "final_diagnosis": dr.get("final_diagnosis"),
        })
    return out


def _summary(c: dict) -> dict:
    ai = c.get("ai_result") or {}
    return {
        "id": c["id"],
        "patient_name": c.get("patient_name"),
        "submitted_at": c.get("submitted_at"),
        "status": c.get("status"),
        "ai_label": ai.get("label"),
        "ai_grade": ai.get("grade"),
        "ai_confidence": ai.get("confidence"),
    }
