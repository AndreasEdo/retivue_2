"""
FastAPI app RetiVue — inference DR + XAI.

Endpoint:
  GET  /health   -> liveness + status model
  POST /predict  -> grade DR + skor + gambar Ben Graham
  POST /explain  -> heatmap Grad-CAM (XAI)

Model di-load SEKALI saat startup (lifespan), disimpan di state global.
"""

import os
import glob
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .model import load_models, warmup
from .inference import predict
from .explain import explain
from .schemas import HealthResponse, PredictResponse, ExplainResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("retivue")

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

# Ensemble OFF secara default (single fold = cepat & ringan, sesuai CLAUDE.md).
# Nyalakan dengan env ENSEMBLE=true/1/yes untuk rata-rata semua fold yang ada.
ENSEMBLE = os.environ.get("ENSEMBLE", "").strip().lower() in {"1", "true", "yes", "on"}

# Origin frontend yang diizinkan. Override via env CORS_ORIGINS (comma-separated).
DEFAULT_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
CORS_ORIGINS = os.environ.get("CORS_ORIGINS")
if CORS_ORIGINS:
    ALLOWED_ORIGINS = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]
else:
    # Untuk demo: izinkan semua origin agar Vercel preview/prod langsung jalan.
    ALLOWED_ORIGINS = ["*"]

# State global. `models` = list (1 fold untuk single, N untuk ensemble).
STATE = {"models": None, "thresholds": None, "mode": None}


def _all_checkpoints():
    """Semua checkpoint fold yang ada, urut (fold1, fold2, ...)."""
    return sorted(glob.glob(os.path.join(MODELS_DIR, "swinv2_best_fold*.pth")))


def _select_checkpoints():
    """
    Tentukan checkpoint mana yang di-load berdasarkan konfigurasi.

    - ENSEMBLE=true  -> semua fold yang ada.
    - selain itu     -> single fold (MODEL_CHECKPOINT kalau di-set, else fold1, else fold pertama).
    """
    available = _all_checkpoints()
    if not available:
        raise FileNotFoundError(
            f"Tidak ada checkpoint .pth di {os.path.abspath(MODELS_DIR)}. "
            "Taruh swinv2_best_fold*.pth di backend/models/."
        )

    if ENSEMBLE:
        return available

    preferred = os.environ.get("MODEL_CHECKPOINT")
    if preferred and os.path.exists(preferred):
        return [preferred]

    fold1 = os.path.join(MODELS_DIR, "swinv2_best_fold1.pth")
    return [fold1] if os.path.exists(fold1) else [available[0]]


@asynccontextmanager
async def lifespan(app: FastAPI):
    ckpts = _select_checkpoints()
    mode = f"ensemble ({len(ckpts)} fold)" if len(ckpts) > 1 else "single fold"
    logger.info("Mode: %s. Memuat: %s", mode, [os.path.basename(c) for c in ckpts])
    models, thresholds = load_models(ckpts)
    warmup(models)
    STATE["models"] = models
    STATE["thresholds"] = thresholds
    STATE["mode"] = mode
    logger.info("Model siap (%s). Thresholds: %s", mode, thresholds)
    yield
    STATE["models"] = None
    STATE["thresholds"] = None
    STATE["mode"] = None


app = FastAPI(title="RetiVue API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _read_image_bytes(file: UploadFile) -> bytes:
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=422,
            detail=f"File must be an image, received: {file.content_type}.",
        )
    data = file.file.read()
    if not data:
        raise HTTPException(status_code=422, detail="File is empty.")
    return data


@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        model_loaded=STATE["models"] is not None,
        mode=STATE["mode"],
    )


@app.post("/predict", response_model=PredictResponse)
def predict_endpoint(file: UploadFile = File(...)):
    if STATE["models"] is None:
        raise HTTPException(status_code=503, detail="Model is not ready yet.")
    data = _read_image_bytes(file)
    try:
        result = predict(data, STATE["models"], STATE["thresholds"])
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return result


@app.post("/explain", response_model=ExplainResponse)
def explain_endpoint(file: UploadFile = File(...)):
    if STATE["models"] is None:
        raise HTTPException(status_code=503, detail="Model is not ready yet.")
    data = _read_image_bytes(file)
    try:
        # Grad-CAM cukup satu model (fold pertama) — heatmap hanya butuh satu peta fokus.
        result = explain(data, STATE["models"][0])
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return result
