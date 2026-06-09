import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { mockData, addUser } from '../../store/mockData';

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState('doctors');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'dokter' });

  const users = mockData.users.filter((u) =>
    activeTab === 'doctors' ? u.role === 'dokter' : u.role === 'medical_record'
  );

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status === 'active' ? 'approved' : 'rejected'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, user) => (
        <button className="text-[#2d3fe0] text-xs font-semibold hover:underline">
          {user.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    addUser(formData);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: activeTab === 'doctors' ? 'dokter' : 'medical_record' });
  };

  return (
    <div>
      <PageHeader
        title={activeTab === 'doctors' ? 'Manage Doctors' : 'Manage Medical Staff'}
        breadcrumb="User management"
        actionButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white border border-[#E2E8F0] hover:bg-[#f2f4f6] text-[#0F172A] px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Create Account
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'doctors'
              ? 'bg-[#2d3fe0] text-white'
              : 'bg-white text-[#64748B] hover:bg-[#f2f4f6]'
          }`}
        >
          Doctors
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'staff'
              ? 'bg-[#2d3fe0] text-white'
              : 'bg-white text-[#64748B] hover:bg-[#f2f4f6]'
          }`}
        >
          Medical Staff
        </button>
      </div>

      <DataTable columns={columns} data={users} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Account">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#454655] mb-2">Name</label>
            <input
              className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#454655] mb-2">Email</label>
            <input
              className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 px-4 border border-[#c5c5d8] rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#f2f4f6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
