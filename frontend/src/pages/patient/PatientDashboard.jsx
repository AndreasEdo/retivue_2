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

      {/* Welcome banner */}
      <div
        className="bg-white rounded-lg border border-[#F1F5F9] p-6 mb-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <h2 className="text-xl font-bold text-[#0F172A] mb-1">
          Welcome, {user?.name || 'Patient'}!
        </h2>
        <p className="text-sm text-[#64748B] font-normal">
          Here's an overview of your screening results and appointments.
        </p>
      </div>

      {/* Quick link cards — 2B: gap-6 mb-6, 2G: smaller icon circles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Link
          to="/pasien/appointments"
          className="bg-white rounded-lg border border-[#F1F5F9] p-6 hover:border-[#2d3fe0] transition-colors"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-4">
            {/* 2G: w-8 h-8, lighter bg */}
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[#2563EB]">calendar_month</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">My Appointments</h3>
              <p className="text-xs text-[#64748B] mt-0.5">{appts.length} appointments</p>
            </div>
          </div>
        </Link>
        <Link
          to="/pasien/reports"
          className="bg-white rounded-lg border border-[#F1F5F9] p-6 hover:border-[#2d3fe0] transition-colors"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[#059669]">description</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">My Reports</h3>
              <p className="text-xs text-[#64748B] mt-0.5">{reports.length} screening reports</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Upcoming Appointment panel */}
      <div
        className="bg-white rounded-lg border border-[#F1F5F9] p-6 mb-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
      >
        {/* 2C: editorial section title */}
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-4">
          Upcoming Appointment
        </h3>
        {upcoming ? (
          /* 2D: border-b style row, no bg */
          <div className="flex items-center justify-between py-3 border-b border-[#F1F5F9]">
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">{upcoming.doctor_name}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{upcoming.date} at {upcoming.time}</p>
            </div>
            <span className="text-xs font-medium text-[#2563EB] capitalize">{upcoming.status}</span>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-[#64748B]">No upcoming appointments</p>
            <Link to="/pasien/book" className="inline-block mt-2 text-[#2d3fe0] text-xs font-semibold hover:underline">
              Book an Appointment
            </Link>
          </div>
        )}
      </div>

      {/* Recent Reports panel */}
      <div
        className="bg-white rounded-lg border border-[#F1F5F9] p-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <div className="flex justify-between items-center mb-4">
          {/* 2C: editorial section title */}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748B]">
            Recent Reports
          </h3>
          <Link to="/pasien/reports" className="text-[#2d3fe0] text-xs font-semibold hover:underline">
            View All
          </Link>
        </div>
        {reports.length > 0 ? (
          <div>
            {reports.slice(0, 3).map((r) => (
              /* 2D: border-b feed, no bg, py-3 */
              <Link
                to={`/pasien/report/${r.id}`}
                key={r.id}
                className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#fafafa] -mx-6 px-6 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Case #{r.id.slice(-6)}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : ''}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#059669]">
                  {r.doctor_result?.final_diagnosis}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#64748B] text-center py-4">No reports available</p>
        )}
      </div>
    </div>
  );
}
