import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { mockData } from '../../store/mockData';

export default function SubmissionHistory() {
  const myCases = mockData.cases.filter((c) => c.submittedBy === 'Rina Kusuma' || c.submittedBy === 'Dewi Lestari');

  const columns = [
    { key: 'id', label: 'Case ID' },
    { key: 'patientName', label: 'Patient Name' },
    { key: 'submittedAt', label: 'Date', render: (date) => new Date(date).toLocaleDateString() },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
  ];

  return (
    <div>
      <PageHeader title="Submission History" breadcrumb="All submitted cases" />
      <DataTable columns={columns} data={myCases} />
    </div>
  );
}
