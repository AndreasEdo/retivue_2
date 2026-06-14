"""
Seed akun demo (semua role) + data contoh ringan (jadwal dokter) saat startup.
Idempotent: hanya membuat kalau belum ada (cek by email).
"""

import logging
from datetime import datetime, timezone

from .config import settings
from .db import get_db, USERS, SCHEDULES
from .security import hash_password

logger = logging.getLogger("retivue")

# Akun demo: email -> (name, role, extra)
DEMO_USERS = [
    ("admin@gmail.com", "Admin Sarah", "admin", {}),
    ("dokter@gmail.com", "Dr. Budi Santoso", "dokter",
     {"specialty": "Ophthalmologist", "title": "Sp.M"}),
    ("mr@gmail.com", "Rina Kusuma", "medical_record", {}),
    ("pasien@gmail.com", "John Doe", "pasien",
     {"phone": "081234567890", "age": 45, "gender": "Male"}),
]

# Migrasi email akun demo lama (@retivue.com) -> baru (@gmail.com).
# Rename in-place agar _id (dan semua referensi schedule/case/appointment) tetap.
EMAIL_MIGRATION = {
    "admin@retivue.com": "admin@gmail.com",
    "dokter@retivue.com": "dokter@gmail.com",
    "mr@retivue.com": "mr@gmail.com",
    "pasien@retivue.com": "pasien@gmail.com",
}


async def run_seed():
    if not settings.seed_demo:
        return
    db = get_db()
    now = datetime.now(timezone.utc)

    # Index unik email (abaikan kalau sudah ada).
    try:
        await db[USERS].create_index("email", unique=True)
    except Exception:
        pass

    # Migrasi email lama -> baru (kalau yang lama ada & yang baru belum ada).
    migrated = []
    for old, new in EMAIL_MIGRATION.items():
        if await db[USERS].find_one({"email": old}) and not await db[USERS].find_one({"email": new}):
            await db[USERS].update_one({"email": old}, {"$set": {"email": new}})
            migrated.append(f"{old} -> {new}")
    if migrated:
        logger.info("Migrasi email akun demo: %s", migrated)

    created = []
    for email, name, role, extra in DEMO_USERS:
        existing = await db[USERS].find_one({"email": email})
        if existing:
            continue
        doc = {
            "email": email,
            "name": name,
            "role": role,
            "status": "active",
            "password": hash_password(settings.seed_password),
            "created_at": now,
            **extra,
        }
        await db[USERS].insert_one(doc)
        created.append(f"{role}:{email}")

    if created:
        logger.info("Seed akun demo dibuat: %s (password: %s)", created, settings.seed_password)

    # Seed beberapa jadwal dokter contoh kalau koleksi masih kosong.
    if await db[SCHEDULES].count_documents({}) == 0:
        dokter = await db[USERS].find_one({"role": "dokter"})
        if dokter:
            doc_id = str(dokter["_id"])
            samples = [
                {"date": "2026-06-15", "start_time": "09:00", "end_time": "12:00", "quota": 10},
                {"date": "2026-06-15", "start_time": "14:00", "end_time": "17:00", "quota": 10},
                {"date": "2026-06-16", "start_time": "09:00", "end_time": "12:00", "quota": 8},
            ]
            for s in samples:
                await db[SCHEDULES].insert_one({
                    "doctor_id": doc_id,
                    "doctor_name": dokter["name"],
                    "booked": 0,
                    "status": "approved",   # contoh langsung bisa di-booking pasien
                    "created_at": now,
                    **s,
                })
            logger.info("Seed %d jadwal dokter contoh.", len(samples))
