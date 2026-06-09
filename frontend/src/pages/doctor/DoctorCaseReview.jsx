import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import ClinicalCard from '../../components/ui/ClinicalCard';
import AIBadge from '../../components/ui/AIBadge';
import { doctorCase, doctorApprove, doctorReject } from '../../lib/api';

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
        <ClinicalCard>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Patient Information</h3>
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
          <div className="mt-6">
            <p className="text-xs font-semibold text-[#64748B] mb-2">Original Retinal Image</p>
            {img.original_url
              ? <img src={img.original_url} alt="Retina" className="w-full max-h-72 object-contain bg-black rounded-lg" />
              : <div className="w-full h-48 bg-[#f2f4f6] rounded-lg flex items-center justify-center text-[#757687]">No image</div>}
          </div>
        </ClinicalCard>

        <ClinicalCard isAI>
          <div className="flex items-center gap-2 mb-6"><AIBadge /><h3 className="text-lg font-semibold text-[#0F172A]">AI Analysis Results</h3></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-[#f2f4f6] rounded-lg">
              <p className="text-xs font-semibold text-[#64748B] mb-1">Predicted Grade</p>
              <p className="text-xl font-bold text-[#7C3AED]">Grade {ai.grade} · {ai.label}</p>
            </div>
            <div className="p-4 bg-[#f2f4f6] rounded-lg">
              <p className="text-xs font-semibold text-[#64748B] mb-1">Confidence (score {ai.raw_score})</p>
              <p className="text-xl font-bold text-[#7C3AED]">{ai.confidence != null ? `${(ai.confidence * 100).toFixed(0)}%` : '—'}</p>
            </div>
          </div>
          {ai.probabilities && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#64748B] mb-2">Probability per Class (estimated from regression score)</p>
              <div className="space-y-2">
                {Object.entries(ai.probabilities).map(([level, prob]) => (
                  <div key={level}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-[#64748B]">{level}</span><span className="font-semibold">{(prob * 100).toFixed(0)}%</span></div>
                    <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden"><div className="h-full bg-[#7C3AED] rounded-full" style={{ width: `${prob * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {img.gradcam_url && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#64748B] mb-2">Grad-CAM (focus map)</p>
              <img src={img.gradcam_url} alt="Grad-CAM" className="w-full max-h-64 object-contain rounded-lg border border-[#E2E8F0]" />
            </div>
          )}
          <div className="p-4 bg-[#f2f4f6] rounded-lg">
            <p className="text-xs font-semibold text-[#64748B] mb-1">AI Recommendation</p>
            <p className="text-sm text-[#191c1e]">{ai.recommendation}</p>
          </div>
        </ClinicalCard>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Doctor Validation</h3>
        {err && <div className="mb-4 text-sm text-[#DC2626] bg-[#DC2626]/10 rounded-lg px-3 py-2">{err}</div>}

        {reviewed ? (
          <div className="p-4 rounded-lg bg-[#f2f4f6]">
            <p className="text-sm font-semibold capitalize text-[#0F172A]">This case is already {c.status}.</p>
            {c.doctor_result?.final_diagnosis && <p className="text-sm text-[#64748B] mt-1">Diagnosis: {c.doctor_result.final_diagnosis}</p>}
            {c.doctor_result?.reject_note && <p className="text-sm text-[#64748B] mt-1">Reject note: {c.doctor_result.reject_note}</p>}
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-6">
              <button onClick={() => setAction('approve')} className={`flex-1 py-3 rounded-lg text-xs font-semibold ${action === 'approve' ? 'bg-[#059669] text-white' : 'bg-[#f2f4f6] text-[#64748B] hover:bg-[#E2E8F0]'}`}>Approve</button>
              <button onClick={() => setAction('reject')} className={`flex-1 py-3 rounded-lg text-xs font-semibold ${action === 'reject' ? 'bg-[#DC2626] text-white' : 'bg-[#f2f4f6] text-[#64748B] hover:bg-[#E2E8F0]'}`}>Reject</button>
            </div>

            {action === 'approve' && (
              <div className="space-y-4">
                <Input label="Final Diagnosis" value={form.final_diagnosis} onChange={(v) => setForm({ ...form, final_diagnosis: v })} placeholder="e.g. Moderate Diabetic Retinopathy" />
                <TextArea label="Lifestyle Recommendation" value={form.lifestyle_recommendation} onChange={(v) => setForm({ ...form, lifestyle_recommendation: v })} />
                <TextArea label="Food Recommendation" value={form.food_recommendation} onChange={(v) => setForm({ ...form, food_recommendation: v })} />
                <Input label="Follow-up Plan" value={form.follow_up_plan} onChange={(v) => setForm({ ...form, follow_up_plan: v })} placeholder="e.g. Recheck in 3 months" />
                <button onClick={submitApprove} disabled={busy} className="w-full py-2.5 bg-[#059669] text-white rounded-lg text-xs font-semibold hover:bg-[#047857] disabled:opacity-60">{busy ? 'Submitting…' : 'Submit Approval'}</button>
              </div>
            )}
            {action === 'reject' && (
              <div className="space-y-4">
                <TextArea label="Reject Note" value={form.reject_note} onChange={(v) => setForm({ ...form, reject_note: v })} placeholder="e.g. Image too blurry; please re-capture." rows={4} />
                <button onClick={submitReject} disabled={busy} className="w-full py-2.5 bg-[#DC2626] text-white rounded-lg text-xs font-semibold hover:bg-[#B91C1C] disabled:opacity-60">{busy ? 'Submitting…' : 'Submit Rejection'}</button>
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
      <p className="text-xs font-semibold text-[#64748B] mb-1">{label}</p>
      <p className="text-sm text-[#0F172A]">{value ?? '—'}</p>
    </div>
  );
}
function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#454655] mb-2">{label}</label>
      <input className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm focus:ring-[#2d3fe0] focus:border-[#2d3fe0]"
        type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#454655] mb-2">{label}</label>
      <textarea className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm focus:ring-[#2d3fe0] focus:border-[#2d3fe0]"
        rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
