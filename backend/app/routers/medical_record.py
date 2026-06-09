"""
Endpoint Medical Record / Laboran:
- pilih pasien, input data pendukung + upload retina, jalankan AI, kirim ke dokter
- lihat riwayat submission & kasus yang di-reject (untuk upload ulang)
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from ..db import get_db, USERS, CASES
from ..security import require_roles
from ..state import STATE
from ..ai_runner import run_full_ai
from ..utils import serialize, oid, now_utc

router = APIRouter(prefix="/mr", tags=["medical_record"],
                   dependencies=[Depends(require_roles("medical_record"))])


@router.get("/patients")
async def list_patients():
    docs = await get_db()[USERS].find({"role": "pasien"}).sort("name", 1).to_list(1000)
    return [serialize(d) for d in docs]


@router.get("/doctors")
async def list_doctors():
    docs = await get_db()[USERS].find({"role": "dokter", "status": "active"}).to_list(200)
    return [serialize(d) for d in docs]


@router.get("/dashboard")
async def dashboard():
    db = get_db()
    submitted = await db[CASES].count_documents({})
    waiting = await db[CASES].count_documents({"status": "waiting"})
    approved = await db[CASES].count_documents({"status": "approved"})
    rejected = await db[CASES].count_documents({"status": "rejected"})
    recent = await db[CASES].find({}).sort("submitted_at", -1).limit(10).to_list(10)
    return {
        "submitted": submitted, "waiting": waiting, "approved": approved, "rejected": rejected,
        "recent": [_case_summary(serialize(c)) for c in recent],
    }


@router.post("/submissions", status_code=201)
async def create_submission(
    patient_id: str = Form(...),
    doctor_id: str = Form(...),
    age: int = Form(None),
    gender: str = Form(None),
    weight: float = Form(None),
    height: float = Form(None),
    blood_pressure: str = Form(None),
    has_diabetes: bool = Form(False),
    diabetes_duration: int = Form(None),
    file: UploadFile = File(...),
    user: dict = Depends(require_roles("medical_record")),
):
    if STATE["models"] is None:
        raise HTTPException(status_code=503, detail="Model AI belum siap.")
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="File harus gambar.")
    data = file.file.read()
    if not data:
        raise HTTPException(status_code=422, detail="File kosong.")

    db = get_db()
    patient = await db[USERS].find_one({"_id": oid(patient_id), "role": "pasien"})
    if not patient:
        raise HTTPException(status_code=404, detail="Pasien tidak ditemukan.")
    doctor = await db[USERS].find_one({"_id": oid(doctor_id), "role": "dokter"})
    if not doctor:
        raise HTTPException(status_code=404, detail="Dokter tidak ditemukan.")

    # Jalankan AI (Ben Graham + score->grade + Grad-CAM) + upload gambar.
    try:
        ai = run_full_ai(data, STATE["models"], STATE["thresholds"])
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    case = {
        "patient_id": patient_id, "patient_name": patient["name"],
        "doctor_id": doctor_id, "doctor_name": doctor["name"],
        "submitted_by": user["name"], "submitted_by_id": user["id"],
        "submitted_at": now_utc(), "status": "waiting",
        "patient_data": {
            "age": age, "gender": gender, "weight": weight, "height": height,
            "blood_pressure": blood_pressure, "has_diabetes": has_diabetes,
            "diabetes_duration": diabetes_duration,
        },
        "ai_result": ai["ai_result"],
        "images": ai["images"],
        "doctor_result": None,
    }
    res = await db[CASES].insert_one(case)
    case["_id"] = res.inserted_id
    return serialize(case)


@router.get("/submissions")
async def submission_history(user: dict = Depends(require_roles("medical_record"))):
    docs = await get_db()[CASES].find({}).sort("submitted_at", -1).to_list(500)
    return [_case_summary(serialize(c)) for c in docs]


@router.get("/submissions/rejected")
async def rejected_cases(user: dict = Depends(require_roles("medical_record"))):
    docs = await get_db()[CASES].find({"status": "rejected"}).sort("reviewed_at", -1).to_list(200)
    return [serialize(c) for c in docs]


@router.get("/submissions/{case_id}")
async def submission_detail(case_id: str):
    doc = await get_db()[CASES].find_one({"_id": oid(case_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Kasus tidak ditemukan.")
    return serialize(doc)


@router.post("/submissions/{case_id}/resubmit")
async def resubmit(case_id: str, file: UploadFile = File(...),
                   user: dict = Depends(require_roles("medical_record"))):
    """Upload ulang gambar untuk kasus yang di-reject -> AI ulang -> status kembali waiting."""
    if STATE["models"] is None:
        raise HTTPException(status_code=503, detail="Model AI belum siap.")
    db = get_db()
    doc = await db[CASES].find_one({"_id": oid(case_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Kasus tidak ditemukan.")
    if doc.get("status") != "rejected":
        raise HTTPException(status_code=400, detail="Hanya kasus rejected yang bisa di-upload ulang.")
    data = file.file.read()
    if not data:
        raise HTTPException(status_code=422, detail="File kosong.")
    ai = run_full_ai(data, STATE["models"], STATE["thresholds"])
    await db[CASES].update_one({"_id": oid(case_id)}, {"$set": {
        "ai_result": ai["ai_result"], "images": ai["images"],
        "status": "waiting", "doctor_result": None,
        "resubmitted_at": now_utc(),
    }})
    return serialize(await db[CASES].find_one({"_id": oid(case_id)}))


def _case_summary(c: dict) -> dict:
    ai = c.get("ai_result") or {}
    return {
        "id": c["id"],
        "patient_name": c.get("patient_name"),
        "patient_id": c.get("patient_id"),
        "doctor_name": c.get("doctor_name"),
        "submitted_at": c.get("submitted_at"),
        "status": c.get("status"),
        "ai_label": ai.get("label"),
        "ai_grade": ai.get("grade"),
        "ai_confidence": ai.get("confidence"),
    }
