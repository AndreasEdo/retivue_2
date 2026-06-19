import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { mrDashboard } from '../../lib/api';

const DR_LABELS = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative'];

// 2A + 2G: shadow-only cards, smaller icon circles, status accent colors kept
const STAT_CARDS = [
  { key: 'waiting',  label: 'Pending Reviews', accentColor: '#D97706', iconBg: 'bg-amber-50', iconFg: '#D97706', icon: 'pending' },
  { key: 'approved', label: 'Approved Cases',  accentColor: '#059669', iconBg: 'bg-green-50', iconFg: '#059669', icon: 'check_circle' },
  { key: 'rejected', label: 'Rejected Cases',  accentColor: '#DC2626', iconBg: 'bg-red-50',   iconFg: '#DC2626', icon: 'error' },
];

export default function MedicalRecordDashboard() {
  const [data, setData] = useState({ waiting: 0, approved: 0, rejected: 0, recent: [], dr_levels: {} });

  useEffect(() => { mrDashboard().then(setData).catch(() => {}); }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        breadcrumb="Medical Record Overview"
        actionButton={
          <Link to="/medical-record/new-submission"
            className="bg-[#2d3fe0] hover:bg-[#3748e7] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">add</span>
            New Submission
          </Link>
        }
      />

      {/* 2B: gap-6 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {STAT_CARDS.map((c) => (
          <div
            key={c.key}
            className="bg-white rounded-lg border border-[#F1F5F9] p-6"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
              borderLeft: `3px solid ${c.accentColor}`,
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">
                  {c.label}
                </p>
                {/* 2B: mt-2 between icon and number */}
                <h4 className="text-3xl font-bold text-[#0F172A] mt-2">{data[c.key] ?? 0}</h4>
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

      {/* Recent Submissions panel */}
      <div
        className="bg-white rounded-lg border border-[#F1F5F9] p-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <div className="flex justify-between items-center mb-4">
          {/* 2C: editorial section title */}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B]">
            Recent Submissions
          </h3>
          <Link to="/medical-record/history" className="text-[#2d3fe0] text-xs font-semibold hover:underline">
            View All
          </Link>
        </div>
        <div>
          {data.recent.length === 0 && (
            <p className="text-sm text-[#64748B]">No submissions yet.</p>
          )}
          {data.recent.map((c) => (
            /* 2D: border-b instead of bg, py-3 */
            <div key={c.id} className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-b-0">
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{c.patient_name}</p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Case #{c.id.slice(-4)} · {c.submitted_at ? new Date(c.submitted_at).toLocaleString() : ''}
                  {c.ai_label ? ` · AI: ${c.ai_label}` : ''}
                </p>
              </div>
              <span className="text-xs font-medium capitalize text-[#64748B]">{c.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DR Grade Distribution — submission data lives here (Medical Record) */}
      <div
        className="bg-white rounded-lg border border-[#F1F5F9] p-6 mt-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-4">
          DR Grade Distribution
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {DR_LABELS.map((label, i) => (
            <div key={label} className="text-center">
              <div className="bg-[#f8fafc] rounded-md p-4">
                <p className="text-2xl font-bold text-[#0F172A]">{data.dr_levels?.[String(i)] ?? 0}</p>
                <p className="text-xs text-[#64748B] mt-1">{i} · {label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
