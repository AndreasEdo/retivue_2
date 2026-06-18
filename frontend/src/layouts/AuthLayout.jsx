import { Outlet, useLocation, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function AuthLayout() {
  const { dark, toggle } = useTheme();
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E2A4A] to-[#131b2f] p-4 relative">
      {/* Back to landing */}
      <Link
        to="/"
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#bac5ee] hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Back
      </Link>

      {/* Dark mode toggle */}
      <button
        onClick={toggle}
        className="absolute top-4 right-4 p-2 rounded-lg text-[#bac5ee] hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Toggle dark mode"
      >
        <span className="material-symbols-outlined text-[22px]">{dark ? 'light_mode' : 'dark_mode'}</span>
      </button>

      <div key={location.pathname} className="w-full max-w-md page-transition">
        <Outlet />
      </div>
    </div>
  );
}
