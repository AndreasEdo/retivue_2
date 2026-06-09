# RetiVue Frontend (React + Vite)

Halaman tunggal: upload foto fundus → analisis → tampilkan grade DR + skor +
disclaimer Human-in-the-Loop, plus bagian Explainability (Ben Graham + Grad-CAM).

## Jalankan lokal

```bash
cd frontend
npm install
cp .env.example .env        # set VITE_API_URL ke backend (default http://localhost:7860)
npm run dev                 # http://localhost:5173
```

## Build & deploy ke Vercel

```bash
npm run build               # output ke dist/
```

Di Vercel:
- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** `VITE_API_URL` = URL backend HF Space
  (mis. `https://username-retivue-api.hf.space`)

## Catatan

- Base URL backend lewat env `VITE_API_URL` (tidak di-hardcode).
- TIDAK menyimpan data pasien ke `localStorage`/`sessionStorage`.
- Request pertama bisa lambat (Space "bangun dari tidur" + load model);
  UI menampilkan status "Memuat model, mohon tunggu…".
- Grad-CAM dipanggil terpisah (lazy) karena di CPU agak lambat.
