import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { doctorMySchedules, doctorApproveSchedule, doctorRejectSchedule } from '../../lib/api';

const STATUS_STYLES = {
  pending:  { chip: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]', icon: 'schedule' },
  approved: { chip: 'bg-[#D1FAE5] text-[#059669] border-[#6EE7B7]', icon: 'check_circle' },
  rejected: { chip: 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]', icon: 'cancel' },
};

export default function DoctorSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = () => {
    setLoading(true);
    doctorMySchedules()
      .then(setSchedules)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id) => {
    setBusy(id);
    try {
      await doctorApproveSchedule(id);
      load();
    } finally { setBusy(null); }
  };

  const handleReject = async (id) => {
    setBusy(id);
    try {
      await doctorRejectSchedule(id);
      load();
    } finally { setBusy(null); }
  };

  const pending  = schedules.filter((s) => s.status === 'pending');
  const rest     = schedules.filter((s) => s.status !== 'pending');

  return (
    <div>
      <PageHeader title="My Schedules" breadcrumb="Approve or reject schedules assigned by admin" />

      {loading ? (
        <p className="text-sm text-[#64748B]">Loading schedules…</p>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-10 text-center text-sm text-[#64748B]">
          No schedules assigned yet.
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#D97706] flex items-center gap-1.5 mb-3">
                <span className="material-symbols-outlined text-[18px]">pending</span>
                Awaiting Your Approval ({pending.length})
              </h3>
              <div className="space-y-3">
                {pending.map((s) => (
                  <ScheduleRow key={s.id} s={s} busy={busy === s.id}
                    onApprove={() => handleApprove(s.id)}
                    onReject={() => handleReject(s.id)} />
                ))}
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#64748B] mb-3">Past Decisions</h3>
              <div className="space-y-3">
                {rest.map((s) => (
                  <ScheduleRow key={s.id} s={s} busy={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScheduleRow({ s, busy, onApprove, onReject }) {
  const st = STATUS_STYLES[s.status] || STATUS_STYLES.pending;
  const available = Math.max(0, (s.quota || 0) - (s.booked || 0));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${st.chip}`}>
            <span className="material-symbols-outlined text-[13px]">{st.icon}</span>
            {s.status}
          </span>
        </div>
        <p className="font-semibold text-[#0F172A]">{s.date}</p>
        <p className="text-sm text-[#64748B]">{s.start_time} – {s.end_time} · {available}/{s.quota} slots available</p>
      </div>
      {s.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            disabled={busy}
            className="px-4 py-2 bg-[#059669] text-white text-xs font-semibold rounded-lg hover:bg-[#047857] transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            {busy ? 'Saving…' : 'Approve'}
          </button>
          <button
            onClick={onReject}
            disabled={busy}
            className="px-4 py-2 bg-[#DC2626] text-white text-xs font-semibold rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
