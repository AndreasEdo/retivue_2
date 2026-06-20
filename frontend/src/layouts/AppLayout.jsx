import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = {
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/users', label: 'Manage Staff', icon: 'group' },
    { path: '/admin/patients', label: 'Manage Patients', icon: 'patient_list' },
    { path: '/admin/schedules', label: 'Doctor Schedules', icon: 'calendar_month' },
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
    { path: '/doctor/patients', label: 'Patients', icon: 'groups' },
    { path: '/doctor/schedules', label: 'My Schedules', icon: 'calendar_month' },
    { path: '/doctor/reviewed', label: 'Reviewed Cases', icon: 'check_circle' },
  ],
  pasien: [
    { path: '/pasien/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/pasien/appointments', label: 'My Appointments', icon: 'calendar_month' },
    { path: '/pasien/book', label: 'Book Appointment', icon: 'add' },
    { path: '/pasien/reports', label: 'My Reports', icon: 'description' },
  ],
};

const ROLE_LABELS = {
  admin: 'Admin',
  dokter: 'Doctor',
  medical_record: 'Medical Record',
  pasien: 'Patient',
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const roleNavItems = navItems[user?.role] || [];

  return (
    <div className="flex min-h-screen bg-[#f7f9fb] dark:bg-[#0a0f1e] transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#1E2A4A] transition-all duration-300 z-50 flex flex-col ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        <div className="p-5 mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src="/retivue_logo_new.png" alt="RetiVue" className="w-full h-full object-contain" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-base font-bold text-white leading-tight">RetiVue</h1>
              <p className="text-[10px] text-[#bac5ee] uppercase tracking-wider">AI Retinal Screening</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {roleNavItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                  isActive
                    /* 2I: Option A — slightly transparent bg, font-medium */
                    ? 'bg-[#2d3fe0]/90 text-white font-medium'
                    : 'text-[#bac5ee] hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] flex-shrink-0">{item.icon}</span>
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 pb-5 pt-4 border-t border-white/10 space-y-1">
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              location.pathname === '/profile'
                ? 'bg-[#2d3fe0]/90 text-white font-medium'
                : 'text-[#bac5ee] hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">settings</span>
            {!sidebarCollapsed && <span className="text-sm">Settings</span>}
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#bac5ee] hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">logout</span>
            {!sidebarCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        }`}
      >
        {/* Top Bar — 2J: lighter border, smaller/lighter title */}
        <header className="bg-white dark:bg-[#0f172a] border-b border-[#F1F5F9] dark:border-white/10 shadow-sm h-14 px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-[#64748b] dark:text-[#94a3b8] hover:text-[#2d3fe0] transition-colors"
            >
              <span className="material-symbols-outlined">
                {sidebarCollapsed ? 'menu_open' : 'menu'}
              </span>
            </button>
            {/* 2J: text-sm font-medium, lighter */}
            <h2 className="text-sm font-medium text-[#0F172A] dark:text-[#f1f5f9]">
              {roleNavItems.find((item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/'))?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-1.5 rounded-lg text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle dark mode"
            >
              <span className="material-symbols-outlined text-[20px]">{dark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#2d3fe0] flex items-center justify-center text-white shrink-0">
                <span className="font-semibold text-xs">
                  {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                </span>
              </div>
              {user?.name && (
                <div className="hidden sm:block leading-tight">
                  <p className="text-sm font-medium text-[#0f172a] dark:text-[#f1f5f9] max-w-[160px] truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8]">
                    {ROLE_LABELS[user.role] || user.role}
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        <div key={location.pathname} className="p-6 md:p-8 page-transition">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
