import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { mockData } from '../../store/mockData';

export default function ReviewedCases() {
  const reviewedCases = mockData.cases.filter((c) => c.doctorId === 1 && (c.status === 'approved' || c.status === 'rejected'));

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
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'doctorResult',
      label: 'Final Diagnosis',
      render: (result) => <span className="text-xs">{result?.finalDiagnosis || result?.rejectNote || '-'}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Reviewed Cases" breadcrumb="Your reviewed case history" />
      <DataTable columns={columns} data={reviewedCases} />
    </div>
  );
}
