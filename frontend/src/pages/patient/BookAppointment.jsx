import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { patientSchedules, patientBook } from '../../lib/api';
import { useConfirm } from '../../context/ConfirmContext';

function isBookingAllowed(dateStr) {
  // H-1 rule: must book at least 1 day before appointment date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const apptDate = new Date(dateStr);
  apptDate.setHours(0, 0, 0, 0);
  const diffDays = (apptDate - today) / (1000 * 60 * 60 * 24);
  return diffDays >= 1; // must be at least tomorrow (≥1 day ahead)
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return dateStr; }
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [allSchedules, setAllSchedules] = useState([]);
  const [selected, setSelected] = useState(null);
  const [complaint, setComplaint] = useState('');
  const [duration, setDuration] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { patientSchedules().then(setAllSchedules).catch(() => {}); }, []);

  // Show approved schedules (or legacy ones without a status field) that are
  // ≥ 1 day from today (H-1 rule). Pending/rejected are hidden from patients.
  const schedules = allSchedules.filter(
    (s) => (s.status === 'approved' || !s.status) && isBookingAllowed(s.date)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) { setError('Please select a schedule.'); return; }
    if (!complaint.trim()) { setError('Please describe your complaint / reason for visit.'); return; }
    if (!(await confirm({ title: 'Confirm appointment?', message: 'Please make sure the schedule and your complaint are correct before booking.', confirmText: 'Book Appointment' }))) return;
    setBusy(true); setError('');
    try {
      await patientBook({ schedule_id: selected, complaint: complaint.trim(), symptom_duration: duration.trim() });
      navigate('/pasien/appointments');
    } catch (err) {
      setError(err.message || 'Booking failed.');
    } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader title="Book Appointment" breadcrumb="Schedule a new appointment" />
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#0F172A]">Available Schedules</h3>
          <div className="flex items-center gap-1.5 text-xs text-[#D97706] bg-[#FEF3C7] px-3 py-1.5 rounded-full border border-[#FDE68A]">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Booking closes 1 day before appointment
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-[#DC2626] bg-[#DC2626]/10 rounded-lg px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 mb-6">
            {schedules.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-[#c5c5d8] text-5xl mb-3 block">event_busy</span>
                <p className="text-sm font-semibold text-[#454655]">No available schedules</p>
                <p className="text-xs text-[#64748B] mt-1">
                  Schedules appear here once approved by the doctor and at least 1 day before the appointment.
                </p>
              </div>
            ) : (
              schedules.map((s) => (
                <label key={s.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  selected === s.id ? 'border-[#2d3fe0] bg-[#EEF2FF]' : 'border-[#E2E8F0] hover:border-[#c5c5d8]'
                }`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="schedule" checked={selected === s.id}
                      onChange={() => setSelected(s.id)} className="w-4 h-4 accent-[#2d3fe0]" />
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{s.doctor_name}</p>
                      <p className="text-xs text-[#64748B]">{formatDate(s.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#0F172A]">{s.start_time} – {s.end_time}</p>
                    <p className="text-xs text-[#059669] font-medium">{s.available} slots left</p>
                  </div>
                </label>
              ))
            )}
          </div>

          {/* Visit details — required before booking */}
          {selected && (
            <div className="mb-6 border-t border-[#E2E8F0] pt-6 space-y-4">
              <h4 className="text-sm font-semibold text-[#0F172A]">Visit Details</h4>
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">
                  Reason for Visit / Complaint <span className="text-[#DC2626]">*</span>
                </label>
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  rows={3}
                  required
                  placeholder="e.g. Blurry vision in the right eye, occasional floaters for the past week."
                  className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm focus:ring-[#2d3fe0] focus:border-[#2d3fe0]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454655] mb-2">
                  How long have you had these symptoms? <span className="text-[#64748B] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 2 weeks"
                  className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm focus:ring-[#2d3fe0] focus:border-[#2d3fe0]"
                />
              </div>
            </div>
          )}

          {schedules.length > 0 && (
            <button type="submit" disabled={!selected || !complaint.trim() || busy}
              className="w-full py-2.5 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors disabled:opacity-50">
              {busy ? 'Booking…' : selected ? 'Confirm Appointment' : 'Select a schedule first'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
