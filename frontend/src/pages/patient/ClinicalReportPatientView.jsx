import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import ClinicalCard from '../../components/ui/ClinicalCard';
import { patientReport } from '../../lib/api';

export default function ClinicalReportPatientView() {
  const { id } = useParams();
  const [r, setR] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => { patientReport(id).then(setR).catch((e) => setErr(e.message)); }, [id]);

  if (err) return <div className="text-[#DC2626]">{err}</div>;
  if (!r) return <div className="text-[#64748B]">Loading report…</div>;

  const dr = r.doctor_result || {};

  return (
    <div>
      <PageHeader title={`Clinical Report #${id.slice(-6)}`} breadcrumb={`Reviewed by ${r.doctor_name}`} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ClinicalCard>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Retinal Image</h3>
          {r.original_image
            ? <img src={r.original_image} alt="Retina" className="w-full max-h-80 object-contain bg-black rounded-lg" />
            : <div className="w-full h-48 bg-[#f2f4f6] rounded-lg flex items-center justify-center text-[#757687]">No image</div>}
          <p className="text-xs text-[#64748B] mt-3">Reviewed by {r.doctor_name}
            {r.reviewed_at ? ` on ${new Date(r.reviewed_at).toLocaleDateString()}` : ''}.</p>
        </ClinicalCard>

        <ClinicalCard>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Doctor's Diagnosis</h3>
          <div className="space-y-4">
            <Block label="Final Diagnosis" value={dr.final_diagnosis} big />
            <Block label="Lifestyle Recommendation" value={dr.lifestyle_recommendation} />
            <Block label="Food Recommendation" value={dr.food_recommendation} />
            <Block label="Follow-up Plan" value={dr.follow_up_plan} />
          </div>
        </ClinicalCard>
      </div>

      <div className="p-4 bg-[#FEF3C7] rounded-lg flex items-start gap-2">
        <span className="material-symbols-outlined text-[#D97706] text-base">info</span>
        <p className="text-xs text-[#7c4a06]">
          This report reflects your ophthalmologist's final assessment. AI is used only as a screening aid;
          the diagnosis above is the clinical decision of your doctor.
        </p>
      </div>
    </div>
  );
}

function Block({ label, value, big }) {
  return (
    <div className="p-4 bg-[#f2f4f6] rounded-lg">
      <p className="text-xs font-semibold text-[#64748B] mb-1">{label}</p>
      <p className={big ? 'text-lg font-bold text-[#0F172A]' : 'text-sm text-[#191c1e]'}>{value || '—'}</p>
    </div>
  );
}
