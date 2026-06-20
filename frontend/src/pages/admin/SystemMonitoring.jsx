import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { adminMonitoring } from '../../lib/api';

export default function SystemMonitoring() {
  const [m, setM] = useState(null);
  useEffect(() => { adminMonitoring().then(setM).catch(() => {}); }, []);

  const stats = [
    { label: 'Total Patients', value: m?.total_patients ?? 0 },
    { label: 'Total Screenings', value: m?.total_screenings ?? 0 },
    { label: 'Active Doctors', value: m?.active_doctors ?? 0 },
    { label: 'Active Staff', value: m?.active_staff ?? 0 },
  ];

  return (
    <div>
      <PageHeader title="System Monitoring" breadcrumb="System health and metrics" />

      {/* 2B: gap-6 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white p-6 rounded-lg border border-[#F1F5F9]"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
          >
            <p className="text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">{s.label}</p>
            <p className="text-3xl font-bold text-[#0F172A] mt-2">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div
        className="bg-white rounded-lg border border-[#F1F5F9] p-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
      >
        {/* 2C: editorial section title */}
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-4">Case Workflow Status</h3>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Waiting" value={m?.waiting ?? 0} color="#D97706" />
          <Stat label="Approved" value={m?.approved ?? 0} color="#059669" />
          <Stat label="Rejected" value={m?.rejected ?? 0} color="#DC2626" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="p-4 bg-[#f8fafc] rounded-md text-center">
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-[#64748B] mt-1">{label}</p>
    </div>
  );
}
