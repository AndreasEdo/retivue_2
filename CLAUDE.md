# CLAUDE.md — Konteks Project RetiVue

> File ini adalah konteks utama untuk Claude (di VSCode / Claude Code).
> Baca seluruhnya sebelum mulai. Tujuannya: membangun aplikasi RetiVue dari nol,
> dengan backend yang **persis** cocok dengan model AI yang sudah dilatih.

---

## 1. Apa itu RetiVue

RetiVue adalah **alat skrining triase Diabetic Retinopathy (DR)** berbasis AI untuk
telemedicine di kawasan ASEAN. User (tenaga kesehatan di klinik) mengunggah foto
fundus retina, model memprediksi tingkat keparahan DR (grade 0–4), dan hasilnya
dipakai sebagai **alat bantu triase** — bukan diagnosis final.

**Prinsip non-negotiable: Human-in-the-Loop.** RetiVue TIDAK PERNAH mengklaim sebagai
diagnosis otonom. Setiap output harus disertai disclaimer bahwa keputusan akhir tetap
di tangan dokter mata (ophthalmologist). Ini wajib muncul di UI dan di response API.

Konteks: ini submission hackathon (ASEAN AI Hackathon 2026, track Telemedicine).
Deliverable utamanya adalah **MVP yang bisa didemokan**, bukan sistem produksi.
Prioritaskan: jalan dengan benar, mudah di-deploy, murah. Bukan: skala besar, auth rumit.

**Grade DR (5 kelas, ordinal):**
```
0 = No DR
1 = Mild
2 = Moderate
3 = Severe
4 = Proliferative DR
```

---

## 2. Tech Stack (sudah diputuskan — jangan diganti tanpa alasan)

Stack ini namanya **FARM** (FastAPI + React + MongoDB). Kenapa bukan MERN:
model AI-nya PyTorch/Python, jadi backend HARUS Python. Express/Node tidak bisa
menjalankan model PyTorch langsung. FastAPI = satu bahasa, model di-load in-process,
tidak perlu service tambahan.

| Layer | Teknologi | Deploy ke | Biaya |
|---|---|---|---|
| Frontend | React (Vite) | Vercel | Gratis |
| Backend + Model | **FastAPI + PyTorch** | Hugging Face Spaces (Docker) | Gratis |
| Database | MongoDB | MongoDB Atlas (M0) | Gratis |
| Penyimpanan gambar | Cloudinary | Cloudinary free tier | Gratis |

**Kenapa Hugging Face Spaces untuk backend (penting):**
Model Swin V2 Base butuh RAM besar. Free tier Render hanya 512 MB RAM → model
PyTorch akan crash (out-of-memory). HF Spaces free tier = **2 vCPU + 16 GB RAM**,
cukup untuk load model + inferensi di CPU, dan memang didesain untuk demo ML.
Catatan: Space gratis "tidur" setelah ~48 jam tidak dipakai, bangun lagi saat diakses
(loading sebentar di awal). Untuk demo hackathon ini tidak masalah.

---

## 3. KONTRAK MODEL AI (bagian paling kritis — backend harus 1:1 dengan ini)

Model dilatih di Google Colab. Notebook training tersedia di repo (file `.ipynb`).
Bobot model hasil training (`.pth`) **sudah disediakan** di folder `backend/models/`
(lihat Section 5). Backend inference HARUS mereplikasi arsitektur & preprocessing
notebook secara persis, kalau tidak hasil prediksi akan salah.

### 3.1 Arsitektur model
- Class: `DRSwinV2Model(nn.Module)`
- Backbone: `timm.create_model('swinv2_base_window16_256', pretrained=False, num_classes=0, global_pool='avg')`
  - **Saat inference pakai `pretrained=False`** — bobot ImageNet tidak perlu di-download,
    karena `model_state_dict` di checkpoint sudah berisi seluruh bobot (backbone + head).
- Regression head (urutan persis):
  ```
  Dropout(0.3) → Linear(in_features, 512) → SiLU() → Linear(512, 1)
  ```
  `in_features` diambil dari `self.backbone.num_features` (jangan hardcode).
- `forward(x)` mengembalikan `output.squeeze(1)` → shape `[B]` (satu skalar per gambar).
  Ini sudah aman untuk `batch_size=1` (single-image inference di API). Jangan ubah ke
  `.squeeze()` polos.
- Output = **skor regresi kontinu** dalam rentang ~[0, 4], BUKAN probabilitas kelas.

### 3.2 Preprocessing (Ben Graham) — WAJIB SAMA PERSIS
Input dari `cv2.imread()` → format **BGR**. Urutan:
```python
def ben_color_preprocessing(image, sigmaX=10):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)      # 1. BGR → RGB
    image = crop_image_from_gray(image, tol=7)          # 2. buang border hitam
    image = cv2.resize(image, (256, 256))               # 3. resize 256×256
    image = cv2.addWeighted(image, 4,                    # 4. Ben Graham contrast:
                            cv2.GaussianBlur(image, (0,0), sigmaX), -4, 128)
    return image
```
`crop_image_from_gray`: mask piksel grayscale > 7, crop ke bounding box konten.
(Salin implementasi persis dari notebook — sudah ada di `.ipynb`.)

Setelah Ben Graham, terapkan transform validasi (TANPA augmentasi):
```python
A.Compose([
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2(),
])
# lalu: tensor.unsqueeze(0) → [1, C, H, W]
```

### 3.3 Format checkpoint `.pth` (PENTING — ini bukan state_dict mentah)
Setiap file `.pth` adalah **dict**, bukan `state_dict` langsung:
```python
{
    'epoch': int,
    'model_state_dict': ...,     # <- bobot model ada di sini
    'optimizer_state': ...,
    'metrics': {...},
    'thresholds': [t0, t1, t2, t3],   # <- threshold Nelder-Mead, SUDAH tersimpan
    'config': {...},
}
```
Cara load yang benar:
```python
ckpt = torch.load(path, map_location='cpu', weights_only=False)
model.load_state_dict(ckpt['model_state_dict'])
thresholds = ckpt['thresholds']   # mis. [0.51, 1.48, 2.53, 3.49]
```
> ⚠️ **Wajib `weights_only=False`.** PyTorch ≥ 2.6 default-nya `weights_only=True`,
> yang akan GAGAL load checkpoint ini karena ada `config`/objek non-tensor di dalamnya.
> Ini error yang langsung muncul di environment modern kalau lupa.

### 3.4 Score → Grade (thresholding)
Skor kontinu dikonversi ke kelas diskrit pakai threshold dari checkpoint:
```python
def score_to_grade(score, t):   # t = [t0, t1, t2, t3]
    if   score < t[0]: return 0
    elif score < t[1]: return 1
    elif score < t[2]: return 2
    elif score < t[3]: return 3
    else:              return 4
```
Default fallback kalau `thresholds` tidak ada: `[0.5, 1.5, 2.5, 3.5]`.

### 3.5 Single fold dulu untuk demo (jangan 5-fold ensemble)
Ada 5 file: `swinv2_best_fold1.pth` … `swinv2_best_fold5.pth`.
**Untuk MVP/demo, LOAD 1 FOLD SAJA** (mis. fold dengan QWK terbaik). Alasan:
load 5 model sekaligus boros RAM & lambat di CPU, bikin deploy susah.
Buat arsitektur kode supaya ensemble 5-fold bisa diaktifkan nanti via config/flag,
tapi default = single fold. (5-fold ensemble OOF QWK = 0.9281 tetap boleh disebut
sebagai hasil training di pitch — demo cukup 1 model.)

---

## 4. Yang DISEDIAKAN user vs yang HARUS DIBANGUN Claude

**Disediakan (sudah ada di repo):**
- Notebook training (`.ipynb`) — sumber kebenaran untuk arsitektur & preprocessing.
- File bobot `swinv2_best_fold*.pth` di `backend/models/` (atau akan ditaruh ke sana).

**Harus dibangun Claude (dari nol):**
- Seluruh backend FastAPI (inference service).
- Seluruh frontend React.
- Konfigurasi deploy (Dockerfile untuk HF Spaces, dll).
- Dokumentasi setup (README) supaya teman satu tim bisa menjalankan.

---

## 5. Struktur Repo Target

```
retivue/
├── CLAUDE.md                      # file ini
├── README.md                      # cara setup & run (untuk teman tim)
├── notebook/
│   └── training.ipynb             # notebook Colab (referensi, jangan diubah)
│
├── backend/                       # FastAPI + model → deploy ke HF Spaces
│   ├── app/
│   │   ├── main.py                # FastAPI app + routes
│   │   ├── model.py               # DRSwinV2Model + load + warmup
│   │   ├── preprocessing.py       # ben_color_preprocessing + crop + transforms
│   │   ├── inference.py           # predict(image_bytes) → grade + score + confidence
│   │   ├── explain.py             # XAI: Grad-CAM (Swin) + render heatmap overlay
│   │   └── schemas.py             # Pydantic request/response models
│   ├── models/
│   │   └── swinv2_best_fold*.pth  # bobot (disediakan user; jangan commit ke git)
│   ├── requirements.txt
│   ├── Dockerfile                 # untuk HF Spaces (port 7860)
│   ├── README.md                  # YAML frontmatter HF Space + cara deploy
│   └── .gitignore                 # ignore *.pth, __pycache__, dll
│
└── frontend/                      # React (Vite) → deploy ke Vercel
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── UploadCard.jsx      # drag & drop / pilih file fundus
    │   │   ├── ResultCard.jsx      # tampilkan grade + skor + disclaimer
    │   │   └── ExplainView.jsx     # XAI: gambar Ben Graham + Grad-CAM overlay
    │   └── lib/api.js              # fetch ke backend
    ├── .env.example               # VITE_API_URL=...
    ├── package.json
    └── README.md
```

---

## 6. Spesifikasi Backend (FastAPI)

### Endpoint
- `GET /health` → `{ "status": "ok", "model_loaded": true }` (untuk cek liveness).
- `POST /predict` → terima 1 gambar fundus, kembalikan hasil prediksi (+ gambar Ben Graham).
- `POST /explain` → terima 1 gambar fundus, kembalikan heatmap Grad-CAM (XAI). Lihat Section 8.

### `POST /predict`
- Request: `multipart/form-data`, field `file` (gambar .png/.jpg).
- Proses: baca bytes → decode (`cv2.imdecode`) → `ben_color_preprocessing` →
  transform validasi → model → skor → threshold → grade.
- Response (JSON):
  ```json
  {
    "grade": 2,
    "label": "Moderate",
    "raw_score": 1.87,
    "thresholds": [0.51, 1.48, 2.53, 3.49],
    "ben_graham_image": "data:image/png;base64,...",
    "disclaimer": "Hasil ini adalah alat bantu triase, bukan diagnosis final. Keputusan akhir tetap di tangan dokter mata."
  }
  ```
  > `ben_graham_image` = gambar fundus SETELAH preprocessing Ben Graham (256×256),
  > di-encode base64. Ini transparansi ("apa yang dilihat model"), murah karena
  > gambarnya sudah dikomputasi di pipeline. Konversi RGB→PNG sebelum encode.

### Aturan implementasi backend
- Model di-load **SEKALI** saat startup (event `lifespan`/`startup`), simpan di state global.
  Jangan load model per-request (lambat & boros).
- Device = CPU (`map_location='cpu'`). HF Spaces free tier tidak punya GPU.
- `model.eval()` + bungkus inferensi dengan `torch.no_grad()`.
- CORS: izinkan origin frontend (domain Vercel). Untuk dev, izinkan `http://localhost:5173`.
- Validasi input: tolak file non-gambar / gambar korup dengan HTTP 422 + pesan jelas.
- Jangan simpan gambar pasien ke disk server tanpa alasan. Kalau perlu simpan (riwayat),
  pakai Cloudinary, dan simpan hanya URL-nya di MongoDB.

### requirements.txt (versi CPU, hemat ukuran image)
Gunakan PyTorch CPU wheel. Daftar minimal:
```
fastapi
uvicorn[standard]
python-multipart
torch            # index CPU: https://download.pytorch.org/whl/cpu
timm
albumentations
opencv-python-headless   # headless! (server tidak punya display)
numpy
pillow
scipy
grad-cam          # untuk XAI Grad-CAM (Section 8); butuh >=1.3.6 untuk dukungan ViT/Swin
```
> Catatan: pakai `opencv-python-headless`, BUKAN `opencv-python` (notebook training
> pun sudah pakai headless). `scipy` hanya perlu kalau mau recompute threshold;
> untuk inference threshold sudah ada di checkpoint, jadi opsional. `grad-cam`
> (paket pip `grad-cam`, di-import sebagai `pytorch_grad_cam`) dipakai untuk endpoint
> `/explain`; pakai colormap dari OpenCV untuk overlay, jangan tambah `matplotlib`.

### Dockerfile (HF Spaces)
- HF Spaces Docker mengharapkan app listen di **port 7860**.
- README backend butuh YAML frontmatter:
  ```
  ---
  title: RetiVue API
  emoji: 👁️
  colorFrom: blue
  colorTo: green
  sdk: docker
  app_port: 7860
  ---
  ```
- Jalankan: `uvicorn app.main:app --host 0.0.0.0 --port 7860`.

---

## 7. Spesifikasi Frontend (React + Vite)

MVP cukup satu halaman:
1. **Upload area** — pilih/drag gambar fundus, preview thumbnail.
2. Tombol **"Analisis"** → kirim ke `POST {VITE_API_URL}/predict`.
3. **Hasil** — tampilkan grade (0–4) + nama kelas + skor kontinu, dengan warna per
   tingkat keparahan (mis. hijau → merah). Sertakan **disclaimer Human-in-the-Loop**
   yang jelas dan tidak bisa dilewatkan.
4. State loading & error yang rapi (backend bisa "bangun dari tidur" → request pertama
   agak lama, tampilkan pesan "Memuat model, mohon tunggu…").

- Base URL backend lewat env: `VITE_API_URL` (jangan hardcode).
- Boleh pakai komponen styling apa pun, tapi utamakan jelas & profesional (ini konteks medis).
- JANGAN gunakan `localStorage`/`sessionStorage` untuk data pasien.

### Tampilan XAI di frontend
Di bawah hasil grade, tambahkan bagian **"Mengapa? (Explainability)"** yang menampilkan
dua gambar berdampingan:
1. **Gambar Ben Graham** (`ben_graham_image` dari `/predict`) — "apa yang dilihat model".
2. **Heatmap Grad-CAM** (dari `/explain`) — "di mana model fokus". Area panas idealnya
   jatuh di lesi (microaneurysm, perdarahan).

Beri keterangan singkat dan jujur: heatmap menunjukkan wilayah yang paling memengaruhi
prediksi, untuk membantu dokter memverifikasi — bukan bukti diagnosis. Grad-CAM bisa
dipanggil setelah prediksi (lazy), tampilkan spinner karena di CPU agak lambat.

---

## 8. Explainability / XAI (Ben Graham + Grad-CAM)

XAI adalah bagian dari scope (sudah dijanjikan di roadmap, dan bernilai tinggi untuk
track medis). Dua komponen, beda sifat:

### 8.1 Tampilan Ben Graham — transparansi (murah, kerjakan duluan)
Ini BUKAN explainability, melainkan transparansi proses: menunjukkan citra fundus
setelah dinormalisasi. Sudah dikomputasi di `/predict`; tinggal encode RGB→PNG→base64
dan kirim sebagai `ben_graham_image`. Tidak perlu kerja model tambahan.

### 8.2 Grad-CAM — explainability sebenarnya (endpoint `/explain`)
Pakai library `grad-cam` (`pytorch_grad_cam`) yang mendukung Swin via `reshape_transform`.
Implementasinya beda dari inferensi biasa, perhatikan poin berikut:

- **Target = skor regresi, bukan kelas.** Model kita regresi (output 1 skalar), jadi
  `targets` untuk CAM adalah output skalar itu sendiri (mis. `RawScoresOutputTarget`
  atau custom target yang mengembalikan `model_output`), BUKAN target kelas.
- **Pilih target layer SEBELUM blok atensi terakhir.** Kalau ambil layer paling akhir,
  gradiennya bisa 0 → heatmap kosong. Patokan: layer norm di blok terakhir stage
  terakhir backbone (mis. sekitar `backbone.layers[-1].blocks[-1].norm1`). Nama modul
  persis HARUS diverifikasi dari struktur timm SwinV2 (print `model.backbone` dulu).
- **Grid spasial = 8×8, bukan 7×7.** Tutorial standar pakai 7×7 untuk input 224px.
  Model kita input **256px** (256/32 = 8), jadi `reshape_transform` pakai height=width=8.
  ⚠️ Tambahan: timm SwinV2 sering mengeluarkan fitur dalam format spasial `[B, H, W, C]`
  (channels-last), berbeda dari `[B, N, C]` di tutorial ViT. Jadi JANGAN asal copy
  `reshape_transform` tutorial — cetak `tensor.shape` di hook dulu, baru sesuaikan
  (mungkin malah tidak perlu reshape token, cukup permute ke `[B, C, H, W]`).
- **Butuh gradien.** Jalur Grad-CAM TIDAK boleh pakai `torch.no_grad()` / `model.eval()`
  yang mematikan gradien. Pisahkan total dari jalur `/predict`. Konsekuensinya lebih
  lambat & lebih berat di CPU — wajar.
- **Output endpoint:** overlay heatmap di atas gambar Ben Graham, encode base64.
  ```json
  { "gradcam_image": "data:image/png;base64,...",
    "method": "grad-cam",
    "note": "Heatmap menunjukkan wilayah yang paling memengaruhi prediksi; alat bantu verifikasi, bukan bukti diagnosis." }
  ```
  Untuk overlay pakai colormap OpenCV (`cv2.applyColorMap` + blend), jangan matplotlib.

### 8.3 Plan B kalau Grad-CAM rewel: Attention Rollout
Kalau dalam sisa waktu Grad-CAM noisy/sulit di-debug, ganti ke **attention rollout**
(agregasi bobot atensi antar layer). Secara teknis lebih natural untuk transformer dan
tidak butuh gradien. Hasil akhir untuk user sama: satu heatmap "di mana model fokus".
Tetap pakai endpoint `/explain` yang sama, cukup ganti isinya.

### 8.4 Urutan & prioritas
Ben Graham (8.1) kerjakan bareng `/predict`. Grad-CAM (8.2) kerjakan SETELAH alur inti
(upload→prediksi→deploy) sudah jalan end-to-end — jangan sampai ngejar XAI bikin core
yang lebih penting molor.

---

## 9. Urutan Pengerjaan (milestone)


1. **Backend dulu, sampai bisa diuji lokal.**
   - `preprocessing.py` + `model.py` + `inference.py`, load 1 fold, uji dengan satu
     gambar contoh → pastikan grade keluar dan masuk akal.
   - Bandingkan output dengan fungsi `predict_single_image` di notebook untuk gambar
     yang sama → skor harus mirip (validasi paritas).
2. **`POST /predict` + `/health`** jalan di `uvicorn` lokal.
3. **Frontend** terhubung ke backend lokal, alur upload→hasil jalan end-to-end.
4. **Dockerfile + deploy backend ke HF Spaces.**
5. **Deploy frontend ke Vercel**, set `VITE_API_URL` ke URL Space.
6. **XAI — tahap 1: gambar Ben Graham** di response `/predict` + tampil di frontend (murah).
7. **XAI — tahap 2: Grad-CAM** lewat endpoint `/explain` + `ExplainView.jsx` (lihat Section 8).
8. (Opsional, kalau waktu cukup) MongoDB Atlas untuk riwayat + Cloudinary untuk gambar.

---

## 10. Catatan & Jebakan (baca sebelum coding)

- **Paritas preprocessing itu segalanya.** Kalau urutan/parameter Ben Graham beda
  sedikit saja dari notebook, prediksi ngaco. Salin persis dari `.ipynb`.
- **Checkpoint = dict, butuh `weights_only=False`** (lihat 3.3). Ini error #1 yang
  biasanya muncul pertama.
- **`opencv-python-headless`**, bukan versi biasa — server tanpa GUI.
- **Single fold untuk demo** (lihat 3.5). Ensemble = enhancement, bukan default.
- **CPU inference** — jangan ada `.cuda()` / `.to('cuda')` tanpa pengecekan
  `torch.cuda.is_available()`.
- **Grad-CAM bukan jalur inferensi biasa** (lihat Section 8): butuh gradien (tanpa
  `torch.no_grad()`), target = skor regresi, grid 8×8, dan format fitur timm SwinV2
  harus dicek dulu (`tensor.shape`) sebelum bikin `reshape_transform`. Kerjakan setelah
  core jalan, di endpoint terpisah `/explain`. Plan B: attention rollout.
- **Bedakan transparansi vs XAI:** gambar Ben Graham = transparansi (murah, duluan);
  Grad-CAM = explainability sebenarnya (lebih berat, belakangan).
- **Privasi/medis:** selalu sertakan disclaimer Human-in-the-Loop di response & UI.
  Jangan klaim akurasi diagnosis. RetiVue = triase, bukan dokter. Heatmap XAI = alat
  bantu verifikasi, bukan bukti diagnosis.
- **Jangan commit `.pth` ke git** (file besar). Masukkan ke `.gitignore`. Untuk HF
  Spaces, upload bobot lewat Git LFS atau langsung ke repo Space.

---

## 11. Definisi "Selesai" untuk MVP

- [ ] `GET /health` mengembalikan `model_loaded: true`.
- [ ] `POST /predict` menerima gambar fundus dan mengembalikan grade 0–4 + skor + disclaimer.
- [ ] Output backend cocok dengan `predict_single_image` notebook untuk gambar uji yang sama.
- [ ] Frontend: upload → analisis → hasil tampil, dengan disclaimer terlihat.
- [ ] `/predict` mengembalikan `ben_graham_image` dan frontend menampilkannya.
- [ ] `/explain` mengembalikan heatmap Grad-CAM dan frontend menampilkannya berdampingan
      dengan gambar Ben Graham (boleh attention rollout sebagai plan B).
- [ ] Backend ter-deploy di HF Spaces, frontend di Vercel, keduanya terhubung.
- [ ] README menjelaskan cara menjalankan lokal & deploy (cukup jelas untuk teman tim).
