import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { adminMonitoring } from '../../lib/api';

const DR_LABELS = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative'];

export default function SystemMonitoring() {
  const [m, setM] = useState(null);
  useEffect(() => { adminMonitoring().then(setM).catch(() => {}); }, []);

  const drLevels = m?.dr_levels || {};
  const total = Object.values(drLevels).reduce((a, b) => a + b, 0) || 1;

  const stats = [
    { label: 'Total Patients', value: m?.total_patients ?? 0 },
    { label: 'Total Screenings', value: m?.total_screenings ?? 0 },
    { label: 'Active Doctors', value: m?.active_doctors ?? 0 },
    { label: 'Active Staff', value: m?.active_staff ?? 0 },
  ];

  return (
    <div>
      <PageHeader title="System Monitoring" breadcrumb="System health and metrics" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0]">
            <p className="text-[11px] font-semibold text-[#64748B] mb-2 uppercase tracking-wider">{s.label}</p>
            <p className="text-3xl font-bold text-[#0F172A]">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Cases by DR Grade</h3>
        <div className="space-y-4">
          {DR_LABELS.map((label, i) => {
            const count = drLevels[String(i)] || 0;
            const pct = ((count / total) * 100).toFixed(1);
            return (
              <div key={label}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-semibold text-[#0F172A]">{i} · {label}</span>
                  <span className="text-xs text-[#64748B]">{count} ({pct}%)</span>
                </div>
                <div className="h-3 bg-[#f2f4f6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2d3fe0] rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Case Workflow Status</h3>
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
    <div className="p-4 bg-[#f2f4f6] rounded-lg text-center">
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-[#64748B] mt-1">{label}</p>
    </div>
  );
}
