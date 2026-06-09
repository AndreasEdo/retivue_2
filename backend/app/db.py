"""Koneksi MongoDB (motor, async)."""

from motor.motor_asyncio import AsyncIOMotorClient

from .config import settings

_client: AsyncIOMotorClient | None = None


def connect():
    global _client
    _client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=8000)
    return _client


def close():
    global _client
    if _client is not None:
        _client.close()
        _client = None


def get_db():
    if _client is None:
        raise RuntimeError("MongoDB belum terkoneksi. Panggil connect() saat startup.")
    return _client[settings.db_name]


# Nama koleksi terpusat agar konsisten.
USERS = "users"
PATIENTS = "patients"          # profil medis pasien (data klinis)
SCHEDULES = "schedules"        # jadwal praktik dokter
APPOINTMENTS = "appointments"
CASES = "cases"                # pemeriksaan/screening + workflow status
