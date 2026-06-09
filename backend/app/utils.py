"""Helper kecil: serialisasi dokumen Mongo & validasi ObjectId."""

from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException


def oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="ID tidak valid.")


def serialize(doc: dict | None) -> dict | None:
    """ObjectId -> str, _id -> id, datetime -> ISO. Buang password."""
    if doc is None:
        return None
    out = {}
    for k, v in doc.items():
        if k == "_id":
            out["id"] = str(v)
        elif k == "password":
            continue
        elif isinstance(v, ObjectId):
            out[k] = str(v)
        elif isinstance(v, datetime):
            out[k] = v.isoformat()
        elif isinstance(v, dict):
            out[k] = serialize(v)
        else:
            out[k] = v
    return out


def now_utc() -> datetime:
    return datetime.now(timezone.utc)
