import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E2A4A] to-[#131b2f] p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
