# RetiVue 👁️

Platform **telemedicine skrining Diabetic Retinopathy (DR)** berbasis AI dengan alur
multi-role (Admin · Medical Record · Dokter · Pasien). Tenaga kesehatan mengunggah foto
fundus, model **SwinV2** memprediksi grade DR (0–4) + Grad-CAM sebagai **alat bantu
triase**, lalu **dokter memvalidasi** sebelum hasil sampai ke pasien.

> **Human-in-the-Loop.** AI hanya alat bantu skrining — diagnosis final selalu keputusan
> dokter mata. Pasien tidak pernah melihat confidence/Grad-CAM/probabilitas AI mentah.

## Peran & Alur (lihat `konteks_2.md`)

```
Admin    → buat akun Dokter & Medical Record, atur jadwal dokter, monitoring
Pasien   → registrasi, booking appointment, lihat laporan final (yang disetujui)
Med.Rec. → input data pasien + upload retina → jalankan AI → kirim ke dokter
Dokter   → review (data + AI + Grad-CAM) → Approve (diagnosis+rekomendasi) / Reject (note → balik ke Med.Rec.)
```

Status case: `waiting → approved | rejected`.

## Arsitektur

| Layer | Teknologi | Deploy |
|-------|-----------|--------|
| Frontend | React (Vite) + Tailwind + React Router | Vercel |
| Backend + Model | FastAPI + PyTorch (SwinV2) + JWT | Hugging Face Spaces (Docker) |
| Database | MongoDB | MongoDB Atlas (M0 free) |
| Penyimpanan gambar | Cloudinary (fallback base64 di Mongo) | Cloudinary free |

Model = regresi (skor kontinu 0–4 → grade via threshold checkpoint). "Probability per
class" di UI diturunkan sebagai perkiraan dari skor (lihat `backend/app/ai_runner.py`).
Detail kontrak model AI ada di `CLAUDE.md`.

## Struktur repo

```
retivue/
├── backend/      # FastAPI: auth, role endpoints, AI (Ben Graham/Grad-CAM), Mongo  → HF Spaces
│   └── app/{main,config,db,security,seed}.py, routers/, ai_runner.py, model.py, ...
├── frontend/     # React multi-role (admin/doctor/medical_record/patient)          → Vercel
├── notebook/     # notebook training (referensi paritas AI)
└── UI_UX/        # screenshot desain (referensi), *.png
```

## Setup lokal

### 1. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
cp .env.example .env        # isi MONGODB_URI, JWT_SECRET, CLOUDINARY_* (lihat di bawah)
uvicorn app.main:app --reload --port 7860
```
Bobot model harus ada di `backend/models/swinv2_best_fold1.pth`.

`.env` yang dibutuhkan:
| Env | Keterangan |
|-----|------------|
| `MONGODB_URI` | Connection string Atlas (ganti `<db_password>` dengan password asli, alfanumerik) |
| `DB_NAME` | nama database (mis. `retivue-app`) |
| `JWT_SECRET` | string acak panjang (`openssl rand -hex 32`) |
| `SEED_DEMO` / `SEED_PASSWORD` | seed 4 akun demo + password-nya |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | opsional; kosong = fallback base64 |
| `ENSEMBLE` | `true` = pakai semua fold (lebih lambat di CPU) |
| `CORS_ORIGINS` | `*` atau URL Vercel |

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:7860
npm run dev                 # http://localhost:5173
```

## Akun demo (ter-seed otomatis, password = `SEED_PASSWORD`)

| Role | Email |
|------|-------|
| Admin | `admin@retivue.com` |
| Dokter | `dokter@retivue.com` |
| Medical Record | `mr@retivue.com` |
| Pasien | `pasien@retivue.com` |

## API utama

- `POST /auth/login`, `POST /auth/register` (pasien), `GET /auth/me`
- `/admin/*` — users, schedules, patients, monitoring
- `/mr/*` — patients, submissions (+AI), history, rejected, resubmit
- `/doctor/*` — cases, case detail, approve, reject
- `/patient/*` — doctors, schedules, appointments, reports
- `/ai/predict`, `/ai/explain` — endpoint AI mentah (debug)

Swagger: `http://localhost:7860/docs`.

## Deploy

- **Backend → HF Spaces (Docker, port 7860):** push folder `backend/` ke repo Space; set
  Variables/Secrets di Space: `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `CORS_ORIGINS`
  (= URL Vercel). Bobot `.pth` via Git LFS / upload manual.
- **Frontend → Vercel:** Root Directory `frontend`, preset Vite, env `VITE_API_URL` = URL Space.
- **Atlas:** Network Access izinkan `0.0.0.0/0`.

> `.pth` & `.env` tidak di-commit (lihat `.gitignore`).
