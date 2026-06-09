import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { mrHistory } from '../../lib/api';

export default function SubmissionHistory() {
  const [cases, setCases] = useState([]);

  useEffect(() => { mrHistory().then(setCases).catch(() => {}); }, []);

  const columns = [
    { key: 'id', label: 'Case ID', render: (id) => `#${id.slice(-6)}` },
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'ai_label', label: 'AI Assessment', render: (v) => v || '—' },
    { key: 'submitted_at', label: 'Date', render: (d) => (d ? new Date(d).toLocaleString() : '—') },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s} /> },
  ];

  return (
    <div>
      <PageHeader title="Submission History" breadcrumb="All submitted cases" />
      <DataTable columns={columns} data={cases} />
    </div>
  );
}
