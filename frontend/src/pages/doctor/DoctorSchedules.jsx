import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import {
  doctorMySchedules, doctorApproveSchedule, doctorRejectSchedule, doctorAppointments,
} from '../../lib/api';
import { useConfirm } from '../../context/ConfirmContext';

const STATUS_STYLES = {
  pending:  { chip: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]', icon: 'schedule' },
  approved: { chip: 'bg-[#D1FAE5] text-[#059669] border-[#6EE7B7]', icon: 'check_circle' },
  rejected: { chip: 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]', icon: 'cancel' },
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function DoctorSchedules() {
  const confirm = useConfirm();
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [view, setView] = useState('list');
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([doctorMySchedules(), doctorAppointments().catch(() => [])])
      .then(([s, a]) => { setSchedules(s || []); setAppointments(a || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleApprove = async (id) => {
    if (!(await confirm({ title: 'Approve this schedule?', message: 'It will become available for patients to book.', confirmText: 'Approve' }))) return;
    setBusy(id);
    try { await doctorApproveSchedule(id); load(); } finally { setBusy(null); }
  };
  const handleReject = async (id) => {
    if (!(await confirm({ title: 'Reject this schedule?', message: 'It will not be shown to patients.', confirmText: 'Reject', danger: true }))) return;
    setBusy(id);
    try { await doctorRejectSchedule(id); load(); } finally { setBusy(null); }
  };

  const pending = schedules.filter((s) => s.status === 'pending');
  const rest = schedules.filter((s) => s.status !== 'pending');

  return (
    <div>
      <PageHeader title="My Schedules" breadcrumb="Approve schedules and view bookings" />

      {/* View toggle */}
      <div className="flex gap-2 mb-6">
        {[['list', 'List', 'list'], ['calendar', 'Calendar', 'calendar_month']].map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors border flex items-center gap-1.5 ${
              view === key
                ? 'bg-[#2d3fe0] text-white border-[#2d3fe0]'
                : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#f2f4f6]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{icon}</span>{label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[#64748B]">Loading…</p>
      ) : view === 'list' ? (
        <ListView pending={pending} rest={rest} busy={busy} onApprove={handleApprove} onReject={handleReject} />
      ) : (
        <CalendarView
          schedules={schedules}
          appointments={appointments}
          cursor={cursor}
          setCursor={setCursor}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      )}
    </div>
  );
}

/* ---------------- List view ---------------- */
function ListView({ pending, rest, busy, onApprove, onReject }) {
  if (pending.length === 0 && rest.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-10 text-center text-sm text-[#64748B]">
        No schedules assigned yet.
      </div>
    );
  }
  return (
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
                onApprove={() => onApprove(s.id)} onReject={() => onReject(s.id)} />
            ))}
          </div>
        </div>
      )}
      {rest.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#64748B] mb-3">Past Decisions</h3>
          <div className="space-y-3">
            {rest.map((s) => <ScheduleRow key={s.id} s={s} busy={false} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleRow({ s, busy, onApprove, onReject }) {
  const status = s.status || 'approved';
  const st = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const available = Math.max(0, (s.quota || 0) - (s.booked || 0));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${st.chip}`}>
            <span className="material-symbols-outlined text-[13px]">{st.icon}</span>{status}
          </span>
        </div>
        <p className="font-semibold text-[#0F172A]">{s.date}</p>
        <p className="text-sm text-[#64748B]">{s.start_time} – {s.end_time} · {available}/{s.quota} slots available</p>
      </div>
      {status === 'pending' && (
        <div className="flex gap-2">
          <button onClick={onApprove} disabled={busy}
            className="px-4 py-2 bg-[#059669] text-white text-xs font-semibold rounded-lg hover:bg-[#047857] transition-colors disabled:opacity-50 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">check</span>{busy ? 'Saving…' : 'Approve'}
          </button>
          <button onClick={onReject} disabled={busy}
            className="px-4 py-2 bg-[#DC2626] text-white text-xs font-semibold rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-50 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">close</span>Reject
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Calendar view ---------------- */
function CalendarView({ schedules, appointments, cursor, setCursor, selectedDay, setSelectedDay }) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // group approved schedules + appointments by date string
  const schedByDate = {};
  schedules.filter((s) => (s.status || 'approved') === 'approved').forEach((s) => {
    (schedByDate[s.date] = schedByDate[s.date] || []).push(s);
  });
  const apptByDate = {};
  appointments.forEach((a) => { (apptByDate[a.date] = apptByDate[a.date] || []).push(a); });

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const todayStr = ymd(new Date());
  const detail = selectedDay
    ? { schedules: schedByDate[selectedDay] || [], appts: apptByDate[selectedDay] || [] }
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#0F172A]">{MONTHS[month]} {year}</h3>
          <div className="flex gap-2">
            <button onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="w-8 h-8 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#f2f4f6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button onClick={() => { setCursor(new Date()); }}
              className="px-3 h-8 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:bg-[#f2f4f6]">
              Today
            </button>
            <button onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="w-8 h-8 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#f2f4f6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-[11px] font-semibold text-[#64748B] py-1">{w}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={`e${i}`} />;
            const ds = ymd(d);
            const hasSched = !!schedByDate[ds];
            const bookings = (apptByDate[ds] || []).length;
            const isToday = ds === todayStr;
            const isSelected = ds === selectedDay;
            return (
              <button
                key={ds}
                onClick={() => setSelectedDay(ds === selectedDay ? null : ds)}
                className={`aspect-square rounded-lg border p-1.5 flex flex-col items-start justify-start text-left transition-colors ${
                  isSelected ? 'border-[#2d3fe0] bg-[#EEF2FF]'
                  : hasSched ? 'border-[#c7d2fe] bg-[#f5f7ff] hover:border-[#2d3fe0]'
                  : 'border-[#F1F5F9] hover:bg-[#f8fafc]'
                }`}
              >
                <span className={`text-xs font-semibold ${isToday ? 'text-white bg-[#2d3fe0] rounded-full w-5 h-5 flex items-center justify-center' : 'text-[#0F172A]'}`}>
                  {d.getDate()}
                </span>
                {hasSched && (
                  <span className="mt-auto text-[10px] font-medium text-[#2d3fe0]">
                    {bookings > 0 ? `${bookings} booked` : 'open'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {detail && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <h3 className="text-sm font-semibold text-[#0F172A] mb-4">
            {new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          {detail.schedules.length === 0 ? (
            <p className="text-sm text-[#64748B]">No schedule on this day.</p>
          ) : (
            <div className="space-y-4">
              {detail.schedules.map((s) => {
                const slotAppts = detail.appts.filter((a) => a.time === s.start_time);
                return (
                  <div key={s.id} className="border border-[#F1F5F9] rounded-lg p-4">
                    <p className="text-sm font-semibold text-[#0F172A]">{s.start_time} – {s.end_time}</p>
                    <p className="text-xs text-[#64748B] mb-3">{s.booked || 0}/{s.quota} booked</p>
                    {slotAppts.length === 0 ? (
                      <p className="text-xs text-[#64748B]">No bookings yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {slotAppts.map((a) => (
                          <li key={a.id} className="flex items-start gap-2 text-sm">
                            <span className="material-symbols-outlined text-[16px] text-[#2d3fe0] mt-0.5">person</span>
                            <div>
                              <p className="font-medium text-[#0F172A]">{a.patient_name}</p>
                              {a.complaint && <p className="text-xs text-[#64748B]">{a.complaint}</p>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
