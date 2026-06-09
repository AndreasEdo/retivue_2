"""
Jalur inferensi /predict: bytes gambar -> skor regresi -> grade DR.

Mereplikasi predict_single_image() di notebook secara persis (preprocessing,
forward, thresholding).
"""

import base64
import cv2
import numpy as np
import torch

from .model import DR_CLASS_NAMES
from .preprocessing import preprocess_bytes

DISCLAIMER = (
    "This result is a triage aid, not a final diagnosis. "
    "The final decision remains with the ophthalmologist."
)


def score_to_grade(score, t):
    """
    Konversi skor kontinu -> kelas DR diskrit pakai threshold checkpoint.
    Sama persis dengan apply_threshold()/OptimizedRounder di notebook.
        score < t0        -> 0
        t0 <= score < t1  -> 1
        t1 <= score < t2  -> 2
        t2 <= score < t3  -> 3
        score >= t3       -> 4
    """
    if score < t[0]:
        return 0
    elif score < t[1]:
        return 1
    elif score < t[2]:
        return 2
    elif score < t[3]:
        return 3
    else:
        return 4


def confidence_from_score(score, grade, t):
    """
    Estimasi 'confidence' sederhana berbasis jarak skor ke threshold terdekat.
    Bukan probabilitas kalibrasi — hanya sinyal seberapa jauh skor dari batas
    keputusan (semakin jauh dari threshold, semakin yakin grade-nya).
    Nilai [0,1].
    """
    edges = [-np.inf] + list(t) + [np.inf]
    lo, hi = edges[grade], edges[grade + 1]
    # jarak ke batas terdekat dari bin grade saat ini
    dists = []
    if np.isfinite(lo):
        dists.append(abs(score - lo))
    if np.isfinite(hi):
        dists.append(abs(score - hi))
    if not dists:
        return 1.0
    nearest = min(dists)
    # 0.5 jarak unit -> ~konfiden penuh; di tepi -> ~0.5
    return float(min(1.0, 0.5 + nearest))


def encode_rgb_to_base64_png(rgb_image):
    """RGB uint8 -> data URI PNG base64 (untuk dikirim ke frontend)."""
    bgr = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2BGR)
    ok, buf = cv2.imencode(".png", bgr)
    if not ok:
        raise RuntimeError("Gagal encode gambar ke PNG.")
    b64 = base64.b64encode(buf.tobytes()).decode("ascii")
    return f"data:image/png;base64,{b64}"


def predict(image_bytes, models, thresholds):
    """
    Prediksi grade DR untuk satu gambar fundus.

    `models` = list model. Single fold -> list 1 elemen. Ensemble -> N fold,
    skor di-rata-ratakan (sama seperti ensemble_predict di notebook), lalu
    di-threshold pakai `thresholds` (rata-rata threshold antar-fold saat ensemble).

    Returns dict siap dijadikan response /predict.
    """
    ben_rgb, tensor = preprocess_bytes(image_bytes)

    with torch.no_grad():
        fold_scores = [float(m(tensor).item()) for m in models]
    raw_score = float(np.mean(fold_scores))

    grade = score_to_grade(raw_score, thresholds)
    confidence = confidence_from_score(raw_score, grade, thresholds)

    result = {
        "grade": grade,
        "label": DR_CLASS_NAMES[grade],
        "raw_score": round(raw_score, 4),
        "confidence": round(confidence, 4),
        "thresholds": [round(float(x), 4) for x in thresholds],
        "ben_graham_image": encode_rgb_to_base64_png(ben_rgb),
        "disclaimer": DISCLAIMER,
    }
    if len(models) > 1:
        result["n_folds"] = len(models)
        result["fold_scores"] = [round(s, 4) for s in fold_scores]
    return result
