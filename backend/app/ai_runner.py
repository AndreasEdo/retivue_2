"""
Jalankan pipeline AI lengkap untuk satu gambar fundus dan hasilkan struktur
`ai_result` + URL gambar (original, Ben Graham, Grad-CAM) siap disimpan ke DB.

AI tetap memakai kontrak CLAUDE.md: Ben Graham preprocessing, model regresi
(score -> grade via thresholds), Grad-CAM. "Probability per class" diturunkan
sebagai perkiraan halus dari skor regresi (model bukan klasifikasi) — untuk
keperluan tampilan; grade/score/confidence/Grad-CAM adalah nilai asli model.
"""

import math

from .inference import predict, score_to_grade, confidence_from_score
from .explain import explain
from .model import DR_CLASS_NAMES
from .cloudinary_util import upload_image, upload_data_uri
from .preprocessing import decode_bgr, is_likely_fundus

RECOMMENDATIONS = {
    0: "No diabetic retinopathy detected. Continue routine annual screening.",
    1: "Mild diabetic retinopathy detected. Regular monitoring recommended.",
    2: "Moderate diabetic retinopathy detected. Ophthalmologist consultation advised.",
    3: "Severe diabetic retinopathy detected. Prompt ophthalmologist consultation required.",
    4: "Proliferative diabetic retinopathy detected. Urgent intervention required.",
}


def _soft_probabilities(score: float, sigma: float = 0.6) -> dict:
    """
    Distribusi perkiraan per kelas dari skor regresi: bobot gaussian di sekitar
    skor untuk tiap pusat kelas 0..4, lalu dinormalisasi. Bukan probabilitas
    kalibrasi — hanya representasi visual seberapa dekat skor ke tiap kelas.
    """
    weights = [math.exp(-((score - k) ** 2) / (2 * sigma ** 2)) for k in range(5)]
    total = sum(weights) or 1.0
    return {DR_CLASS_NAMES[k]: round(weights[k] / total, 4) for k in range(5)}


def run_full_ai(image_bytes: str, models, thresholds, public_id: str | None = None) -> dict:
    """
    Returns dict:
      {
        "ai_result": {grade, label, predicted_class, raw_score, confidence,
                      thresholds, probabilities, recommendation},
        "images": {original_url, ben_graham_url, gradcam_url}
      }
    """
    # 0. Validasi: tolak gambar yang jelas bukan foto fundus retina.
    if not is_likely_fundus(decode_bgr(image_bytes)):
        raise ValueError(
            "The uploaded image does not appear to be a retinal fundus photograph. "
            "Please upload a valid fundus image."
        )

    # 1. Prediksi (grade, score, confidence, gambar Ben Graham base64)
    pred = predict(image_bytes, models, thresholds)
    grade = pred["grade"]
    score = pred["raw_score"]

    # 2. Grad-CAM (data URI)
    try:
        cam = explain(image_bytes, models[0])
        gradcam_uri = cam["gradcam_image"]
    except Exception:
        gradcam_uri = None

    # 3. Upload gambar -> URL (atau fallback base64)
    original_url = upload_image(image_bytes, folder="retivue/original",
                                public_id=public_id, content_type="image/jpeg")
    ben_url = upload_data_uri(pred["ben_graham_image"], folder="retivue/ben_graham",
                              public_id=(public_id + "_ben") if public_id else None)
    gradcam_url = (
        upload_data_uri(gradcam_uri, folder="retivue/gradcam",
                        public_id=(public_id + "_cam") if public_id else None)
        if gradcam_uri else None
    )

    ai_result = {
        "grade": grade,
        "label": pred["label"],
        "predicted_class": pred["label"],
        "raw_score": score,
        "confidence": pred["confidence"],
        "thresholds": pred["thresholds"],
        "probabilities": _soft_probabilities(score),
        "recommendation": RECOMMENDATIONS.get(grade, ""),
    }
    return {
        "ai_result": ai_result,
        "images": {
            "original_url": original_url,
            "ben_graham_url": ben_url,
            "gradcam_url": gradcam_url,
        },
    }
