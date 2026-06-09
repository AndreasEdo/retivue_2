import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { mockData, addAppointment } from '../../store/mockData';

export default function BookAppointment() {
  const navigate = useNavigate();
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    addAppointment({
      patientId: 1,
      patientName: 'John Doe',
      doctorId: selectedSchedule.doctorId,
      doctorName: selectedSchedule.doctorName,
      scheduleId: selectedSchedule.id,
      date: selectedSchedule.date,
      time: selectedSchedule.startTime,
    });
    navigate('/pasien/appointments');
  };

  return (
    <div>
      <PageHeader title="Book Appointment" breadcrumb="Schedule a new appointment" />

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Available Schedules</h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            {mockData.doctorSchedules.map((schedule) => (
              <label
                key={schedule.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedSchedule?.id === schedule.id
                    ? 'border-[#2d3fe0] bg-[#DBEAFE]'
                    : 'border-[#E2E8F0] bg-white hover:border-[#c5c5d8]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    name="schedule"
                    value={schedule.id}
                    checked={selectedSchedule?.id === schedule.id}
                    onChange={() => setSelectedSchedule(schedule)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{schedule.doctorName}</p>
                    <p className="text-xs text-[#64748B]">{schedule.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#0F172A]">{schedule.startTime} - {schedule.endTime}</p>
                  <p className="text-xs text-[#64748B]">{schedule.quota} slots available</p>
                </div>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={!selectedSchedule}
            className="w-full py-2.5 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Book Appointment
          </button>
        </form>
      </div>
    </div>
  );
}
