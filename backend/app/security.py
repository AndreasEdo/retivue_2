"""
Keamanan: hash password (bcrypt) + JWT + dependency current-user / role guard.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from .config import settings
from .db import get_db, USERS

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Role yang dikenali sistem (sesuai konteks_2.md).
ROLES = {"admin", "medical_record", "dokter", "pasien"}


# ----------------- password -----------------
def hash_password(password: str) -> str:
    # bcrypt batas 72 byte; encode dulu lalu hash.
    pw = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8")[:72], hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


# ----------------- JWT -----------------
def create_access_token(sub: str, role: str, name: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": sub, "role": role, "name": name, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau kadaluarsa.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("sub")
        if not user_id:
            raise cred_exc
    except JWTError:
        raise cred_exc

    from bson import ObjectId
    try:
        doc = await get_db()[USERS].find_one({"_id": ObjectId(user_id)})
    except Exception:
        doc = None
    if not doc:
        raise cred_exc
    if doc.get("status") == "inactive":
        raise HTTPException(status_code=403, detail="Akun dinonaktifkan.")
    doc["id"] = str(doc.pop("_id"))
    doc.pop("password", None)
    return doc


def require_roles(*allowed: str):
    """Dependency: pastikan current user punya salah satu role yang diizinkan."""
    async def _dep(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in allowed:
            raise HTTPException(status_code=403, detail="Akses ditolak untuk role ini.")
        return user
    return _dep
