Role 1: Admin

Admin bertugas mengelola seluruh operasional sistem.

Fitur Admin
Manajemen User
Create akun Dokter
Create akun Medical Record/Laboran
Melihat akun Pasien
Aktivasi/Deaktivasi akun
Manajemen Jadwal Dokter
Menambahkan jadwal praktik dokter
Mengubah jadwal praktik dokter
Menghapus jadwal praktik dokter
Menentukan kuota pasien per sesi

Contoh:

Dokter	Tanggal	Jam
Dr. A	10 Juni 2026	09.00-11.00
Dr. B	10 Juni 2026	13.00-15.00

Pasien hanya dapat memilih jadwal yang dibuat oleh Admin.

Monitoring Sistem
Jumlah pasien
Jumlah pemeriksaan
Jumlah kasus per tingkat DR
Statistik performa AI
Role 2: Medical Record / Laboran
Tugas

Setelah pasien datang sesuai jadwal:

Melakukan pengambilan retinal image.
Memilih data pasien.
Menginput data pendukung:
Nama pasien
Umur
Jenis kelamin
Berat badan
Tinggi badan
Tekanan darah
Riwayat diabetes
Durasi diabetes
Upload gambar retina.
Menjalankan AI screening.
Mengirim hasil ke dokter.
Output AI
Predicted Class
Confidence Score
GradCAM
AI Recommendation

Status:

Waiting Doctor Validation
Role 3: Dokter

Dokter menerima hasil prediksi dari AI untuk divalidasi.

Informasi yang Dapat Dilihat Dokter
Data Pasien
Nama
Umur
Riwayat diabetes
Data pendukung lainnya
Hasil Scan Asli
Retina image asli
Hasil AI
Predicted Class
Confidence Score
Probabilitas tiap kelas
Explainability
Grad-CAM Heatmap
AI Recommendation
Rekomendasi awal dari sistem AI
Validasi Dokter
Reject Case

Jika dokter menilai gambar tidak layak atau hasil tidak dapat digunakan.

Dokter wajib mengisi:

Reject Note

Contoh:

Gambar retina terlalu blur sehingga area makula tidak terlihat jelas.
Mohon lakukan pengambilan gambar ulang.

atau

Pencahayaan terlalu gelap dan sebagian retina tidak terekam.

Status:

Rejected

Sistem otomatis mengirim kembali kasus tersebut ke Medical Record.

Medical Record dapat melihat:

Status Rejected
Catatan dokter
Tombol Upload Ulang
Approve Case

Jika dokter menyetujui hasil.

Dokter mengisi:

Final Diagnosis

Contoh:

Moderate Diabetic Retinopathy
Lifestyle Recommendation

Contoh:

Olahraga minimal 30 menit setiap hari.
Menjaga kadar gula darah tetap stabil.
Food Recommendation

Contoh:

Kurangi makanan tinggi gula.
Perbanyak sayuran hijau dan protein sehat.
Follow-up Plan

Contoh:

Kontrol retina ulang dalam 3 bulan.

Status:

Approved
Role 4: Pasien
Appointment

Pasien dapat:

Melihat Jadwal Dokter

Jadwal berasal dari Admin.

Membuat Appointment

Pasien memilih:

Dokter
Tanggal tersedia
Jam tersedia

Status:

Appointment Submitted
Hasil Pemeriksaan

Pasien hanya dapat melihat hasil yang sudah disetujui dokter.

Yang Ditampilkan

✅ Gambar retina asli

✅ Nama dokter

✅ Tanggal pemeriksaan

✅ Diagnosis dokter

✅ Rekomendasi makanan

✅ Rekomendasi gaya hidup

✅ Tindak lanjut

Yang Tidak Ditampilkan

❌ Confidence Score AI

❌ GradCAM

❌ Probabilitas AI

❌ Raw AI Recommendation

Karena hasil akhir tetap merupakan keputusan dokter.

Workflow Lengkap
Admin
│
├── Membuat akun Dokter
├── Membuat akun Medical Record
└── Membuat jadwal dokter
            │
            ▼

Pasien
│
├── Registrasi
├── Login
└── Booking Appointment
            │
            ▼

Datang ke Klinik
            │
            ▼

Medical Record
│
├── Input data pasien
├── Upload retinal image
└── Jalankan AI
            │
            ▼

AI Engine
│
├── Predicted Class
├── Confidence Score
├── GradCAM
└── AI Recommendation
            │
            ▼

Dokter Review
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼

Reject        Approve
│                 │
│                 ├── Final Diagnosis
│                 ├── Food Recommendation
│                 ├── Lifestyle Recommendation
│                 └── Follow-up Plan
│
├── Reject Note
└── Return to Medical Record
                  │
                  ▼

             Pasien
             melihat
             laporan final