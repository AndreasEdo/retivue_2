import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { adminListPatients, adminUpdateUser, adminDeleteUser } from '../../lib/api';
import { useConfirm } from '../../context/ConfirmContext';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', gender: '', date_of_birth: '' });
  const [err, setErr] = useState('');
  const confirm = useConfirm();
  const todayStr = new Date().toISOString().slice(0, 10);

  const load = () => adminListPatients().then(setPatients).catch(() => {});
  useEffect(() => { load(); }, []);

  const openEdit = (p) => {
    setErr('');
    setEditing(p);
    setForm({
      name: p.name || '', phone: p.phone || '', gender: p.gender || '',
      date_of_birth: (p.date_of_birth || '').slice(0, 10),
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.name.trim()) return setErr('Name is required.');
    if (form.date_of_birth && form.date_of_birth > todayStr) return setErr('Date of birth cannot be in the future.');
    try {
      await adminUpdateUser(editing.id, {
        name: form.name, phone: form.phone, gender: form.gender,
        date_of_birth: form.date_of_birth || undefined,
      });
      setEditing(null);
      load();
    } catch (e2) { setErr(e2.message); }
  };

  const handleDelete = async (p) => {
    if (!(await confirm({
      title: `Delete ${p.name}?`,
      message: 'This patient account will be permanently removed. This cannot be undone.',
      confirmText: 'Delete', danger: true,
    }))) return;
    await adminDeleteUser(p.id);
    load();
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (v) => v || '—' },
    { key: 'age', label: 'Age', render: (v) => v ?? '—' },
    { key: 'gender', label: 'Gender', render: (v) => v || '—' },
    { key: 'actions', label: 'Actions', render: (_, p) => (
      <div className="flex items-center gap-3">
        <button onClick={() => openEdit(p)} className="text-[#2d3fe0] text-xs font-semibold hover:underline">Edit</button>
        <button onClick={() => handleDelete(p)} className="text-[#DC2626] text-xs font-semibold hover:underline">Delete</button>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Manage Patients" breadcrumb="Registered patient records" />
      <DataTable columns={columns} data={patients} />

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Patient">
        <form onSubmit={handleUpdate} className="space-y-4">
          {err && <div className="text-sm text-[#DC2626] bg-[#DC2626]/10 rounded-lg px-3 py-2">{err}</div>}
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required={false} />
          <div>
            <label className="block text-xs font-semibold text-[#454655] mb-2">Gender</label>
            <select className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm"
              value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#454655] mb-2">Date of Birth</label>
            <input type="date" max={todayStr} value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm" />
            <p className="text-xs text-[#64748B] mt-1">Age is calculated automatically from date of birth.</p>
          </div>
          <p className="text-xs text-[#64748B]">Email cannot be changed (used as login ID).</p>
          <div className="flex gap-4">
            <button type="button" onClick={() => setEditing(null)} className="flex-1 py-2 border border-[#c5c5d8] rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#f2f4f6]">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7]">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = true }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#454655] mb-2">{label}</label>
      <input className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm focus:ring-[#2d3fe0] focus:border-[#2d3fe0]"
        type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}
