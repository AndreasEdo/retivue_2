"""Auth: login (semua role), register (khusus pasien), profil current user."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from ..db import get_db, USERS
from ..security import (
    hash_password, verify_password, create_access_token, get_current_user,
)
from ..schemas import LoginResponse, UserOut, PatientRegister

router = APIRouter(prefix="/auth", tags=["auth"])


def _to_user_out(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id")) if "_id" in doc else doc.get("id")
    doc.pop("password", None)
    return doc


@router.post("/login", response_model=LoginResponse)
async def login(form: OAuth2PasswordRequestForm = Depends()):
    # OAuth2 form: field 'username' dipakai untuk email.
    db = get_db()
    user = await db[USERS].find_one({"email": form.username.lower().strip()})
    if not user or not verify_password(form.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Email atau password salah.")
    if user.get("status") == "inactive":
        raise HTTPException(status_code=403, detail="Akun dinonaktifkan. Hubungi admin.")

    uid = str(user["_id"])
    token = create_access_token(sub=uid, role=user["role"], name=user["name"])
    return {"access_token": token, "token_type": "bearer", "user": _to_user_out(user)}


@router.post("/register", response_model=LoginResponse, status_code=201)
async def register_patient(body: PatientRegister):
    """Registrasi mandiri hanya untuk PASIEN (sesuai konteks_2.md)."""
    db = get_db()
    email = body.email.lower().strip()
    if await db[USERS].find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email sudah terdaftar.")

    doc = {
        "email": email,
        "name": body.name,
        "role": "pasien",
        "status": "active",
        "password": hash_password(body.password),
        "phone": body.phone,
        "age": body.age,
        "gender": body.gender,
        "created_at": datetime.now(timezone.utc),
    }
    res = await db[USERS].insert_one(doc)
    doc["_id"] = res.inserted_id
    token = create_access_token(sub=str(res.inserted_id), role="pasien", name=body.name)
    return {"access_token": token, "token_type": "bearer", "user": _to_user_out(doc)}


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return user
