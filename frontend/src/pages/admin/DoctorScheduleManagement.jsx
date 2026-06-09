import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { mockData, addDoctorSchedule } from '../../store/mockData';

export default function DoctorScheduleManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: '',
    doctorName: '',
    date: '',
    startTime: '',
    endTime: '',
    quota: 10,
  });

  const columns = [
    { key: 'doctorName', label: 'Doctor' },
    { key: 'date', label: 'Date' },
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' },
    { key: 'quota', label: 'Quota' },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <button className="text-[#DC2626] text-xs font-semibold hover:underline">Delete</button>
      ),
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const doctor = mockData.users.find((u) => u.id === parseInt(formData.doctorId));
    addDoctorSchedule({
      ...formData,
      doctorName: doctor?.name || formData.doctorName,
      doctorId: parseInt(formData.doctorId),
    });
    setIsModalOpen(false);
    setFormData({ doctorId: '', doctorName: '', date: '', startTime: '', endTime: '', quota: 10 });
  };

  return (
    <div>
      <PageHeader
        title="Doctor Schedules"
        breadcrumb="Schedule management"
        actionButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white border border-[#E2E8F0] hover:bg-[#f2f4f6] text-[#0F172A] px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Schedule
          </button>
        }
      />

      <DataTable columns={columns} data={mockData.doctorSchedules} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Doctor Schedule">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#454655] mb-2">Doctor</label>
            <select
              className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
              value={formData.doctorId}
              onChange={(e) => {
                const doctor = mockData.users.find((u) => u.id === parseInt(e.target.value));
                setFormData({ ...formData, doctorId: e.target.value, doctorName: doctor?.name || '' });
              }}
              required
            >
              <option value="">Select Doctor</option>
              {mockData.users.filter((u) => u.role === 'dokter').map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#454655] mb-2">Date</label>
            <input
              className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Start Time</label>
              <input
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">End Time</label>
              <input
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#454655] mb-2">Quota</label>
            <input
              className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
              type="number"
              value={formData.quota}
              onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 px-4 border border-[#c5c5d8] rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#f2f4f6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors"
            >
              Add Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
