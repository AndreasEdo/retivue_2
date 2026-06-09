import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import { adminListPatients } from '../../lib/api';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  useEffect(() => { adminListPatients().then(setPatients).catch(() => {}); }, []);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (v) => v || '—' },
    { key: 'age', label: 'Age', render: (v) => v ?? '—' },
    { key: 'gender', label: 'Gender', render: (v) => v || '—' },
  ];

  return (
    <div>
      <PageHeader title="Manage Patients" breadcrumb="Registered patient records" />
      <DataTable columns={columns} data={patients} />
    </div>
  );
}
