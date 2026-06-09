import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { mockData } from '../../store/mockData';

export default function PendingReviewList() {
  const pendingCases = mockData.cases.filter((c) => c.status === 'waiting' && c.doctorId === 1);

  const columns = [
    { key: 'id', label: 'Case ID' },
    { key: 'patientName', label: 'Patient Name' },
    { key: 'submittedAt', label: 'Date', render: (date) => new Date(date).toLocaleDateString() },
    {
      key: 'aiResult',
      label: 'AI Prediction',
      render: (ai) => <span className="text-xs font-semibold">{ai?.predictedClass || 'N/A'}</span>,
    },
    {
      key: 'aiResult',
      label: 'Confidence',
      render: (ai) => <span className="text-xs">{ai?.confidence ? `${(ai.confidence * 100).toFixed(1)}%` : 'N/A'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: () => <StatusBadge status="waiting" />,
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, case_) => (
        <Link
          to={`/doctor/case/${case_.id}`}
          className="text-[#2d3fe0] text-xs font-semibold hover:underline"
        >
          Review
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Pending Reviews" breadcrumb="Cases waiting for doctor validation" />
      <DataTable columns={columns} data={pendingCases} />
    </div>
  );
}
