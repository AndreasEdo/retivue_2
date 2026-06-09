"""
Upload gambar ke Cloudinary. Kalau Cloudinary belum dikonfigurasi (.env kosong),
fallback ke data URI base64 (disimpan langsung) supaya app tetap jalan untuk dev.
"""

import base64
import logging

import cloudinary
import cloudinary.uploader

from .config import settings

logger = logging.getLogger("retivue")

_configured = False


def _ensure_config():
    global _configured
    if _configured:
        return
    if settings.cloudinary_configured:
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=True,
        )
        _configured = True


def upload_image(data: bytes, folder: str = "retivue", public_id: str | None = None,
                 content_type: str = "image/png") -> str:
    """
    Upload bytes gambar -> return URL.
    Tanpa Cloudinary -> kembalikan data URI base64 (fallback dev).
    """
    if settings.cloudinary_configured:
        _ensure_config()
        try:
            res = cloudinary.uploader.upload(
                data, folder=folder, public_id=public_id, resource_type="image",
            )
            return res["secure_url"]
        except Exception as e:
            logger.error("Cloudinary upload gagal, fallback base64: %s", e)

    b64 = base64.b64encode(data).decode("ascii")
    return f"data:{content_type};base64,{b64}"


def upload_data_uri(data_uri: str, folder: str = "retivue", public_id: str | None = None) -> str:
    """Upload gambar yang sudah berbentuk data URI (mis. hasil Grad-CAM/Ben Graham)."""
    if settings.cloudinary_configured:
        _ensure_config()
        try:
            res = cloudinary.uploader.upload(
                data_uri, folder=folder, public_id=public_id, resource_type="image",
            )
            return res["secure_url"]
        except Exception as e:
            logger.error("Cloudinary upload (data uri) gagal, simpan apa adanya: %s", e)
    return data_uri  # fallback: simpan data URI langsung
