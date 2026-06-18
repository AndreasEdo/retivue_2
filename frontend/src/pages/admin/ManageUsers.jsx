import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { adminListUsers, adminCreateStaff, adminSetUserStatus } from '../../lib/api';
import { isEmail, isBlank } from '../../lib/validation';

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState('doctors');
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const role = activeTab === 'doctors' ? 'dokter' : 'medical_record';
  const load = () => adminListUsers(role).then(setUsers).catch(() => {});
  useEffect(() => { load(); }, [activeTab]);

  const toggleStatus = async (u) => {
    await adminSetUserStatus(u.id, u.status !== 'active');
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isBlank(form.name)) return setError('Name is required.');
    if (!isEmail(form.email)) return setError('Enter a valid email address.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    try {
      await adminCreateStaff({ ...form, role });
      setIsModalOpen(false);
      setForm({ name: '', email: '', password: '' });
      load();
    } catch (err) { setError(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s === 'active' ? 'approved' : 'rejected'} customLabel={s === 'active' ? 'Active' : 'Inactive'} /> },
    { key: 'actions', label: 'Actions', render: (_, u) => (
      <button onClick={() => toggleStatus(u)} className="text-[#2d3fe0] text-xs font-semibold hover:underline">
        {u.status === 'active' ? 'Deactivate' : 'Activate'}
      </button>
    ) },
  ];

  return (
    <div>
      <PageHeader
        title={activeTab === 'doctors' ? 'Manage Doctors' : 'Manage Medical Staff'}
        breadcrumb="User management"
        actionButton={
          <button onClick={() => setIsModalOpen(true)}
            className="bg-[#2d3fe0] hover:bg-[#3748e7] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">add</span>Create Account
          </button>
        } />

      <div className="flex gap-4 mb-6">
        {['doctors', 'staff'].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors border ${activeTab === t ? 'bg-[#2d3fe0] text-white border-[#2d3fe0]' : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#f2f4f6]'}`}>
            {t === 'doctors' ? 'Doctors' : 'Medical Staff'}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={users} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Create ${role === 'dokter' ? 'Doctor' : 'Medical Staff'} Account`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-[#DC2626] bg-[#DC2626]/10 rounded-lg px-3 py-2">{error}</div>}
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Temporary Password" type="text" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          <div className="flex gap-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-[#c5c5d8] rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#f2f4f6]">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7]">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#454655] mb-2">{label}</label>
      <input className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm focus:ring-[#2d3fe0] focus:border-[#2d3fe0]"
        type={type} value={value} onChange={(e) => onChange(e.target.value)} required />
    </div>
  );
}
