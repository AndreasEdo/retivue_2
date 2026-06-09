import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import PatientRegisterPage from './pages/auth/PatientRegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManagePatients from './pages/admin/ManagePatients';
import DoctorScheduleManagement from './pages/admin/DoctorScheduleManagement';
import SystemMonitoring from './pages/admin/SystemMonitoring';
import MedicalRecordDashboard from './pages/medical_record/MedicalRecordDashboard';
import NewSubmission from './pages/medical_record/NewSubmission';
import SubmissionHistory from './pages/medical_record/SubmissionHistory';
import RejectedCases from './pages/medical_record/RejectedCases';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PendingReviewList from './pages/doctor/PendingReviewList';
import DoctorCaseReview from './pages/doctor/DoctorCaseReview';
import ReviewedCases from './pages/doctor/ReviewedCases';
import PatientDashboard from './pages/patient/PatientDashboard';
import MyAppointments from './pages/patient/MyAppointments';
import BookAppointment from './pages/patient/BookAppointment';
import MyReports from './pages/patient/MyReports';
import ClinicalReportPatientView from './pages/patient/ClinicalReportPatientView';
import ProfileSettings from './pages/ProfileSettings';

// AuthProvider as layout — must use <Outlet /> not {children}
function AuthProviderLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

const ROLE_HOME = {
  admin: '/admin/dashboard',
  medical_record: '/medical-record/dashboard',
  dokter: '/doctor/dashboard',
  pasien: '/pasien/dashboard',
};

function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center text-[#64748B] text-sm">
      Loading…
    </div>
  );
}

// Root redirect: if logged in → go to dashboard, else → /login
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
}

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  }
  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthProviderLayout />,
    children: [
      { index: true, element: <RootRedirect /> },

      // Auth pages — wrapped in AuthLayout (dark navy background)
      {
        element: <AuthLayout />,
        children: [
          { path: 'login',    element: <LoginPage /> },
          { path: 'register', element: <PatientRegisterPage /> },
        ],
      },

      // App pages — wrapped in AppLayout (sidebar + topbar)
      {
        element: <AppLayout />,
        children: [
          { path: 'admin/dashboard',   element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute> },
          { path: 'admin/users',       element: <ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute> },
          { path: 'admin/patients',    element: <ProtectedRoute allowedRoles={['admin']}><ManagePatients /></ProtectedRoute> },
          { path: 'admin/schedules',   element: <ProtectedRoute allowedRoles={['admin']}><DoctorScheduleManagement /></ProtectedRoute> },
          { path: 'admin/monitoring',  element: <ProtectedRoute allowedRoles={['admin']}><SystemMonitoring /></ProtectedRoute> },

          { path: 'medical-record/dashboard',      element: <ProtectedRoute allowedRoles={['medical_record']}><MedicalRecordDashboard /></ProtectedRoute> },
          { path: 'medical-record/new-submission', element: <ProtectedRoute allowedRoles={['medical_record']}><NewSubmission /></ProtectedRoute> },
          { path: 'medical-record/history',        element: <ProtectedRoute allowedRoles={['medical_record']}><SubmissionHistory /></ProtectedRoute> },
          { path: 'medical-record/rejected',       element: <ProtectedRoute allowedRoles={['medical_record']}><RejectedCases /></ProtectedRoute> },

          { path: 'doctor/dashboard', element: <ProtectedRoute allowedRoles={['dokter']}><DoctorDashboard /></ProtectedRoute> },
          { path: 'doctor/pending',   element: <ProtectedRoute allowedRoles={['dokter']}><PendingReviewList /></ProtectedRoute> },
          { path: 'doctor/case/:id',  element: <ProtectedRoute allowedRoles={['dokter']}><DoctorCaseReview /></ProtectedRoute> },
          { path: 'doctor/reviewed',  element: <ProtectedRoute allowedRoles={['dokter']}><ReviewedCases /></ProtectedRoute> },

          { path: 'pasien/dashboard',    element: <ProtectedRoute allowedRoles={['pasien']}><PatientDashboard /></ProtectedRoute> },
          { path: 'pasien/appointments', element: <ProtectedRoute allowedRoles={['pasien']}><MyAppointments /></ProtectedRoute> },
          { path: 'pasien/book',         element: <ProtectedRoute allowedRoles={['pasien']}><BookAppointment /></ProtectedRoute> },
          { path: 'pasien/reports',      element: <ProtectedRoute allowedRoles={['pasien']}><MyReports /></ProtectedRoute> },
          { path: 'pasien/report/:id',   element: <ProtectedRoute allowedRoles={['pasien']}><ClinicalReportPatientView /></ProtectedRoute> },

          { path: 'profile', element: <ProtectedRoute><ProfileSettings /></ProtectedRoute> },
        ],
      },
    ],
  },
]);

export default router;
