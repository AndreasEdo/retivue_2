// Generate PDF laporan klinis pasien (client-side, jsPDF).
// jsPDF di-load secara dinamis supaya tidak membebani bundle utama.

const NAVY = [30, 42, 74];
const BLUE = [45, 63, 224];
const GRAY = [100, 116, 139];
const DARK = [15, 23, 42];

export async function downloadClinicalReportPDF(report) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
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
  doc.text('AI-Assisted Retinal Screening — Clinical Report', margin, 56);
  doc.setFontSize(9);
  doc.text(`Report #${idShort}`, pageW - margin, 38, { align: 'right' });
  y = 110;

  // ── Meta ──
  doc.setTextColor(...GRAY);
  doc.setFontSize(10);
  const reviewedOn = report.reviewed_at ? new Date(report.reviewed_at).toLocaleDateString() : '—';
  doc.text(`Patient: ${report.patient_name || '—'}`, margin, y);
  doc.text(`Reviewing Doctor: ${report.doctor_name || '—'}`, margin, y + 16);
  doc.text(`Reviewed on: ${reviewedOn}`, margin, y + 32);
  y += 60;

  // ── Diagnosis sections ──
  const section = (title, body) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BLUE);
    doc.text(title, margin, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(body && String(body).trim() ? String(body) : '—', contentW);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 14;
    // page-break sederhana
    if (y > doc.internal.pageSize.getHeight() - 120) {
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
    'This report reflects your ophthalmologist\'s final assessment. AI is used only as a screening aid; ' +
    'the diagnosis above is the clinical decision of your doctor, not an autonomous AI diagnosis.',
    contentW
  );
  doc.text(disclaimer, margin, y);

  // ── Footer ──
  const h = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(`Generated ${new Date().toLocaleString()} · RetiVue v2.0`, margin, h - 28);

  doc.save(`RetiVue-Report-${idShort || 'report'}.pdf`);
}
