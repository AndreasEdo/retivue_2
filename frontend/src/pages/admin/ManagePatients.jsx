import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import { mockData } from '../../store/mockData';

export default function ManagePatients() {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
  ];

  return (
    <div>
      <PageHeader title="Manage Patients" breadcrumb="Patient records" />

      <DataTable columns={columns} data={mockData.patients} />
    </div>
  );
}
