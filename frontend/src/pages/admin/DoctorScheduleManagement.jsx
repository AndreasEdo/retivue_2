import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { adminListSchedules, adminCreateSchedule, adminDeleteSchedule, adminListUsers } from '../../lib/api';

export default function DoctorScheduleManagement() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ doctor_id: '', date: '', start_time: '', end_time: '', quota: 10 });

  const load = () => adminListSchedules().then(setSchedules).catch(() => {});
  useEffect(() => {
    load();
    adminListUsers('dokter').then(setDoctors).catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    await adminDeleteSchedule(id);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await adminCreateSchedule({ ...form, quota: Number(form.quota) });
      setIsModalOpen(false);
      setForm({ doctor_id: '', date: '', start_time: '', end_time: '', quota: 10 });
      load();
    } catch (err) { setError(err.message); }
  };

  const columns = [
    { key: 'doctor_name', label: 'Doctor' },
    { key: 'date', label: 'Date' },
    { key: 'start_time', label: 'Start' },
    { key: 'end_time', label: 'End' },
    { key: 'quota', label: 'Quota', render: (q, r) => `${r.booked || 0}/${q}` },
    { key: 'actions', label: 'Actions', render: (_, r) => (
      <button onClick={() => handleDelete(r.id)} className="text-[#DC2626] text-xs font-semibold hover:underline">Delete</button>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Doctor Schedules" breadcrumb="Schedule management"
        actionButton={
          <button onClick={() => setIsModalOpen(true)}
            className="bg-[#2d3fe0] hover:bg-[#3748e7] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">add</span>Add Schedule
          </button>
        } />

      <DataTable columns={columns} data={schedules} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Doctor Schedule">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-[#DC2626] bg-[#DC2626]/10 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="block text-xs font-semibold text-[#454655] mb-2">Doctor</label>
            <select className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm" required
              value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}>
              <option value="">Select Doctor</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#454655] mb-2">Date</label>
            <input type="date" required className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm"
              value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Start Time</label>
              <input type="time" required className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm"
                value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">End Time</label>
              <input type="time" required className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm"
                value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#454655] mb-2">Quota</label>
            <input type="number" required min="1" className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm"
              value={form.quota} onChange={(e) => setForm({ ...form, quota: e.target.value })} />
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-[#c5c5d8] rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#f2f4f6]">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7]">Add Schedule</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
