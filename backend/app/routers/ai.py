"""Endpoint AI mentah: /predict & /explain (dipakai untuk uji cepat / debugging).

Alur produksi (medical record) memanggil fungsi inference langsung, bukan lewat
endpoint ini — lihat routers/medical_record.py.
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends

from ..inference import predict
from ..explain import explain
from ..schemas import PredictResponse, ExplainResponse
from ..state import STATE
from ..security import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])


def _read_image_bytes(file: UploadFile) -> bytes:
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail=f"File must be an image, received: {file.content_type}.")
    data = file.file.read()
    if not data:
        raise HTTPException(status_code=422, detail="File is empty.")
    return data


@router.post("/predict", response_model=PredictResponse)
def predict_endpoint(file: UploadFile = File(...), _: dict = Depends(get_current_user)):
    if STATE["models"] is None:
        raise HTTPException(status_code=503, detail="Model is not ready yet.")
    data = _read_image_bytes(file)
    try:
        return predict(data, STATE["models"], STATE["thresholds"])
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/explain", response_model=ExplainResponse)
def explain_endpoint(file: UploadFile = File(...), _: dict = Depends(get_current_user)):
    if STATE["models"] is None:
        raise HTTPException(status_code=503, detail="Model is not ready yet.")
    data = _read_image_bytes(file)
    try:
        return explain(data, STATE["models"][0])
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
