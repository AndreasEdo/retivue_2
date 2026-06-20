// Generate PDF laporan klinis pasien (client-side, jsPDF).
// jsPDF di-load secara dinamis supaya tidak membebani bundle utama.

const NAVY = [30, 42, 74];
const BLUE = [45, 63, 224];
const GRAY = [100, 116, 139];
const DARK = [15, 23, 42];

// Ambil gambar (URL Cloudinary / data-uri) -> dataURL untuk jsPDF addImage.
async function loadImageDataURL(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function downloadClinicalReportPDF(report) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  const dr = report.doctor_result || {};
  const idShort = (report.id || '').slice(-6).toUpperCase();

  // ── Header band ──
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('RetiVue', margin, 38);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Clinical Screening Report', margin, 56);
  doc.setFontSize(9);
  doc.text(`Report #${idShort}`, pageW - margin, 38, { align: 'right' });
  y = 110;

  // ── Meta ──
  doc.setTextColor(...GRAY);
  doc.setFontSize(10);
  const reviewedOn = report.reviewed_at ? new Date(report.reviewed_at).toLocaleDateString() : '';
  doc.text(`Patient: ${report.patient_name || ''}`, margin, y);
  doc.text(`Reviewing Doctor: ${report.doctor_name || ''}`, margin, y + 16);
  if (reviewedOn) doc.text(`Reviewed on: ${reviewedOn}`, margin, y + 32);
  y += 56;

  // ── Retinal image ──
  const imgData = report.original_image ? await loadImageDataURL(report.original_image) : null;
  if (imgData) {
    try {
      const props = doc.getImageProperties(imgData);
      const w = 180;
      const h = Math.min(180, (props.height / props.width) * w);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...BLUE);
      doc.text('Retinal Image', margin, y);
      y += 12;
      doc.addImage(imgData, props.fileType || 'JPEG', margin, y, w, h);
      y += h + 20;
    } catch {
      /* lewati kalau gambar gagal dirender */
    }
  }

  // ── Diagnosis sections (lewati yang kosong) ──
  const section = (title, body) => {
    if (!body || !String(body).trim()) return;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BLUE);
    doc.text(title, margin, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(String(body), contentW);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 14;
    if (y > pageH - 120) {
      doc.addPage();
      y = margin;
    }
  };

  section('Final Diagnosis', dr.final_diagnosis);
  section('Lifestyle Recommendation', dr.lifestyle_recommendation);
  section('Food Recommendation', dr.food_recommendation);
  section('Follow-up Plan', dr.follow_up_plan);

  // ── Disclaimer ──
  y += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  y += 18;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  const disclaimer = doc.splitTextToSize(
    'This report reflects your ophthalmologist\'s final assessment and is the clinical decision of your doctor.',
    contentW
  );
  doc.text(disclaimer, margin, y);

  // ── Footer ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(`Generated ${new Date().toLocaleString()} · RetiVue`, margin, pageH - 28);

  doc.save(`RetiVue-Report-${idShort || 'report'}.pdf`);
}
