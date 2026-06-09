import { useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import ClinicalCard from '../../components/ui/ClinicalCard';
import AIBadge from '../../components/ui/AIBadge';
import { mockData } from '../../store/mockData';

export default function ClinicalReportPatientView() {
  const { id } = useParams();
  const case_ = mockData.cases.find((c) => c.id === parseInt(id));

  if (!case_) {
    return <div>Report not found</div>;
  }

  return (
    <div>
      <PageHeader
        title={`Clinical Report #${case_.id}`}
        breadcrumb={`Patient: ${case_.patientName}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Patient Info */}
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
          </div>
        </ClinicalCard>

        {/* AI Results */}
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
            <div className="p-4 bg-[#f2f4f6] rounded-lg">
              <p className="text-xs font-semibold text-[#64748B] mb-1">AI Recommendation</p>
              <p className="text-sm text-[#191c1e]">{case_.aiResult.recommendation}</p>
            </div>
          </div>
        </ClinicalCard>
      </div>

      {/* Doctor's Diagnosis */}
      {case_.doctorResult && !case_.doctorResult.rejectNote && (
        <ClinicalCard>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Doctor's Diagnosis</h3>
          <div className="space-y-4">
            <div className="p-4 bg-[#f2f4f6] rounded-lg">
              <p className="text-xs font-semibold text-[#64748B] mb-1">Final Diagnosis</p>
              <p className="text-lg font-bold text-[#0F172A]">{case_.doctorResult.finalDiagnosis}</p>
            </div>
            <div className="p-4 bg-[#f2f4f6] rounded-lg">
              <p className="text-xs font-semibold text-[#64748B] mb-1">Lifestyle Recommendation</p>
              <p className="text-sm text-[#191c1e]">{case_.doctorResult.lifestyleRecommendation}</p>
            </div>
            <div className="p-4 bg-[#f2f4f6] rounded-lg">
              <p className="text-xs font-semibold text-[#64748B] mb-1">Food Recommendation</p>
              <p className="text-sm text-[#191c1e]">{case_.doctorResult.foodRecommendation}</p>
            </div>
            <div className="p-4 bg-[#f2f4f6] rounded-lg">
              <p className="text-xs font-semibold text-[#64748B] mb-1">Follow-up Plan</p>
              <p className="text-sm text-[#191c1e]">{case_.doctorResult.followUpPlan}</p>
            </div>
          </div>
        </ClinicalCard>
      )}

      <div className="mt-6 p-4 bg-[#f2f4f6] rounded-lg text-center">
        <p className="text-xs text-[#64748B]">
          Report generated on {new Date(case_.submittedAt).toLocaleString()} by {case_.doctorName}
        </p>
      </div>
    </div>
  );
}
