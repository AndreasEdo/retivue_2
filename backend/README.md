---
title: RetiVue API
emoji: 👁️
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

# RetiVue API — Backend (FastAPI + PyTorch)

Inference service untuk skrining triase Diabetic Retinopathy (DR) berbasis
SwinV2. Mereplikasi preprocessing & arsitektur notebook training 1:1.

> ⚠️ **Human-in-the-Loop.** RetiVue adalah alat bantu triase, bukan diagnosis
> final. Keputusan akhir tetap di tangan dokter mata.

## Endpoint

| Method | Path       | Keterangan |
|--------|------------|------------|
| GET    | `/health`  | `{ "status": "ok", "model_loaded": true }` |
| POST   | `/predict` | `multipart/form-data` field `file` → grade + skor + gambar Ben Graham |
| POST   | `/explain` | `multipart/form-data` field `file` → heatmap Grad-CAM (XAI) |

Dokumentasi interaktif (Swagger): `/docs`.

### Contoh response `/predict`

```json
{
  "grade": 2,
  "label": "Moderate",
  "raw_score": 1.87,
  "confidence": 0.82,
  "thresholds": [0.51, 1.48, 2.53, 3.49],
  "ben_graham_image": "data:image/png;base64,...",
  "disclaimer": "Hasil ini adalah alat bantu triase, bukan diagnosis final. Keputusan akhir tetap di tangan dokter mata."
}
```

## Jalankan lokal

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # opsional
pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
uvicorn app.main:app --reload --port 7860
```

Pastikan bobot model ada di `backend/models/swinv2_best_fold1.pth`.

Tes cepat:

```bash
curl http://localhost:7860/health
curl -F "file=@/path/ke/fundus.png" http://localhost:7860/predict
```

## Deploy ke Hugging Face Spaces

1. Buat Space baru: **SDK = Docker**.
2. Push isi folder `backend/` ke repo Space (`README.md` ini sudah punya YAML
   frontmatter yang diperlukan HF).
3. Bobot `.pth` (~1 GB) tidak ikut git biasa — upload lewat **Git LFS** ke repo
   Space, atau unggah manual ke folder `models/` lewat UI Space.
4. Space akan build Docker dan menjalankan uvicorn di port 7860.

## Konfigurasi (env vars)

| Env | Default | Keterangan |
|-----|---------|------------|
| `CORS_ORIGINS` | `*` | Daftar origin diizinkan, comma-separated (mis. URL Vercel). |
| `ENSEMBLE` | `false` | `true`/`1` = load semua fold yang ada & rata-ratakan skor (lebih robust, ~N× lebih lambat di CPU). Default single fold. |
| `MODEL_CHECKPOINT` | auto | (mode single) Path checkpoint spesifik; default `swinv2_best_fold1.pth`. |

> **Single fold vs ensemble.** Untuk demo di HF free tier (2 vCPU), **single fold**
> direkomendasikan: cepat & responsif, sementara beda akurasinya tipis (fold1 QWK
> 0.9340). RAM bukan masalah (4 fold ≈ 4 GB dari 16 GB) — yang terasa adalah latensi
> CPU (ensemble ~4× lebih lambat). Nyalakan ensemble dengan `ENSEMBLE=true` saat ingin
> hasil paling robust. Saat ensemble, response `/predict` menyertakan `n_folds` &
> `fold_scores`; `/explain` tetap pakai 1 fold.

## Catatan teknis

- **Single fold** default (fold1). Ensemble multi-fold via `ENSEMBLE=true`.
- Device **CPU** (`map_location='cpu'`). Tidak ada `.cuda()`.
- Checkpoint di-load `weights_only=False` (checkpoint adalah dict berisi
  `config`/`thresholds`, bukan state_dict mentah).
- Model di-load **sekali** saat startup (lifespan) + warmup.
- Grad-CAM (`/explain`) butuh gradien (tanpa `torch.no_grad()`), target = skor
  regresi, reshape SwinV2 channels-last → `[B,C,H,W]`, grid 8×8.
