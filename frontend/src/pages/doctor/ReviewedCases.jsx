import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { doctorCases } from '../../lib/api';

export default function ReviewedCases() {
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([doctorCases('approved'), doctorCases('rejected')])
      .then(([a, r]) => setCases([...a, ...r].sort((x, y) => (y.submitted_at || '').localeCompare(x.submitted_at || ''))))
      .catch(() => {});
  }, []);

  const columns = [
    { key: 'id', label: 'Case ID', render: (id) => `#${id.slice(-6)}` },
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'submitted_at', label: 'Date', render: (d) => (d ? new Date(d).toLocaleDateString() : '—') },
    { key: 'ai_label', label: 'AI Prediction', render: (v) => <span className="text-xs font-semibold">{v || '—'}</span> },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s} /> },
  ];

  return (
    <div>
      <PageHeader title="Reviewed Cases" breadcrumb="Your reviewed case history" />
      <DataTable columns={columns} data={cases} onRowClick={(row) => navigate(`/doctor/case/${row.id}`)} />
    </div>
  );
}
