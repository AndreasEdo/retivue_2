# RetiVue backend — FastAPI + PyTorch (CPU) untuk Hugging Face Spaces.
# HF Spaces Docker mengharapkan app listen di port 7860.

FROM python:3.11-slim

# Dependensi sistem minimal untuk opencv-headless (libGL tidak perlu untuk headless,
# tapi libglib2.0 kadang dibutuhkan oleh beberapa wheel).
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
# Install CPU-only torch DULU dari index CPU (pakai --index-url, bukan --extra-index-url,
# supaya pip TIDAK menarik wheel CUDA ~2.5GB dari PyPI yang bikin build gagal).
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
# Sisanya dari PyPI (torch sudah terpenuhi, jadi dilewati).
RUN pip install --no-cache-dir -r requirements.txt

# Kode aplikasi + bobot model.
COPY app ./app
COPY models ./models

# HF Spaces: port 7860.
EXPOSE 7860

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
