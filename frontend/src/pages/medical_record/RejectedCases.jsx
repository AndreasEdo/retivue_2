import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { mockData } from '../../store/mockData';

export default function RejectedCases() {
  const rejectedCases = mockData.cases.filter((c) => c.status === 'rejected');

  const columns = [
    { key: 'id', label: 'Case ID' },
    { key: 'patientName', label: 'Patient Name' },
    { key: 'submittedAt', label: 'Date', render: (date) => new Date(date).toLocaleDateString() },
    {
      key: 'status',
      label: 'Status',
      render: () => <StatusBadge status="rejected" />,
    },
    {
      key: 'rejectNote',
      label: 'Reject Note',
      render: (note) => <span className="text-xs text-[#64748B]">{note || 'No note provided'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <Link
          to="/medical-record/new-submission"
          className="text-[#2d3fe0] text-xs font-semibold hover:underline"
        >
          Upload Ulang
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Rejected Cases" breadcrumb="Cases requiring re-submission" />
      <DataTable columns={columns} data={rejectedCases} />
    </div>
  );
}
