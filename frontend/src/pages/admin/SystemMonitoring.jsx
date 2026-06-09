import PageHeader from '../../components/ui/PageHeader';
import { mockData } from '../../store/mockData';

export default function SystemMonitoring() {
  const stats = mockData.systemStats;
  const drStats = mockData.drLevelStats;

  return (
    <div>
      <PageHeader title="System Monitoring" breadcrumb="System health and metrics" />

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0]">
          <p className="text-[11px] font-semibold text-[#64748B] mb-2 uppercase tracking-wider">Total Patients</p>
          <p className="text-3xl font-bold text-[#0F172A]">{stats.totalPatients.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0]">
          <p className="text-[11px] font-semibold text-[#64748B] mb-2 uppercase tracking-wider">Screenings This Month</p>
          <p className="text-3xl font-bold text-[#0F172A]">{stats.screeningsThisMonth.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0]">
          <p className="text-[11px] font-semibold text-[#64748B] mb-2 uppercase tracking-wider">Active Doctors</p>
          <p className="text-3xl font-bold text-[#0F172A]">{stats.activeDoctors}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0]">
          <p className="text-[11px] font-semibold text-[#64748B] mb-2 uppercase tracking-wider">Active Staff</p>
          <p className="text-3xl font-bold text-[#0F172A]">{stats.activeStaff}</p>
        </div>
      </div>

      {/* DR Level Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Cases by DR Level</h3>
        <div className="space-y-4">
          {Object.entries(drStats).map(([level, count]) => {
            const total = Object.values(drStats).reduce((a, b) => a + b, 0);
            const percentage = ((count / total) * 100).toFixed(1);
            return (
              <div key={level}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-semibold text-[#0F172A]">{level}</span>
                  <span className="text-xs text-[#64748B]">{count.toLocaleString()} ({percentage}%)</span>
                </div>
                <div className="h-3 bg-[#f2f4f6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2d3fe0] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Server Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-[#0F172A]">Server Load</span>
                <span className="text-xs text-[#64748B]">{stats.serverLoad}%</span>
              </div>
              <div className="h-3 bg-[#f2f4f6] rounded-full overflow-hidden">
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
              <div className="h-3 bg-[#f2f4f6] rounded-full overflow-hidden">
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
              <div className="h-3 bg-[#f2f4f6] rounded-full overflow-hidden">
                <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">AI Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-[#f2f4f6] rounded-lg">
              <span className="text-xs font-semibold text-[#0F172A]">Average Confidence</span>
              <span className="text-lg font-bold text-[#059669]">87.3%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-[#f2f4f6] rounded-lg">
              <span className="text-xs font-semibold text-[#0F172A]">Processing Time</span>
              <span className="text-lg font-bold text-[#2d3fe0]">2.3s</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-[#f2f4f6] rounded-lg">
              <span className="text-xs font-semibold text-[#0F172A]">Accuracy Rate</span>
              <span className="text-lg font-bold text-[#7C3AED]">94.1%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-[#f2f4f6] rounded-lg">
              <span className="text-xs font-semibold text-[#0F172A]">False Positive Rate</span>
              <span className="text-lg font-bold text-[#D97706]">3.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
