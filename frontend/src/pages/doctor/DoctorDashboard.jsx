import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { doctorDashboard } from '../../lib/api';

const STAT_CARDS = [
  { key: 'waiting', label: 'Pending Reviews', border: '#D97706', bg: '#FEF3C7', fg: '#D97706', icon: 'pending' },
  { key: 'approved', label: 'Approved Cases', border: '#059669', bg: '#D1FAE5', fg: '#059669', icon: 'check_circle' },
  { key: 'rejected', label: 'Rejected Cases', border: '#DC2626', bg: '#FEE2E2', fg: '#DC2626', icon: 'error' },
];

export default function DoctorDashboard() {
  const [data, setData] = useState({ waiting: 0, approved: 0, rejected: 0, recent: [] });
  useEffect(() => { doctorDashboard().then(setData).catch(() => {}); }, []);
  const reviewed = (data.approved || 0) + (data.rejected || 0);

  return (
    <div>
      <PageHeader title="Dashboard" breadcrumb="Doctor Overview" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {STAT_CARDS.map((c) => (
          <div key={c.key} className="bg-white p-6 rounded-xl shadow-sm border-l-4" style={{ borderColor: c.border }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">{c.label}</p>
                <h4 className="text-3xl font-bold text-[#0F172A]">{data[c.key] ?? 0}</h4>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: c.bg }}>
                <span className="material-symbols-outlined" style={{ color: c.fg }}>{c.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/doctor/pending" className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0] hover:border-[#2d3fe0] transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#D97706] text-2xl">pending</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A]">Review Pending Cases</h3>
              <p className="text-sm text-[#64748B]">{data.waiting} cases waiting for your review</p>
            </div>
          </div>
        </Link>
        <Link to="/doctor/reviewed" className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0] hover:border-[#2d3fe0] transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#059669] text-2xl">history</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A]">View Reviewed Cases</h3>
              <p className="text-sm text-[#64748B]">{reviewed} cases reviewed</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-[#0F172A]">Recent Cases</h3>
          <Link to="/doctor/pending" className="text-[#001bca] text-xs font-semibold hover:underline">View All</Link>
        </div>
        <div className="space-y-3">
          {data.recent.length === 0 && <p className="text-sm text-[#64748B]">No cases yet.</p>}
          {data.recent.map((c) => (
            <Link to={`/doctor/case/${c.id}`} key={c.id} className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-lg hover:bg-[#e8ebef]">
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{c.patient_name}</p>
                <p className="text-xs text-[#64748B]">
                  Case #{c.id.slice(-4)} · {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : ''}
                  {c.ai_label ? ` · AI: ${c.ai_label}` : ''}
                </p>
              </div>
              <span className="text-xs font-semibold capitalize text-[#64748B]">{c.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
