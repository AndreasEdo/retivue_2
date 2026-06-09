import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import ClinicalCard from '../../components/ui/ClinicalCard';
import AIBadge from '../../components/ui/AIBadge';
import { mockData, updateCase } from '../../store/mockData';

export default function DoctorCaseReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [action, setAction] = useState(''); // 'approve' or 'reject'
  const [formData, setFormData] = useState({
    finalDiagnosis: '',
    lifestyleRecommendation: '',
    foodRecommendation: '',
    followUpPlan: '',
    rejectNote: '',
  });

  const case_ = mockData.cases.find((c) => c.id === parseInt(id));

  if (!case_) {
    return <div>Case not found</div>;
  }

  const handleReject = () => {
    updateCase(case_.id, {
      status: 'rejected',
      doctorResult: { rejectNote: formData.rejectNote },
    });
    navigate('/doctor/pending');
  };

  const handleApprove = () => {
    updateCase(case_.id, {
      status: 'approved',
      doctorResult: {
        finalDiagnosis: formData.finalDiagnosis,
        lifestyleRecommendation: formData.lifestyleRecommendation,
        foodRecommendation: formData.foodRecommendation,
        followUpPlan: formData.followUpPlan,
      },
    });
    navigate('/doctor/pending');
  };

  return (
    <div>
      <PageHeader
        title={`Case Review #${case_.id}`}
        breadcrumb={`Patient: ${case_.patientName}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Patient Info */}
        <ClinicalCard>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Patient Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-[#64748B] mb-1">Name</p>
                <p className="text-sm text-[#0F172A]">{case_.patientName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#64748B] mb-1">Age</p>
                <p className="text-sm text-[#0F172A]">{case_.patientData.age}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#64748B] mb-1">Gender</p>
                <p className="text-sm text-[#0F172A]">{case_.patientData.gender}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#64748B] mb-1">Blood Pressure</p>
                <p className="text-sm text-[#0F172A]">{case_.patientData.bloodPressure}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748B] mb-1">Has Diabetes</p>
              <p className="text-sm text-[#0F172A]">{case_.patientData.hasDiabetes ? 'Yes' : 'No'}</p>
            </div>
            {case_.patientData.hasDiabetes && (
              <div>
                <p className="text-xs font-semibold text-[#64748B] mb-1">Diabetes Duration</p>
                <p className="text-sm text-[#0F172A]">{case_.patientData.diabetesDuration} years</p>
              </div>
            )}
            <div className="mt-6">
              <p className="text-xs font-semibold text-[#64748B] mb-2">Retinal Image</p>
              <div className="w-full h-48 bg-[#f2f4f6] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[#757687] text-4xl">image</span>
              </div>
            </div>
          </div>
        </ClinicalCard>

        {/* Right Panel: AI Results */}
        <ClinicalCard isAI>
          <div className="flex items-center gap-2 mb-6">
            <AIBadge />
            <h3 className="text-lg font-semibold text-[#0F172A]">AI Analysis Results</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-[#f2f4f6] rounded-lg">
              <p className="text-xs font-semibold text-[#64748B] mb-1">Predicted Class</p>
              <p className="text-2xl font-bold text-[#7C3AED]">{case_.aiResult.predictedClass}</p>
            </div>
            <div className="p-4 bg-[#f2f4f6] rounded-lg">
              <p className="text-xs font-semibold text-[#64748B] mb-1">Confidence Score</p>
              <p className="text-2xl font-bold text-[#7C3AED]">{(case_.aiResult.confidence * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748B] mb-2">Probability Distribution</p>
              <div className="space-y-2">
                {Object.entries(case_.aiResult.probabilities).map(([level, prob]) => (
                  <div key={level}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#64748B]">{level}</span>
                      <span className="font-semibold">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#7C3AED] rounded-full"
                        style={{ width: `${prob * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-[#f2f4f6] rounded-lg">
              <p className="text-xs font-semibold text-[#64748B] mb-1">AI Recommendation</p>
              <p className="text-sm text-[#191c1e]">{case_.aiResult.recommendation}</p>
            </div>
          </div>
        </ClinicalCard>
      </div>

      {/* Doctor Action */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Doctor Action</h3>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setAction('approve')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-semibold transition-colors ${
              action === 'approve'
                ? 'bg-[#059669] text-white'
                : 'bg-[#f2f4f6] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            Approve
          </button>
          <button
            onClick={() => setAction('reject')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-semibold transition-colors ${
              action === 'reject'
                ? 'bg-[#DC2626] text-white'
                : 'bg-[#f2f4f6] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            Reject
          </button>
        </div>

        {action === 'approve' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Final Diagnosis</label>
              <input
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                type="text"
                value={formData.finalDiagnosis}
                onChange={(e) => setFormData({ ...formData, finalDiagnosis: e.target.value })}
                placeholder="Enter final diagnosis"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Lifestyle Recommendation</label>
              <textarea
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                rows="3"
                value={formData.lifestyleRecommendation}
                onChange={(e) => setFormData({ ...formData, lifestyleRecommendation: e.target.value })}
                placeholder="Enter lifestyle recommendations"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Food Recommendation</label>
              <textarea
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                rows="3"
                value={formData.foodRecommendation}
                onChange={(e) => setFormData({ ...formData, foodRecommendation: e.target.value })}
                placeholder="Enter food recommendations"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Follow-up Plan</label>
              <input
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                type="text"
                value={formData.followUpPlan}
                onChange={(e) => setFormData({ ...formData, followUpPlan: e.target.value })}
                placeholder="Enter follow-up plan"
              />
            </div>
            <button
              onClick={handleApprove}
              className="w-full py-2.5 px-4 bg-[#059669] text-white rounded-lg text-xs font-semibold hover:bg-[#047857] transition-colors"
            >
              Submit Approval
            </button>
          </div>
        )}

        {action === 'reject' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Reject Note</label>
              <textarea
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                rows="4"
                value={formData.rejectNote}
                onChange={(e) => setFormData({ ...formData, rejectNote: e.target.value })}
                placeholder="Enter reason for rejection"
                required
              />
            </div>
            <button
              onClick={handleReject}
              className="w-full py-2.5 px-4 bg-[#DC2626] text-white rounded-lg text-xs font-semibold hover:bg-[#B91C1C] transition-colors"
            >
              Submit Rejection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
