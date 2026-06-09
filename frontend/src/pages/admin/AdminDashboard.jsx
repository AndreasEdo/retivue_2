import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { adminMonitoring } from '../../lib/api';

const DR_LABELS = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative'];

export default function AdminDashboard() {
  const [m, setM] = useState(null);
  useEffect(() => { adminMonitoring().then(setM).catch(() => {}); }, []);

  const cards = [
    { label: 'Registered Patients', value: m?.total_patients ?? 0, border: '#001bca', bg: '#cad6ff', fg: '#001bca', icon: 'groups' },
    { label: 'Total Screenings', value: m?.total_screenings ?? 0, border: '#7C3AED', bg: '#eaddff', fg: '#7C3AED', icon: 'visibility' },
    { label: 'Active Doctors', value: m?.active_doctors ?? 0, border: '#059669', bg: '#D1FAE5', fg: '#059669', icon: 'medical_services' },
    { label: 'Active Staff', value: m?.active_staff ?? 0, border: '#525d80', bg: '#f2f4f6', fg: '#525d80', icon: 'folder_shared' },
  ];

  return (
    <div>
      <PageHeader title="Overview" breadcrumb="System status and user metrics" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white p-6 rounded-xl shadow-sm border-l-4" style={{ borderColor: c.border }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">{c.label}</p>
                <h4 className="text-3xl font-bold text-[#0F172A]">{c.value.toLocaleString()}</h4>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: c.bg }}>
                <span className="material-symbols-outlined" style={{ color: c.fg }}>{c.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {(!m || m.recent_activity.length === 0) && <p className="text-sm text-[#64748B]">No recent cases.</p>}
            {m?.recent_activity.map((a) => (
              <div key={a.id} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#eaddff] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-sm text-[#7C3AED]">psychology</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#191c1e]">{a.message}</p>
                  <p className="text-xs text-[#64748B] mt-1">{a.time ? new Date(a.time).toLocaleString() : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Case Status</h3>
          <div className="space-y-4">
            <StatusRow label="Waiting validation" value={m?.waiting ?? 0} color="#D97706" />
            <StatusRow label="Approved" value={m?.approved ?? 0} color="#059669" />
            <StatusRow label="Rejected" value={m?.rejected ?? 0} color="#DC2626" />
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-6">DR Grade Distribution</h3>
        <div className="grid grid-cols-5 gap-4">
          {DR_LABELS.map((label, i) => (
            <div key={label} className="text-center">
              <div className="bg-[#f2f4f6] rounded-lg p-4">
                <p className="text-2xl font-bold text-[#0F172A]">{m?.dr_levels?.[String(i)] ?? 0}</p>
                <p className="text-xs text-[#64748B] mt-1">{i} · {label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#f2f4f6] rounded-lg">
      <span className="text-xs font-semibold text-[#0F172A]">{label}</span>
      <span className="text-lg font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
