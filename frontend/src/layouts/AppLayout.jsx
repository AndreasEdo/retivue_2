import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = {
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/users', label: 'Manage Users', icon: 'group' },
    { path: '/admin/patients', label: 'Manage Patients', icon: 'patient_list' },
    { path: '/admin/schedules', label: 'Doctor Schedules', icon: 'calendar_month' },
    { path: '/admin/monitoring', label: 'System Monitoring', icon: 'monitor_heart' },
  ],
  medical_record: [
    { path: '/medical-record/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/medical-record/new-submission', label: 'New Submission', icon: 'add' },
    { path: '/medical-record/history', label: 'Submission History', icon: 'history' },
    { path: '/medical-record/rejected', label: 'Rejected Cases', icon: 'error' },
  ],
  dokter: [
    { path: '/doctor/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/doctor/pending', label: 'Pending Reviews', icon: 'pending' },
    { path: '/doctor/reviewed', label: 'Reviewed Cases', icon: 'check_circle' },
  ],
  pasien: [
    { path: '/pasien/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/pasien/appointments', label: 'My Appointments', icon: 'calendar_month' },
    { path: '/pasien/book', label: 'Book Appointment', icon: 'add' },
    { path: '/pasien/reports', label: 'My Reports', icon: 'description' },
  ],
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const roleNavItems = navItems[user?.role] || [];

  return (
    <div className="flex min-h-screen bg-[#f7f9fb]">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#1E2A4A] transition-all duration-300 z-50 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        <div className="p-6 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[#001bca] text-2xl">visibility</span>
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">RetiVue</h1>
              <p className="text-xs text-[#bac5ee] uppercase tracking-wider">AI Retinal Screening</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {roleNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-[#2d3fe0] text-white border-l-4 border-white'
                    : 'text-[#bac5ee] hover:text-white hover:bg-[#3a4667]'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 mt-auto">
          <Link
            to="/profile"
            className="w-full bg-[#3748e7] hover:bg-[#2d3fe0] text-white py-3 rounded-lg font-semibold transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">settings</span>
            {!sidebarCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        }`}
      >
        {/* Top Bar */}
        <header className="bg-white border-b border-[#c5c5d8] shadow-sm h-16 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-[#454655] hover:text-[#001bca] transition-colors"
            >
              <span className="material-symbols-outlined">
                {sidebarCollapsed ? 'menu_open' : 'menu'}
              </span>
            </button>
            <h2 className="text-xl font-bold text-[#001bca]">
              {roleNavItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-8 h-8 rounded-full bg-[#2d3fe0] flex items-center justify-center text-white cursor-pointer hover:opacity-90 transition-opacity">
              <span className="font-semibold text-sm">
                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-[#454655] hover:text-[#001bca] transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
