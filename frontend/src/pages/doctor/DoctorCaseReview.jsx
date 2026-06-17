import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import ClinicalCard from '../../components/ui/ClinicalCard';
import AIBadge from '../../components/ui/AIBadge';
import { doctorCase, doctorApprove, doctorReject } from '../../lib/api';

// ── Change 1: Static 5-fold CV metrics (from training, NOT from API) ──────────
const CV_METRICS = [
  { label: 'Accuracy',  value: '85.0%' },
  { label: 'F1 Score',  value: '85.2%' },
  { label: 'Precision', value: '85.7%' },
  { label: 'Recall',    value: '85.0%' },
];

export default function DoctorCaseReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [c, setC] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState('');
  const [form, setForm] = useState({
    final_diagnosis: '', lifestyle_recommendation: '', food_recommendation: '', follow_up_plan: '', reject_note: '',
  });

  useEffect(() => { doctorCase(id).then(setC).catch((e) => setErr(e.message)); }, [id]);

  if (err) return <div className="text-[#DC2626]">{err}</div>;
  if (!c) return <div className="text-[#64748B]">Loading case…</div>;

  const pd = c.patient_data || {};
  const ai = c.ai_result || {};
  const img = c.images || {};
  const reviewed = c.status !== 'waiting';

  const submitApprove = async () => {
    setBusy(true); setErr('');
    try { await doctorApprove(id, form); navigate('/doctor/pending'); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const submitReject = async () => {
    if (!form.reject_note.trim()) { setErr('Reject note required.'); return; }
    setBusy(true); setErr('');
    try { await doctorReject(id, form.reject_note); navigate('/doctor/pending'); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader title={`Case Review #${id.slice(-6)}`} breadcrumb={`Patient: ${c.patient_name}`} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Patient Information ── */}
        <ClinicalCard>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-5">
            Patient Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" value={c.patient_name} />
            <Field label="Age" value={pd.age} />
            <Field label="Gender" value={pd.gender} />
            <Field label="Blood Pressure" value={pd.blood_pressure} />
            <Field label="Weight" value={pd.weight ? `${pd.weight} kg` : '—'} />
            <Field label="Height" value={pd.height ? `${pd.height} cm` : '—'} />
            <Field label="Has Diabetes" value={pd.has_diabetes ? 'Yes' : 'No'} />
            {pd.has_diabetes && <Field label="Diabetes Duration" value={`${pd.diabetes_duration || 0} years`} />}
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold text-[#64748B] mb-2">Original Retinal Image</p>
            {img.original_url
              ? <img src={img.original_url} alt="Retina" className="w-full max-h-72 object-contain bg-black rounded-md" />
              : <div className="w-full h-48 bg-[#f8fafc] rounded-md flex items-center justify-center text-[#94a3b8] text-sm">No image</div>
            }
          </div>
        </ClinicalCard>

        {/* ── Right: AI Analysis Results ── */}
        <ClinicalCard isAI>
          <div className="flex items-center gap-2 mb-5">
            <AIBadge />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B]">
              AI Analysis Results
            </h3>
          </div>

          {/* Grade + Confidence */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-4 bg-[#f8fafc] rounded-md">
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Predicted Grade
              </p>
              <p className="text-xl font-bold text-[#7C3AED]">Grade {ai.grade} · {ai.label}</p>
            </div>
            <div className="p-4 bg-[#f8fafc] rounded-md">
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Confidence (score {ai.raw_score})
              </p>
              <p className="text-xl font-bold text-[#7C3AED]">
                {ai.confidence != null ? `${(ai.confidence * 100).toFixed(0)}%` : '—'}
              </p>
            </div>
          </div>

          {/* Probability bars */}
          {ai.probabilities && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                Probability per Class
              </p>
              <div className="space-y-2">
                {Object.entries(ai.probabilities).map(([level, prob]) => (
                  <div key={level}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#64748B]">{level}</span>
                      <span className="font-semibold">{(prob * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: `${prob * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Change 1: Model Performance (5-Fold CV) — STATIC, hardcoded ── */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-3">
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Model Reliability (5-Fold CV)
              </p>
              {/* Tooltip on hover */}
              <div className="relative group">
                <span className="material-symbols-outlined text-[14px] text-[#94a3b8] cursor-help leading-none">
                  info
                </span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 px-3 py-2 bg-[#1e293b] text-white text-[11px] rounded-md leading-snug opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-normal text-center shadow-lg">
                  Average metrics from 5-fold cross-validation on APTOS 2019 dataset
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CV_METRICS.map(({ label, value }) => (
                <div key={label} className="bg-[#f2f4f6] rounded-lg p-3 text-center">
                  <p className="text-[11px] uppercase tracking-wider text-[#64748B] mb-1">{label}</p>
                  <p className="text-lg font-bold text-[#7C3AED]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Grad-CAM */}
          {img.gradcam_url && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                Grad-CAM (Focus Map)
              </p>
              <img
                src={img.gradcam_url}
                alt="Grad-CAM"
                className="w-full max-h-64 object-contain rounded-md border border-[#E2E8F0]"
              />
            </div>
          )}

          {/* AI Recommendation */}
          <div className="p-4 bg-[#f8fafc] rounded-md">
            <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              AI Recommendation
            </p>
            <p className="text-sm text-[#191c1e]">{ai.recommendation}</p>
          </div>
        </ClinicalCard>
      </div>

      {/* ── Doctor Validation ── */}
      <div
        className="mt-6 bg-white rounded-lg border border-[#F1F5F9] p-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-4">
          Doctor Validation
        </h3>
        {err && (
          <div className="mb-4 text-sm text-[#DC2626] bg-[#DC2626]/10 rounded-md px-3 py-2">{err}</div>
        )}

        {reviewed ? (
          <div className="p-4 rounded-md bg-[#f8fafc]">
            <p className="text-sm font-semibold capitalize text-[#0F172A]">
              This case is already {c.status}.
            </p>
            {c.doctor_result?.final_diagnosis && (
              <p className="text-sm text-[#64748B] mt-1">Diagnosis: {c.doctor_result.final_diagnosis}</p>
            )}
            {c.doctor_result?.reject_note && (
              <p className="text-sm text-[#64748B] mt-1">Reject note: {c.doctor_result.reject_note}</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setAction('approve')}
                className={`flex-1 py-3 rounded-md text-xs font-semibold transition-colors ${
                  action === 'approve' ? 'bg-[#059669] text-white' : 'bg-[#f8fafc] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              >
                Approve
              </button>
              <button
                onClick={() => setAction('reject')}
                className={`flex-1 py-3 rounded-md text-xs font-semibold transition-colors ${
                  action === 'reject' ? 'bg-[#DC2626] text-white' : 'bg-[#f8fafc] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              >
                Reject
              </button>
            </div>

            {action === 'approve' && (
              <div className="space-y-4">
                <Input label="Final Diagnosis" value={form.final_diagnosis} onChange={(v) => setForm({ ...form, final_diagnosis: v })} placeholder="e.g. Moderate Diabetic Retinopathy" />
                <TextArea label="Lifestyle Recommendation" value={form.lifestyle_recommendation} onChange={(v) => setForm({ ...form, lifestyle_recommendation: v })} />
                <TextArea label="Food Recommendation" value={form.food_recommendation} onChange={(v) => setForm({ ...form, food_recommendation: v })} />
                <Input label="Follow-up Plan" value={form.follow_up_plan} onChange={(v) => setForm({ ...form, follow_up_plan: v })} placeholder="e.g. Recheck in 3 months" />
                <button
                  onClick={submitApprove}
                  disabled={busy}
                  className="w-full py-2.5 bg-[#059669] text-white rounded-md text-xs font-semibold hover:bg-[#047857] disabled:opacity-60 transition-colors"
                >
                  {busy ? 'Submitting…' : 'Submit Approval'}
                </button>
              </div>
            )}
            {action === 'reject' && (
              <div className="space-y-4">
                <TextArea label="Reject Note" value={form.reject_note} onChange={(v) => setForm({ ...form, reject_note: v })} placeholder="e.g. Image too blurry; please re-capture." rows={4} />
                <button
                  onClick={submitReject}
                  disabled={busy}
                  className="w-full py-2.5 bg-[#DC2626] text-white rounded-md text-xs font-semibold hover:bg-[#B91C1C] disabled:opacity-60 transition-colors"
                >
                  {busy ? 'Submitting…' : 'Submit Rejection'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-[#0F172A]">{value ?? '—'}</p>
    </div>
  );
}
function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#454655] mb-2">{label}</label>
      <input
        className="block w-full px-3 py-2 border border-[#E2E8F0] rounded-md text-sm focus:ring-[#2d3fe0] focus:border-[#2d3fe0] bg-white"
        type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      />
    </div>
  );
}
function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#454655] mb-2">{label}</label>
      <textarea
        className="block w-full px-3 py-2 border border-[#E2E8F0] rounded-md text-sm focus:ring-[#2d3fe0] focus:border-[#2d3fe0] bg-white"
        rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      />
    </div>
  );
}
