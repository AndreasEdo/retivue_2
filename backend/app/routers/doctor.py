"""
Endpoint Dokter: daftar kasus menunggu validasi, detail kasus (data+AI+Grad-CAM),
approve (final diagnosis + rekomendasi) / reject (note -> balik ke Medical Record).
"""

from fastapi import APIRouter, Depends, HTTPException

from ..db import get_db, CASES
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
