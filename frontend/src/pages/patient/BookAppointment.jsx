import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { patientSchedules, patientBook } from '../../lib/api';

export default function BookAppointment() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { patientSchedules().then(setSchedules).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setBusy(true); setError('');
    try {
      await patientBook(selected);
      navigate('/pasien/appointments');
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader title="Book Appointment" breadcrumb="Schedule a new appointment" />
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Available Schedules</h3>
        {error && <div className="mb-4 text-sm text-[#DC2626] bg-[#DC2626]/10 rounded-lg px-3 py-2">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            {schedules.length === 0 && <p className="text-sm text-[#64748B]">No schedules available right now.</p>}
            {schedules.map((s) => (
              <label key={s.id} className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${selected === s.id ? 'border-[#2d3fe0] bg-[#DBEAFE]' : 'border-[#E2E8F0] hover:border-[#c5c5d8]'}`}>
                <div className="flex items-center gap-4">
                  <input type="radio" name="schedule" checked={selected === s.id} onChange={() => setSelected(s.id)} className="w-4 h-4" />
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{s.doctor_name}</p>
                    <p className="text-xs text-[#64748B]">{s.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#0F172A]">{s.start_time} - {s.end_time}</p>
                  <p className="text-xs text-[#64748B]">{s.available} slots available</p>
                </div>
              </label>
            ))}
          </div>
          <button type="submit" disabled={!selected || busy}
            className="w-full py-2.5 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors disabled:opacity-50">
            {busy ? 'Booking…' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
