import { useEffect, useRef, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { mrRejected, mrResubmit } from '../../lib/api';

export default function RejectedCases() {
  const [cases, setCases] = useState([]);
  const [busy, setBusy] = useState(null);
  const fileRef = useRef(null);
  const activeId = useRef(null);

  const load = () => mrRejected().then(setCases).catch(() => {});
  useEffect(() => { load(); }, []);

  const pickFile = (caseId) => { activeId.current = caseId; fileRef.current?.click(); };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !activeId.current) return;
    setBusy(activeId.current);
    try {
      await mrResubmit(activeId.current, file);
      await load();
    } catch (err) {
      alert('Re-upload failed: ' + err.message);
    } finally {
      setBusy(null);
      activeId.current = null;
    }
  };

  const columns = [
    { key: 'id', label: 'Case ID', render: (id) => `#${id.slice(-6)}` },
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'reviewed_at', label: 'Rejected', render: (d) => (d ? new Date(d).toLocaleDateString() : '—') },
    { key: 'status', label: 'Status', render: () => <StatusBadge status="rejected" /> },
    {
      key: 'doctor_result', label: 'Reject Note',
      render: (dr) => <span className="text-xs text-[#64748B]">{dr?.reject_note || 'No note'}</span>,
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <button onClick={() => pickFile(row.id)} disabled={busy === row.id}
          className="text-[#2d3fe0] text-xs font-semibold hover:underline disabled:opacity-50">
          {busy === row.id ? 'Uploading…' : 'Upload Ulang'}
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Rejected Cases" breadcrumb="Cases requiring re-submission" />
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
      <DataTable columns={columns} data={cases} />
    </div>
  );
}
