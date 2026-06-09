import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { patientAppointments, patientReports } from '../../lib/api';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    patientAppointments().then(setAppts).catch(() => {});
    patientReports().then(setReports).catch(() => {});
  }, []);

  const upcoming = appts[0];

  return (
    <div>
      <PageHeader title="Dashboard" breadcrumb="Patient Overview" />

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-8">
        <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Welcome, {user?.name || 'Patient'}!</h2>
        <p className="text-sm text-[#64748B]">Here's an overview of your screening results and appointments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/pasien/appointments" className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0] hover:border-[#2d3fe0] transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#2563EB] text-2xl">calendar_month</span>
            </div>
            <div><h3 className="text-lg font-semibold text-[#0F172A]">My Appointments</h3>
              <p className="text-sm text-[#64748B]">{appts.length} appointments</p></div>
          </div>
        </Link>
        <Link to="/pasien/reports" className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0] hover:border-[#2d3fe0] transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#059669] text-2xl">description</span>
            </div>
            <div><h3 className="text-lg font-semibold text-[#0F172A]">My Reports</h3>
              <p className="text-sm text-[#64748B]">{reports.length} screening reports</p></div>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Upcoming Appointment</h3>
        {upcoming ? (
          <div className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-lg">
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">{upcoming.doctor_name}</p>
              <p className="text-xs text-[#64748B]">{upcoming.date} at {upcoming.time}</p>
            </div>
            <span className="text-xs font-semibold text-[#2563EB] capitalize">{upcoming.status}</span>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-[#64748B]">No upcoming appointments</p>
            <Link to="/pasien/book" className="inline-block mt-2 text-[#2d3fe0] text-xs font-semibold hover:underline">Book an Appointment</Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#0F172A]">Recent Reports</h3>
          <Link to="/pasien/reports" className="text-[#001bca] text-xs font-semibold hover:underline">View All</Link>
        </div>
        {reports.length > 0 ? (
          <div className="space-y-3">
            {reports.slice(0, 3).map((r) => (
              <Link to={`/pasien/report/${r.id}`} key={r.id} className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-lg hover:bg-[#e8ebef]">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Case #{r.id.slice(-6)}</p>
                  <p className="text-xs text-[#64748B]">{r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : ''}</p>
                </div>
                <span className="text-xs font-semibold text-[#059669]">{r.doctor_result?.final_diagnosis}</span>
              </Link>
            ))}
          </div>
        ) : <p className="text-sm text-[#64748B] text-center py-4">No reports available</p>}
      </div>
    </div>
  );
}
