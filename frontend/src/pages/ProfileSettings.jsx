import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would update the user profile
    alert('Profile updated successfully!');
  };

  return (
    <div>
      <PageHeader title="Profile Settings" breadcrumb="Manage your account" />

      <div className="max-w-2xl">
        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Profile Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Name</label>
              <input
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Email</label>
              <input
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Role</label>
              <input
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg bg-[#f2f4f6] text-sm text-[#64748B]"
                type="text"
                value={user?.role || ''}
                disabled
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Change Password</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">Current Password</label>
              <input
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454655] mb-2">New Password</label>
              <input
                className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-4 bg-[#2d3fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#3748e7] transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
