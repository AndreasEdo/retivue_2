"""
FastAPI app RetiVue — telemedicine DR screening (multi-role) + AI.

Startup (lifespan):
  - load model AI (single fold / ensemble)
  - connect MongoDB
  - seed akun demo (kalau diaktifkan)
"""

import os
import glob
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .model import load_models, warmup
from .state import STATE
from . import db as database
from .seed import run_seed
from .schemas import HealthResponse
from .routers import auth as auth_router
from .routers import ai as ai_router
from .routers import admin as admin_router
from .routers import patient as patient_router
from .routers import medical_record as mr_router
from .routers import doctor as doctor_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("retivue")

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def _select_checkpoints():
    available = sorted(glob.glob(os.path.join(MODELS_DIR, "swinv2_best_fold*.pth")))
    if not available:
        raise FileNotFoundError(
            f"Tidak ada checkpoint .pth di {os.path.abspath(MODELS_DIR)}."
        )
    if settings.ensemble:
        return available
    fold1 = os.path.join(MODELS_DIR, "swinv2_best_fold1.pth")
    return [fold1] if os.path.exists(fold1) else [available[0]]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- AI model ---
    ckpts = _select_checkpoints()
    mode = f"ensemble ({len(ckpts)} fold)" if len(ckpts) > 1 else "single fold"
    logger.info("Memuat model: %s (%s)", [os.path.basename(c) for c in ckpts], mode)
    models, thresholds = load_models(ckpts)
    warmup(models)
    STATE.update(models=models, thresholds=thresholds, mode=mode)
    logger.info("Model siap (%s).", mode)

    # --- MongoDB ---
    database.connect()
    try:
        await database.get_db().command("ping")
        logger.info("MongoDB terkoneksi: db=%s", settings.db_name)
        await run_seed()
    except Exception as e:
        logger.error("MongoDB GAGAL koneksi: %s", e)

    yield

    database.close()
    STATE.update(models=None, thresholds=None, mode=None)


app = FastAPI(title="RetiVue API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(ai_router.router)
app.include_router(admin_router.router)
app.include_router(patient_router.router)
app.include_router(mr_router.router)
app.include_router(doctor_router.router)


@app.get("/health", response_model=HealthResponse)
async def health():
    db_ok = False
    try:
        await database.get_db().command("ping")
        db_ok = True
    except Exception:
        db_ok = False
    return HealthResponse(
        status="ok",
        model_loaded=STATE["models"] is not None,
        mode=STATE["mode"],
        db_connected=db_ok,
    )
