import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { patientReports } from '../../lib/api';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  useEffect(() => { patientReports().then(setReports).catch(() => {}); }, []);

  const columns = [
    { key: 'id', label: 'Case ID', render: (id) => `#${id.slice(-6)}` },
    { key: 'reviewed_at', label: 'Date', render: (d) => (d ? new Date(d).toLocaleDateString() : '—') },
    { key: 'doctor_name', label: 'Doctor' },
    { key: 'doctor_result', label: 'Final Diagnosis', render: (dr) => <span className="text-xs font-semibold">{dr?.final_diagnosis || 'Pending'}</span> },
    { key: 'status', label: 'Status', render: () => <StatusBadge status="approved" /> },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <Link to={`/pasien/report/${row.id}`} className="text-[#2d3fe0] text-xs font-semibold hover:underline">View Report</Link>
    ) },
  ];

  return (
    <div>
      <PageHeader title="My Reports" breadcrumb="Your approved screening reports" />
      <DataTable columns={columns} data={reports} />
    </div>
  );
}
