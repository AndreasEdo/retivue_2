# RetiVue 👁️

Alat skrining **triase Diabetic Retinopathy (DR)** berbasis AI untuk telemedicine
ASEAN. Tenaga kesehatan mengunggah foto fundus retina; model SwinV2 memprediksi
tingkat keparahan DR (grade 0–4) sebagai **alat bantu triase** — bukan diagnosis final.

> **Human-in-the-Loop.** RetiVue tidak pernah mengklaim diagnosis otonom. Setiap
> output disertai disclaimer bahwa keputusan akhir ada di tangan dokter mata.

## Grade DR

| Grade | Label |
|-------|-------|
| 0 | No DR |
| 1 | Mild |
| 2 | Moderate |
| 3 | Severe |
| 4 | Proliferative DR |

## Arsitektur

| Layer | Teknologi | Deploy |
|-------|-----------|--------|
| Frontend | React (Vite) | Vercel |
| Backend + Model | FastAPI + PyTorch (SwinV2) | Hugging Face Spaces (Docker) |

Model regresi (SwinV2-Base) menghasilkan skor kontinu [0–4], lalu dikonversi ke
grade diskrit pakai threshold yang tersimpan di checkpoint (Nelder-Mead, QWK).
5-fold OOF QWK = **0.9281**; demo memakai **single fold** (fold1).

## Struktur repo

```
retivue/
├── backend/      # FastAPI + model → HF Spaces  (lihat backend/README.md)
├── frontend/     # React (Vite)    → Vercel      (lihat frontend/README.md)
└── notebook/     # notebook training (referensi paritas)
```

## Quick start (lokal)

**1. Backend**
```bash
cd backend
pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
uvicorn app.main:app --reload --port 7860
```
Pastikan bobot ada di `backend/models/swinv2_best_fold1.pth`.

**2. Frontend** (terminal lain)
```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:7860
npm run dev               # http://localhost:5173
```

Buka http://localhost:5173, unggah gambar fundus, klik **Analisis**.

## Endpoint backend

- `GET /health` — liveness + status model
- `POST /predict` — grade + skor + gambar Ben Graham
- `POST /explain` — heatmap Grad-CAM (XAI)

Detail deploy ada di [backend/README.md](backend/README.md) (HF Spaces) dan
[frontend/README.md](frontend/README.md) (Vercel).

## Paritas dengan notebook

Backend mereplikasi `ben_color_preprocessing`, arsitektur `DRSwinV2Model`, dan
thresholding dari `notebook/training.ipynb` **secara persis**. Bandingkan output
`/predict` dengan `predict_single_image()` di notebook untuk gambar uji yang sama.

> Catatan: bobot `.pth` (~1 GB) tidak di-commit ke git (lihat `.gitignore`).
> Untuk HF Spaces, upload lewat Git LFS atau langsung ke repo Space.
