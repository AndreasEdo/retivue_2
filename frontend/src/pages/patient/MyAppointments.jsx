import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { patientAppointments } from '../../lib/api';

export default function MyAppointments() {
  const [appts, setAppts] = useState([]);
  useEffect(() => { patientAppointments().then(setAppts).catch(() => {}); }, []);

  const columns = [
    { key: 'doctor_name', label: 'Doctor' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'complaint', label: 'Complaint', render: (c) => <span className="text-xs text-[#64748B]">{c || '—'}</span> },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s} /> },
  ];

  return (
    <div>
      <PageHeader title="My Appointments" breadcrumb="Your appointment history"
        actionButton={
          <Link to="/pasien/book" className="bg-[#2d3fe0] hover:bg-[#3748e7] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">add</span>Book Appointment
          </Link>
        } />
      <DataTable columns={columns} data={appts} />
    </div>
  );
}
