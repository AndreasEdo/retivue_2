import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { mockData } from '../../store/mockData';

export default function PatientDashboard() {
  const myAppointments = mockData.appointments.filter((a) => a.patientId === 1);
  const myCases = mockData.cases.filter((c) => c.patientId === 1 && c.status === 'approved');

  return (
    <div>
      <PageHeader title="Dashboard" breadcrumb="Patient Overview" />

      {/* Welcome Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-8">
        <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Welcome, John Doe!</h2>
        <p className="text-sm text-[#64748B]">Here's an overview of your screening results and appointments.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/pasien/appointments"
          className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0] hover:border-[#2d3fe0] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#2563EB] text-2xl">calendar_month</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A]">My Appointments</h3>
              <p className="text-sm text-[#64748B]">{myAppointments.length} upcoming appointments</p>
            </div>
          </div>
        </Link>

        <Link
          to="/pasien/reports"
          className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0] hover:border-[#2d3fe0] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#059669] text-2xl">description</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A]">My Reports</h3>
              <p className="text-sm text-[#64748B]">{myCases.length} screening reports</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Upcoming Appointment */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Upcoming Appointment</h3>
        {myAppointments.filter((a) => a.status === 'confirmed').length > 0 ? (
          <div className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-lg">
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">{myAppointments[0].doctorName}</p>
              <p className="text-xs text-[#64748B]">{myAppointments[0].date} at {myAppointments[0].time}</p>
            </div>
            <span className="text-xs font-semibold text-[#059669]">Confirmed</span>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-[#64748B]">No upcoming appointments</p>
            <Link
              to="/pasien/book"
              className="inline-block mt-2 text-[#2d3fe0] text-xs font-semibold hover:underline"
            >
              Book an Appointment
            </Link>
          </div>
        )}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#0F172A]">Recent Reports</h3>
          <Link to="/pasien/reports" className="text-[#001bca] text-xs font-semibold hover:underline">
            View All
          </Link>
        </div>
        {myCases.length > 0 ? (
          <div className="space-y-4">
            {myCases.slice(0, 3).map((case_) => (
              <div key={case_.id} className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Case #{case_.id}</p>
                  <p className="text-xs text-[#64748B]">{new Date(case_.submittedAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs font-semibold text-[#059669]">{case_.doctorResult?.finalDiagnosis}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#64748B] text-center py-4">No reports available</p>
        )}
      </div>
    </div>
  );
}
