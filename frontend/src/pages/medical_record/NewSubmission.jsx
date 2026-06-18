import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepWizard from '../../components/ui/StepWizard';
import ClinicalCard from '../../components/ui/ClinicalCard';
import { mrPatients, mrDoctors, mrCreateSubmission } from '../../lib/api';
import { validateImage } from '../../lib/validation';

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

  const handleAnalyze = async () => {
    const imgErr = validateImage(file);
    if (imgErr) { setError(imgErr); return; }
    if (form.age && (Number(form.age) < 0 || Number(form.age) > 120)) { setError('Age must be between 0 and 120.'); return; }
    if (form.weight && Number(form.weight) <= 0) { setError('Weight must be a positive number.'); return; }
    if (form.height && Number(form.height) <= 0) { setError('Height must be a positive number.'); return; }
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
      setError(err.message || 'AI analysis failed. Check that model is running.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === form.doctor_id);

  return (
    <div>
      <StepWizard currentStep={currentStep} totalSteps={3} />

      {/* ── Step 1: Patient data ── */}
      {currentStep === 1 && (
        <ClinicalCard>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Step 1: Patient Data</h3>
          <form onSubmit={(e) => { e.preventDefault(); setError(''); setCurrentStep(2); }} className="space-y-4">
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
              Next: Run AI Analysis
            </button>
          </form>
        </ClinicalCard>
      )}

      {/* ── Step 2: AI Processing (MR does NOT see AI results) ── */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <ClinicalCard>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Step 2: AI Processing</h3>

            {error && <div className="mb-4 text-sm text-[#DC2626] bg-[#DC2626]/10 rounded-lg px-3 py-2">{error}</div>}

            {!createdCase ? (
              <div className="text-center py-10 space-y-4">
                {loading ? (
                  <>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#7C3AED]/10 mb-2">
                      <span className="material-symbols-outlined text-[#7C3AED] text-4xl animate-spin" style={{ animationDuration: '1.5s' }}>autorenew</span>
                    </div>
                    <p className="text-sm font-semibold text-[#0F172A]">Running AI analysis on CPU…</p>
                    <p className="text-xs text-[#64748B]">Ben Graham preprocessing → SwinV2 → Grad-CAM. This may take 20–30 s.</p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2d3fe0]/10 mb-2">
                      <span className="material-symbols-outlined text-[#2d3fe0] text-4xl">biotech</span>
                    </div>
                    <p className="text-sm font-semibold text-[#0F172A]">Ready to run AI analysis</p>
                    <p className="text-xs text-[#64748B]">The retinal image will be processed by the SwinV2 AI model.<br />AI results are reviewed exclusively by the assigned doctor.</p>
                    <button onClick={handleAnalyze}
                      className="mt-2 py-2.5 px-8 bg-[#7C3AED] text-white rounded-lg text-xs font-semibold hover:bg-[#6c22dd] transition-colors">
                      Run AI Analysis
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Success state — MR only sees submission status, NOT AI grade/score/images */}
                <div className="flex items-start gap-3 p-4 bg-[#D1FAE5] rounded-xl border border-[#6EE7B7]">
                  <span className="material-symbols-outlined text-[#059669] text-2xl mt-0.5">check_circle</span>
                  <div>
                    <p className="font-semibold text-[#059669] text-sm">AI Analysis Complete</p>
                    <p className="text-xs text-[#047857] mt-1">
                      The retinal image has been processed and the case has been forwarded to
                      <strong> {createdCase.doctor_name || selectedDoctor?.name || 'the assigned doctor'}</strong> for clinical review.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#FEF3C7] rounded-xl border border-[#FDE68A]">
                  <span className="material-symbols-outlined text-[#D97706] text-[18px] mt-0.5">info</span>
                  <p className="text-xs text-[#92400E]">
                    AI findings and Grad-CAM maps are available to the doctor only. Medical record staff are not shown diagnostic details per clinical workflow policy.
                  </p>
                </div>
              </div>
            )}
          </ClinicalCard>

          {createdCase && (
            <button onClick={() => setCurrentStep(3)}
              className="w-full py-2.5 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors">
              Continue to Confirmation
            </button>
          )}
        </div>
      )}

      {/* ── Step 3: Confirmation ── */}
      {currentStep === 3 && (
        <ClinicalCard>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Step 3: Confirmation</h3>
          <div className="space-y-4">
            <div className="p-4 bg-[#D1FAE5] rounded-lg">
              <p className="text-sm font-semibold text-[#059669]">Submission Complete</p>
              <p className="text-xs text-[#059669] mt-1">
                Case ID {createdCase?.id?.slice(-6).toUpperCase()} forwarded to {createdCase?.doctor_name || selectedDoctor?.name || 'doctor'} for review.
              </p>
            </div>
            <button onClick={() => navigate('/medical-record/history')}
              className="w-full py-2.5 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors">
              Return to Submission History
            </button>
          </div>
        </ClinicalCard>
      )}
    </div>
  );
}
