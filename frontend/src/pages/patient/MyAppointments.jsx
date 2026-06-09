import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { mockData } from '../../store/mockData';

export default function MyAppointments() {
  const myAppointments = mockData.appointments.filter((a) => a.patientId === 1);

  const columns = [
    { key: 'doctorName', label: 'Doctor' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, appointment) =>
        appointment.status === 'submitted' ? (
          <span className="text-xs text-[#D97706] font-semibold">Pending Confirmation</span>
        ) : appointment.status === 'confirmed' ? (
          <span className="text-xs text-[#059669] font-semibold">Confirmed</span>
        ) : (
          <span className="text-xs text-[#64748B] font-semibold">Completed</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My Appointments"
        breadcrumb="Your appointment history"
        actionButton={
          <Link
            to="/pasien/book"
            className="bg-[#2d3fe0] hover:bg-[#3748e7] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Book Appointment
          </Link>
        }
      />
      <DataTable columns={columns} data={myAppointments} />
    </div>
  );
}
