"""Endpoint Admin: kelola user (dokter/medical record), pasien, jadwal, monitoring."""

from fastapi import APIRouter, Depends, HTTPException

from ..db import get_db, USERS, SCHEDULES, CASES, APPOINTMENTS
from ..security import require_roles, hash_password
from ..schemas import StaffCreate, ScheduleCreate, UserUpdate
from ..utils import serialize, oid, now_utc, compute_age

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_roles("admin"))])


# ---------- Users (staff: dokter & medical record) ----------
@router.get("/users")
async def list_users(role: str | None = None):
    q = {}
    if role:
        q["role"] = role
    else:
        q["role"] = {"$in": ["dokter", "medical_record"]}
    docs = await get_db()[USERS].find(q).sort("created_at", -1).to_list(500)
    return [serialize(d) for d in docs]


@router.post("/users", status_code=201)
async def create_staff(body: StaffCreate):
    if body.role not in ("dokter", "medical_record"):
        raise HTTPException(status_code=400, detail="Role harus 'dokter' atau 'medical_record'.")
    db = get_db()
    email = body.email.lower().strip()
    if await db[USERS].find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email sudah terdaftar.")
    doc = {
        "email": email, "name": body.name, "role": body.role, "status": "active",
        "password": hash_password(body.password), "created_at": now_utc(),
    }
    if body.role == "dokter":
        doc["specialty"] = body.specialty or "Ophthalmologist"
        doc["title"] = body.title or "Sp.M"
    res = await db[USERS].insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize(doc)


@router.patch("/users/{user_id}/status")
async def set_user_status(user_id: str, active: bool):
    db = get_db()
    res = await db[USERS].update_one(
        {"_id": oid(user_id)}, {"$set": {"status": "active" if active else "inactive"}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")
    return {"ok": True, "status": "active" if active else "inactive"}


@router.patch("/users/{user_id}")
async def update_user(user_id: str, body: UserUpdate):
    """Edit data user (staff atau pasien). Hanya field yang dikirim yang diubah."""
    db = get_db()
    fields = body.model_dump(exclude_none=True)
    if "date_of_birth" in fields:
        fields["age"] = compute_age(fields["date_of_birth"])
    if not fields:
        raise HTTPException(status_code=400, detail="Tidak ada field untuk diubah.")
    res = await db[USERS].update_one({"_id": oid(user_id)}, {"$set": fields})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")
    return serialize(await db[USERS].find_one({"_id": oid(user_id)}))


@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Hapus user (staff atau pasien)."""
    res = await get_db()[USERS].delete_one({"_id": oid(user_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")
    return {"ok": True}


@router.get("/patients")
async def list_patients():
    docs = await get_db()[USERS].find({"role": "pasien"}).sort("created_at", -1).to_list(1000)
    out = []
    for d in docs:
        s = serialize(d)
        age = compute_age(s.get("date_of_birth"))
        if age is not None:
            s["age"] = age
        out.append(s)
    return out


# ---------- Doctor schedules ----------
@router.get("/schedules")
async def list_schedules():
    docs = await get_db()[SCHEDULES].find({}).sort("date", 1).to_list(1000)
    return [serialize(d) for d in docs]


@router.post("/schedules", status_code=201)
async def create_schedule(body: ScheduleCreate):
    db = get_db()
    doctor = await db[USERS].find_one({"_id": oid(body.doctor_id), "role": "dokter"})
    if not doctor:
        raise HTTPException(status_code=404, detail="Dokter tidak ditemukan.")
    doc = {
        "doctor_id": body.doctor_id, "doctor_name": doctor["name"],
        "date": body.date, "start_time": body.start_time, "end_time": body.end_time,
        "quota": body.quota, "booked": 0, "status": "pending", "created_at": now_utc(),
    }
    res = await db[SCHEDULES].insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize(doc)


@router.delete("/schedules/{schedule_id}")
async def delete_schedule(schedule_id: str):
    res = await get_db()[SCHEDULES].delete_one({"_id": oid(schedule_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan.")
    return {"ok": True}


# ---------- Monitoring ----------
@router.get("/monitoring")
async def monitoring():
    db = get_db()
    total_patients = await db[USERS].count_documents({"role": "pasien"})
    active_doctors = await db[USERS].count_documents({"role": "dokter", "status": "active"})
    active_staff = await db[USERS].count_documents({"role": "medical_record", "status": "active"})
    total_screenings = await db[CASES].count_documents({})
    approved = await db[CASES].count_documents({"status": "approved"})
    waiting = await db[CASES].count_documents({"status": "waiting"})
    rejected = await db[CASES].count_documents({"status": "rejected"})

    # Distribusi per grade (dari kasus yang punya ai_result).
    dr_levels = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}
    async for c in db[CASES].find({"ai_result.grade": {"$exists": True}}, {"ai_result.grade": 1}):
        g = c.get("ai_result", {}).get("grade")
        if g in dr_levels:
            dr_levels[g] += 1

    recent = await db[CASES].find({}).sort("submitted_at", -1).limit(8).to_list(8)
    recent_activity = [
        {
            "id": str(c["_id"]),
            "message": f"Case #{str(c['_id'])[-4:]} — {c.get('status')} "
                       f"({c.get('patient_name','?')})",
            "time": c.get("submitted_at").isoformat() if c.get("submitted_at") else None,
        }
        for c in recent
    ]
    return {
        "total_patients": total_patients,
        "active_doctors": active_doctors,
        "active_staff": active_staff,
        "total_screenings": total_screenings,
        "approved": approved,
        "waiting": waiting,
        "rejected": rejected,
        "dr_levels": {str(k): v for k, v in dr_levels.items()},
        "recent_activity": recent_activity,
    }
