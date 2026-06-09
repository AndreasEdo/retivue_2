import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { mockData } from '../../store/mockData';

export default function MedicalRecordDashboard() {
  const myCases = mockData.cases.filter((c) => c.submittedBy === 'Rina Kusuma' || c.submittedBy === 'Dewi Lestari');
  const pendingCount = myCases.filter((c) => c.status === 'waiting').length;
  const approvedCount = myCases.filter((c) => c.status === 'approved').length;
  const rejectedCount = myCases.filter((c) => c.status === 'rejected').length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        breadcrumb="Medical Record Overview"
        actionButton={
          <Link
            to="/medical-record/new-submission"
            className="bg-[#2d3fe0] hover:bg-[#3748e7] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Submission
          </Link>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#D97706]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">
                Pending Reviews
              </p>
              <h4 className="text-3xl font-bold text-[#0F172A]">{pendingCount}</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#D97706]">pending</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#059669]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">
                Approved Cases
              </p>
              <h4 className="text-3xl font-bold text-[#0F172A]">{approvedCount}</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#D1FAE5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#059669]">check_circle</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#DC2626]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">
                Rejected Cases
              </p>
              <h4 className="text-3xl font-bold text-[#0F172A]">{rejectedCount}</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#DC2626]">error</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-[#0F172A]">Recent Submissions</h3>
          <Link to="/medical-record/history" className="text-[#001bca] text-xs font-semibold hover:underline">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {myCases.slice(0, 5).map((case_) => (
            <div key={case_.id} className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-lg">
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{case_.patientName}</p>
                <p className="text-xs text-[#64748B]">Case #{case_.id} · {new Date(case_.submittedAt).toLocaleDateString()}</p>
              </div>
              <span className="text-xs font-semibold text-[#64748B]">{case_.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
