import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { mockData } from '../../store/mockData';

export default function MyReports() {
  const myCases = mockData.cases.filter((c) => c.patientId === 1);

  const columns = [
    { key: 'id', label: 'Case ID' },
    { key: 'submittedAt', label: 'Date', render: (date) => new Date(date).toLocaleDateString() },
    {
      key: 'aiResult',
      label: 'AI Prediction',
      render: (ai) => <span className="text-xs font-semibold">{ai?.predictedClass || 'N/A'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'doctorResult',
      label: 'Final Diagnosis',
      render: (result) => <span className="text-xs">{result?.finalDiagnosis || 'Pending'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, case_) =>
        case_.status === 'approved' ? (
          <Link
            to={`/pasien/report/${case_.id}`}
            className="text-[#2d3fe0] text-xs font-semibold hover:underline"
          >
            View Report
          </Link>
        ) : (
          <span className="text-xs text-[#64748B]">Pending</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="My Reports" breadcrumb="Your screening reports" />
      <DataTable columns={columns} data={myCases} />
    </div>
  );
}
