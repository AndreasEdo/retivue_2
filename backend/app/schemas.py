"""Pydantic response models untuk dokumentasi OpenAPI / validasi output."""

from typing import List, Optional
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    mode: Optional[str] = None


class PredictResponse(BaseModel):
    grade: int
    label: str
    raw_score: float
    confidence: float
    thresholds: List[float]
    ben_graham_image: str
    disclaimer: str
    # Hanya terisi saat mode ensemble.
    n_folds: Optional[int] = None
    fold_scores: Optional[List[float]] = None


class ExplainResponse(BaseModel):
    gradcam_image: str
    method: str
    note: str
