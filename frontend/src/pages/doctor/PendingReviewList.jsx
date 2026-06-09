import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { doctorCases } from '../../lib/api';

export default function PendingReviewList() {
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { doctorCases('waiting').then(setCases).catch(() => {}); }, []);

  const columns = [
    { key: 'id', label: 'Case ID', render: (id) => `#${id.slice(-6)}` },
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'submitted_at', label: 'Date', render: (d) => (d ? new Date(d).toLocaleString() : '—') },
    { key: 'ai_label', label: 'AI Prediction', render: (v) => <span className="text-xs font-semibold">{v || '—'}</span> },
    { key: 'ai_confidence', label: 'Confidence', render: (v) => <span className="text-xs">{v != null ? `${(v * 100).toFixed(0)}%` : '—'}</span> },
    { key: 'status', label: 'Status', render: () => <StatusBadge status="waiting" /> },
    { key: 'actions', label: 'Action', render: (_, row) => <span className="text-[#2d3fe0] text-xs font-semibold">Review →</span> },
  ];

  return (
    <div>
      <PageHeader title="Pending Reviews" breadcrumb="Cases waiting for doctor validation" />
      <DataTable columns={columns} data={cases} onRowClick={(row) => navigate(`/doctor/case/${row.id}`)} />
    </div>
  );
}
