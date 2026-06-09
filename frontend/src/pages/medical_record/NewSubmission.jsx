import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepWizard from '../../components/ui/StepWizard';
import ClinicalCard from '../../components/ui/ClinicalCard';
import AIBadge from '../../components/ui/AIBadge';
import { mockData, addCase } from '../../store/mockData';
import { predict, explain } from '../../lib/api';

export default function NewSubmission() {
  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState({
    patientId: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    bloodPressure: '',
    hasDiabetes: false,
    diabetesDuration: '',
  });
  const [file, setFile] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePatientSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await predict(file);
      setAiResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToDoctor = () => {
    const newCase = addCase({
      patientId: parseInt(patientData.patientId),
      patientName: mockData.patients.find((p) => p.id === parseInt(patientData.patientId))?.name || 'Unknown',
      doctorId: 1,
      doctorName: 'Dr. Budi Santoso',
      submittedBy: 'Rina Kusuma',
      patientData,
      aiResult,
    });
    setCurrentStep(3);
  };

  const handleComplete = () => {
    navigate('/medical-record/history');
  };

  return (
    <div>
      <StepWizard currentStep={currentStep} totalSteps={3} />

      {currentStep === 1 && (
        <ClinicalCard>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Step 1: Patient Data</h3>
          <form onSubmit={handlePatientSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Select Patient</label>
              <select
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                value={patientData.patientId}
                onChange={(e) => setPatientData({ ...patientData, patientId: e.target.value })}
                required
              >
                <option value="">Select Patient</option>
                {mockData.patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">Age</label>
                <input
                  className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                  type="number"
                  value={patientData.age}
                  onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">Gender</label>
                <select
                  className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                  value={patientData.gender}
                  onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">Weight (kg)</label>
                <input
                  className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                  type="number"
                  value={patientData.weight}
                  onChange={(e) => setPatientData({ ...patientData, weight: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">Height (cm)</label>
                <input
                  className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                  type="number"
                  value={patientData.height}
                  onChange={(e) => setPatientData({ ...patientData, height: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Blood Pressure</label>
              <input
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                type="text"
                placeholder="120/80"
                value={patientData.bloodPressure}
                onChange={(e) => setPatientData({ ...patientData, bloodPressure: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={patientData.hasDiabetes}
                  onChange={(e) => setPatientData({ ...patientData, hasDiabetes: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-xs font-semibold text-[#454655]">Has Diabetes</span>
              </label>
            </div>
            {patientData.hasDiabetes && (
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">Diabetes Duration (years)</label>
                <input
                  className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                  type="number"
                  value={patientData.diabetesDuration}
                  onChange={(e) => setPatientData({ ...patientData, diabetesDuration: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Retinal Image</label>
              <input
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors"
            >
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
              <h3 className="text-lg font-semibold text-[#0F172A]">Step 2: AI Analysis</h3>
            </div>
            {!aiResult ? (
              <div className="text-center py-8">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="py-2.5 px-6 bg-[#7C3AED] text-white rounded-lg text-xs font-semibold hover:bg-[#6c22dd] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Run AI Analysis'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-[#f2f4f6] rounded-lg">
                  <p className="text-xs font-semibold text-[#64748B] mb-1">Predicted Class</p>
                  <p className="text-2xl font-bold text-[#0F172A]">{aiResult.predicted_class || 'DR Level 2'}</p>
                </div>
                <div className="p-4 bg-[#f2f4f6] rounded-lg">
                  <p className="text-xs font-semibold text-[#64748B] mb-1">Confidence Score</p>
                  <p className="text-2xl font-bold text-[#7C3AED]">{(aiResult.confidence * 100).toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-[#f2f4f6] rounded-lg">
                  <p className="text-xs font-semibold text-[#64748B] mb-1">AI Recommendation</p>
                  <p className="text-sm text-[#191c1e]">{aiResult.recommendation || 'Moderate diabetic retinopathy detected. Recommend immediate ophthalmologist consultation.'}</p>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#FEF3C7] rounded-lg">
                  <span className="material-symbols-outlined text-[#D97706] text-sm">info</span>
                  <span className="text-xs font-semibold text-[#D97706]">Status: Waiting Doctor Validation</span>
                </div>
              </div>
            )}
          </ClinicalCard>
          {aiResult && (
            <button
              onClick={handleSendToDoctor}
              className="w-full py-2.5 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors"
            >
              Send to Doctor
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
              <p className="text-xs text-[#059669] mt-1">Case has been sent to doctor for review.</p>
            </div>
            <button
              onClick={handleComplete}
              className="w-full py-2.5 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors"
            >
              Return to History
            </button>
          </div>
        </ClinicalCard>
      )}
    </div>
  );
}
