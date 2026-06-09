import PageHeader from '../../components/ui/PageHeader';
import { mockData } from '../../store/mockData';

export default function AdminDashboard() {
  const stats = mockData.systemStats;
  const activities = mockData.recentActivity;
  const drStats = mockData.drLevelStats;

  return (
    <div>
      <PageHeader
        title="Overview"
        breadcrumb="System status and user metrics"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#001bca]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">
                Total Registered Patients
              </p>
              <h4 className="text-3xl font-bold text-[#0F172A]">{stats.totalPatients.toLocaleString()}</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#cad6ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#001bca]">groups</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#059669] text-xs font-semibold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+5.2% this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#7C3AED]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">
                Screenings This Month
              </p>
              <h4 className="text-3xl font-bold text-[#0F172A]">{stats.screeningsThisMonth.toLocaleString()}</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#eaddff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#7C3AED]">visibility</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#059669] text-xs font-semibold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+12.8% vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#059669]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">
                Active Doctors
              </p>
              <h4 className="text-3xl font-bold text-[#0F172A]">{stats.activeDoctors}</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#D1FAE5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#059669]">medical_services</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#64748B] text-xs font-semibold">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>All systems nominal</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#525d80]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">
                Active Staff
              </p>
              <h4 className="text-3xl font-bold text-[#0F172A]">{stats.activeStaff}</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#525d80]">folder_shared</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#64748B] text-xs font-semibold">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>Shift A active</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-[#0F172A]">Recent Activity</h3>
            <button className="text-[#001bca] text-xs font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 relative">
                <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-[#f2f4f6] -ml-px"></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 text-white ${
                    activity.type === 'approval'
                      ? 'bg-[#2d3fe0]'
                      : activity.type === 'ai'
                      ? 'bg-[#7C3AED]'
                      : activity.type === 'user'
                      ? 'bg-[#e6e8ea] text-[#525d80]'
                      : 'bg-[#059669]/10 text-[#059669]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {activity.type === 'approval'
                      ? 'check_circle'
                      : activity.type === 'ai'
                      ? 'psychology'
                      : activity.type === 'user'
                      ? 'person_add'
                      : 'update'}
                  </span>
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm text-[#191c1e]">{activity.message}</p>
                  <p className="text-xs text-[#64748B] mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">System Health</h3>
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-[#0F172A]">Server Load</span>
                <span className="text-xs text-[#64748B]">{stats.serverLoad}%</span>
              </div>
              <div className="h-2 bg-[#f2f4f6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#059669] rounded-full"
                  style={{ width: `${stats.serverLoad}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-[#0F172A]">Database Storage</span>
                <span className="text-xs text-[#64748B]">{stats.databaseStorage}%</span>
              </div>
              <div className="h-2 bg-[#f2f4f6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D97706] rounded-full"
                  style={{ width: `${stats.databaseStorage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-[#0F172A]">AI Processing Queue</span>
                <span className="text-xs text-[#64748B]">{stats.aiProcessingQueue} pending</span>
              </div>
              <div className="h-2 bg-[#f2f4f6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7C3AED] rounded-full"
                  style={{ width: '15%' }}
                ></div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-[#f2f4f6] rounded-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-[#059669] mt-0.5">cloud_done</span>
            <div>
              <p className="text-xs font-semibold text-[#0F172A]">All Services Operational</p>
              <p className="text-xs text-[#64748B] mt-1">Last checked 2 mins ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* DR Level Distribution */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-6">DR Level Distribution</h3>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(drStats).map(([level, count]) => (
            <div key={level} className="text-center">
              <div className="bg-[#f2f4f6] rounded-lg p-4">
                <p className="text-2xl font-bold text-[#0F172A]">{count.toLocaleString()}</p>
                <p className="text-xs text-[#64748B] mt-1">{level}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
