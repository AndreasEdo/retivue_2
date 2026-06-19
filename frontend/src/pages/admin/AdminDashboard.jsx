import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { adminMonitoring } from '../../lib/api';

// 2E: Max 2 accent colors. Blue (#2d3fe0) for primary counts, green for doctors.
// 2G: Reduced icon circles (w-8 h-8, lighter bg, text-[16px])
// 2L: Purple removed from non-AI elements → blue
const cards = (m) => [
  {
    label: 'Registered Patients',
    value: m?.total_patients ?? 0,
    icon: 'groups',
    iconBg: 'bg-blue-50',
    iconFg: '#2d3fe0',
    accentColor: '#2d3fe0',
  },
  {
    label: 'Total Screenings',
    value: m?.total_screenings ?? 0,
    icon: 'visibility',
    iconBg: 'bg-blue-50',
    iconFg: '#2d3fe0',
    accentColor: '#2d3fe0',
  },
  {
    label: 'Active Doctors',
    value: m?.active_doctors ?? 0,
    icon: 'medical_services',
    iconBg: 'bg-green-50',
    iconFg: '#059669',
    accentColor: '#059669',
  },
  {
    // 2E: Remove grey accent entirely → neutral border only
    label: 'Active Staff',
    value: m?.active_staff ?? 0,
    icon: 'folder_shared',
    iconBg: 'bg-slate-50',
    iconFg: '#64748B',
    accentColor: null,
  },
];

export default function AdminDashboard() {
  const [m, setM] = useState(null);
  useEffect(() => { adminMonitoring().then(setM).catch(() => {}); }, []);

  const cardList = cards(m);

  return (
    <div>
      <PageHeader title="Overview" breadcrumb="System status and user metrics" />

      {/* 2B: gap-6 between cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cardList.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-lg border border-[#F1F5F9] p-6"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
              borderLeft: c.accentColor ? `3px solid ${c.accentColor}` : undefined,
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">
                  {c.label}
                </p>
                {/* 2B: mb-2 between icon area and number */}
                <h4 className="text-3xl font-bold text-[#0F172A] mt-2">{c.value.toLocaleString()}</h4>
              </div>
              {/* 2G: w-8 h-8, no shadow, lighter bg */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${c.iconBg}`}>
                <span className="material-symbols-outlined text-[16px]" style={{ color: c.iconFg }}>
                  {c.icon}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2B: mb-6 between sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Activity panel */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#F1F5F9] p-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
          {/* 2C: Section title — editorial style */}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-4">
            Recent Activity
          </h3>
          <div>
            {(!m || m.recent_activity.length === 0) && (
              <p className="text-sm text-[#64748B]">No recent cases.</p>
            )}
            {m?.recent_activity.map((a) => (
              /* 2D: border-b instead of bg, py-3 */
              <div key={a.id} className="flex gap-4 items-start border-b border-[#F1F5F9] py-3 last:border-b-0">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-[#2d3fe0]">psychology</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#191c1e]">{a.message}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {a.time ? new Date(a.time).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Status panel */}
        <div className="bg-white rounded-lg border border-[#F1F5F9] p-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
          {/* 2C: Section title */}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-4">
            Case Status
          </h3>
          <div className="space-y-3">
            <StatusRow label="Waiting validation" value={m?.waiting ?? 0} color="#D97706" />
            <StatusRow label="Approved" value={m?.approved ?? 0} color="#059669" />
            <StatusRow label="Rejected" value={m?.rejected ?? 0} color="#DC2626" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, color }) {
  return (
    /* 2D: border-b instead of bg, py-3 */
    <div className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-b-0">
      <span className="text-xs font-medium text-[#0F172A]">{label}</span>
      <span className="text-lg font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
