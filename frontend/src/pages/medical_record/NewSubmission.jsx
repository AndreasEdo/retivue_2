import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepWizard from '../../components/ui/StepWizard';
import ClinicalCard from '../../components/ui/ClinicalCard';
import AIBadge from '../../components/ui/AIBadge';
import { mrPatients, mrDoctors, mrCreateSubmission } from '../../lib/api';

export default function NewSubmission() {
  const [currentStep, setCurrentStep] = useState(1);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient_id: '', doctor_id: '', age: '', gender: '', weight: '', height: '',
    blood_pressure: '', has_diabetes: false, diabetes_duration: '',
  });
  const [file, setFile] = useState(null);
  const [createdCase, setCreatedCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    mrPatients().then(setPatients).catch(() => {});
    mrDoctors().then(setDoctors).catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handlePatientSubmit = (e) => {
    e.preventDefault();
    setError('');
    setCurrentStep(2);
  };

  const handleAnalyze = async () => {
    if (!file) { setError('Pilih gambar retina dulu.'); return; }
    setLoading(true);
    setError('');
    try {
      const fields = {
        patient_id: form.patient_id,
        doctor_id: form.doctor_id,
        age: form.age, gender: form.gender, weight: form.weight, height: form.height,
        blood_pressure: form.blood_pressure, has_diabetes: form.has_diabetes,
        diabetes_duration: form.diabetes_duration || 0,
      };
      const c = await mrCreateSubmission(fields, file);
      setCreatedCase(c);
    } catch (err) {
      setError(err.message || 'AI analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const ai = createdCase?.ai_result;
  const gradcam = createdCase?.images?.gradcam_url;

  return (
    <div>
      <StepWizard currentStep={currentStep} totalSteps={3} />

      {currentStep === 1 && (
        <ClinicalCard>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Step 1: Patient Data</h3>
          <form onSubmit={handlePatientSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">Select Patient</label>
                <select className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm"
                  value={form.patient_id} onChange={(e) => set('patient_id', e.target.value)} required>
                  <option value="">Select Patient</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">Assign Doctor</label>
                <select className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm"
                  value={form.doctor_id} onChange={(e) => set('doctor_id', e.target.value)} required>
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">Age</label>
                <input className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm" type="number"
                  value={form.age} onChange={(e) => set('age', e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">Gender</label>
                <select className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm"
                  value={form.gender} onChange={(e) => set('gender', e.target.value)} required>
                  <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">Weight (kg)</label>
                <input className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm" type="number"
                  value={form.weight} onChange={(e) => set('weight', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">Height (cm)</label>
                <input className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm" type="number"
                  value={form.height} onChange={(e) => set('height', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Blood Pressure</label>
              <input className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm" type="text"
                placeholder="120/80" value={form.blood_pressure} onChange={(e) => set('blood_pressure', e.target.value)} />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.has_diabetes}
                onChange={(e) => set('has_diabetes', e.target.checked)} className="w-4 h-4" />
              <span className="text-xs font-semibold text-[#454655]">Has Diabetes</span>
            </label>
            {form.has_diabetes && (
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">Diabetes Duration (years)</label>
                <input className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm" type="number"
                  value={form.diabetes_duration} onChange={(e) => set('diabetes_duration', e.target.value)} />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Retinal Image</label>
              <input className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm" type="file"
                accept="image/*" onChange={(e) => setFile(e.target.files[0])} required />
            </div>
            <button type="submit" className="w-full py-2.5 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors">
              Next: AI Analysis
            </button>
          </form>
        </ClinicalCard>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <ClinicalCard isAI>
            <div className="flex items-center gap-2 mb-4">
              <AIBadge />
              <h3 className="text-lg font-semibold text-[#0F172A]">Step 2: AI Diagnostic Processing</h3>
            </div>
            {error && <div className="mb-4 text-sm text-[#DC2626] bg-[#DC2626]/10 rounded-lg px-3 py-2">{error}</div>}
            {!ai ? (
              <div className="text-center py-8">
                <button onClick={handleAnalyze} disabled={loading}
                  className="py-2.5 px-6 bg-[#7C3AED] text-white rounded-lg text-xs font-semibold hover:bg-[#6c22dd] transition-colors disabled:opacity-50">
                  {loading ? 'Analyzing… (running on CPU)' : 'Run AI Analysis'}
                </button>
                <p className="text-xs text-[#64748B] mt-3">Ben Graham preprocessing → SwinV2 regression → Grad-CAM.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#f2f4f6] rounded-lg">
                    <p className="text-xs font-semibold text-[#64748B] mb-1">Predicted Grade</p>
                    <p className="text-2xl font-bold text-[#0F172A]">Grade {ai.grade} · {ai.label}</p>
                  </div>
                  <div className="p-4 bg-[#f2f4f6] rounded-lg">
                    <p className="text-xs font-semibold text-[#64748B] mb-1">Confidence (score {ai.raw_score})</p>
                    <p className="text-2xl font-bold text-[#7C3AED]">{(ai.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>
                {gradcam && (
                  <div className="grid grid-cols-2 gap-4">
                    <figure>
                      <img src={createdCase.images.ben_graham_url} alt="Ben Graham" className="w-full rounded-lg border border-[#E2E8F0]" />
                      <figcaption className="text-xs text-[#64748B] mt-1">Normalized (Ben Graham)</figcaption>
                    </figure>
                    <figure>
                      <img src={gradcam} alt="Grad-CAM" className="w-full rounded-lg border border-[#E2E8F0]" />
                      <figcaption className="text-xs text-[#64748B] mt-1">Grad-CAM focus map</figcaption>
                    </figure>
                  </div>
                )}
                <div className="p-4 bg-[#f2f4f6] rounded-lg">
                  <p className="text-xs font-semibold text-[#64748B] mb-1">AI Recommendation</p>
                  <p className="text-sm text-[#191c1e]">{ai.recommendation}</p>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#FEF3C7] rounded-lg">
                  <span className="material-symbols-outlined text-[#D97706] text-sm">info</span>
                  <span className="text-xs font-semibold text-[#D97706]">Status: Sent to Doctor — Waiting Validation</span>
                </div>
              </div>
            )}
          </ClinicalCard>
          {ai && (
            <button onClick={() => setCurrentStep(3)}
              className="w-full py-2.5 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors">
              Continue
            </button>
          )}
        </div>
      )}

      {currentStep === 3 && (
        <ClinicalCard>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Step 3: Confirmation</h3>
          <div className="space-y-4">
            <div className="p-4 bg-[#D1FAE5] rounded-lg">
              <p className="text-sm font-semibold text-[#059669]">Submission Complete</p>
              <p className="text-xs text-[#059669] mt-1">Case sent to {createdCase?.doctor_name} for review.</p>
            </div>
            <button onClick={() => navigate('/medical-record/history')}
              className="w-full py-2.5 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors">
              Return to History
            </button>
          </div>
        </ClinicalCard>
      )}
    </div>
  );
}
