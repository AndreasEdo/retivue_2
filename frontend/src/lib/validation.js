// Validator kecil yang dipakai di form-form RetiVue.

export const isEmail = (v = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Nomor HP Indonesia/umum: 8–15 digit, boleh diawali + dan spasi/dash.
export const isPhone = (v = '') => /^[+]?[0-9][0-9\s-]{7,14}$/.test(v.trim());

export const isBlank = (v = '') => String(v).trim() === '';

// Validasi tanggal "YYYY-MM-DD" minimal H-1 (>= besok). Kembalikan true kalau valid.
export function isAtLeastTomorrow(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return (d - today) / 86400000 >= 1;
}

// "HH:MM" -> menit, untuk membandingkan start < end.
export const toMinutes = (t = '') => {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Validasi file gambar: tipe & ukuran (default maks 10 MB).
export function validateImage(file, maxMB = 10) {
  if (!file) return 'Please select a retinal image.';
  if (!file.type.startsWith('image/')) return 'File must be an image (PNG/JPG).';
  if (file.size > maxMB * 1024 * 1024) return `Image is too large (max ${maxMB} MB).`;
  return null; // valid
}
