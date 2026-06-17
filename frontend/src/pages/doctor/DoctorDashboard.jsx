import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { doctorDashboard } from '../../lib/api';

// 2A + 2G: shadow-only cards with status accent borders, smaller icon circles
const STAT_CARDS = [
  { key: 'waiting',  label: 'Pending Reviews', accentColor: '#D97706', iconBg: 'bg-amber-50', iconFg: '#D97706', icon: 'pending' },
  { key: 'approved', label: 'Approved Cases',  accentColor: '#059669', iconBg: 'bg-green-50', iconFg: '#059669', icon: 'check_circle' },
  { key: 'rejected', label: 'Rejected Cases',  accentColor: '#DC2626', iconBg: 'bg-red-50',   iconFg: '#DC2626', icon: 'error' },
];

export default function DoctorDashboard() {
  const [data, setData] = useState({ waiting: 0, approved: 0, rejected: 0, recent: [] });
  useEffect(() => { doctorDashboard().then(setData).catch(() => {}); }, []);
  const reviewed = (data.approved || 0) + (data.rejected || 0);

  return (
    <div>
      <PageHeader title="Dashboard" breadcrumb="Doctor Overview" />

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
                {/* 2B: mt-2 gap */}
                <h4 className="text-3xl font-bold text-[#0F172A] mt-2">{data[c.key] ?? 0}</h4>
              </div>
              {/* 2G: w-8 h-8, lighter bg, text-[16px] */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${c.iconBg}`}>
                <span className="material-symbols-outlined text-[16px]" style={{ color: c.iconFg }}>
                  {c.icon}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick action cards — 2B: gap-6 mb-6, 2G: smaller icon circles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Link
          to="/doctor/pending"
          className="bg-white rounded-lg border border-[#F1F5F9] p-6 hover:border-[#2d3fe0] transition-colors"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-4">
            {/* 2G: w-8 h-8 */}
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[#D97706]">pending</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Review Pending Cases</h3>
              <p className="text-xs text-[#64748B] mt-0.5">{data.waiting} cases waiting for your review</p>
            </div>
          </div>
        </Link>
        <Link
          to="/doctor/reviewed"
          className="bg-white rounded-lg border border-[#F1F5F9] p-6 hover:border-[#2d3fe0] transition-colors"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[#059669]">history</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">View Reviewed Cases</h3>
              <p className="text-xs text-[#64748B] mt-0.5">{reviewed} cases reviewed</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Cases panel */}
      <div
        className="bg-white rounded-lg border border-[#F1F5F9] p-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <div className="flex justify-between items-center mb-4">
          {/* 2C: editorial section title */}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B]">
            Recent Cases
          </h3>
          <Link to="/doctor/pending" className="text-[#2d3fe0] text-xs font-semibold hover:underline">
            View All
          </Link>
        </div>
        <div>
          {data.recent.length === 0 && (
            <p className="text-sm text-[#64748B]">No cases yet.</p>
          )}
          {data.recent.map((c) => (
            /* 2D: border-b feed, no bg, py-3 */
            <Link
              to={`/doctor/case/${c.id}`}
              key={c.id}
              className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#fafafa] -mx-6 px-6 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{c.patient_name}</p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Case #{c.id.slice(-4)} · {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : ''}
                  {c.ai_label ? ` · AI: ${c.ai_label}` : ''}
                </p>
              </div>
              <span className="text-xs font-medium capitalize text-[#64748B]">{c.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
