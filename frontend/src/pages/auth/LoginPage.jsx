import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [role, setRole]           = useState('dokter');
  const [name, setName]           = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(role, name || email.split('@')[0]);
    const roleRedirects = {
      admin:          '/admin/dashboard',
      medical_record: '/medical-record/dashboard',
      dokter:         '/doctor/dashboard',
      pasien:         '/pasien/dashboard',
    };
    navigate(roleRedirects[role]);
  };

  return (
    <div className="text-center">
      {/* Logo & Branding */}
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white shadow-md mb-4 border border-[#c5c5d8]">
          <span
            className="material-symbols-outlined text-[#2d3fe0] text-[32px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            visibility
          </span>
        </div>
        <h1 className="text-[30px] leading-[38px] font-bold tracking-tight text-white mb-2">
          RetiVue
        </h1>
        <p className="text-[13px] text-[#bac5ee]">AI-Assisted Retinal Screening Platform</p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-xl shadow-[0px_8px_16px_rgba(29,36,89,0.12)] border border-[#c5c5d8]/30 p-8 w-full backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div>
            <label className="block text-[12px] font-bold tracking-[0.05em] text-[#454655] mb-2" htmlFor="email">
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#757687]">person</span>
              </div>
              <input
                id="email"
                type="text"
                placeholder="doctor@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm text-[#191c1e] bg-white placeholder-[#757687]/60"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[12px] font-bold tracking-[0.05em] text-[#454655] mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#757687]">lock</span>
              </div>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-10 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm text-[#191c1e] bg-white placeholder-[#757687]/60"
              />
              {/* Toggle show/hide password */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPass(!showPass)}
                  className="text-[#757687] hover:text-[#454655] focus:outline-none transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPass ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-[12px] font-bold tracking-[0.05em] text-white bg-[#2d3fe0] hover:bg-[#3748e7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2d3fe0] transition-colors duration-200"
          >
            Sign In
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-[#D97706] flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Authorized medical personnel only
            </p>
          </div>

          {/* Dev Mode Role Selector — hanya untuk development */}
          <div className="pt-4 border-t border-[#E2E8F0]">
            <label className="block text-[11px] font-bold tracking-[0.08em] text-[#D97706] mb-2 uppercase">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">warning</span>
              Dev Mode: Select Role
            </label>
            <select
              className="block w-full px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm text-[#191c1e] bg-white focus:ring-[#2d3fe0] focus:border-[#2d3fe0]"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="medical_record">Medical Record (Laboran)</option>
              <option value="dokter">Dokter</option>
              <option value="pasien">Pasien</option>
            </select>
            <input
              type="text"
              placeholder="Display Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full mt-2 px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm text-[#191c1e] bg-white placeholder-[#757687]/60 focus:ring-[#2d3fe0] focus:border-[#2d3fe0]"
            />
          </div>

        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <Link to="/register" className="text-sm text-[#2d3fe0] hover:underline">
            Register as Patient
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-[11px] text-[#bac5ee]/70 tracking-widest uppercase">
          RETIVUE V2.0 · POWERED BY SWINV2 AI MODEL
        </p>
      </div>
    </div>
  );
}
