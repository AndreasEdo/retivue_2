import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isEmail } from '../../lib/validation';

const ROLE_HOME = {
  admin: '/admin/dashboard',
  medical_record: '/medical-record/dashboard',
  dokter: '/doctor/dashboard',
  pasien: '/pasien/dashboard',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const doLogin = async (em, pw) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(em, pw);
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEmail(email)) { setError('Enter a valid email address.'); return; }
    if (!password) { setError('Password is required.'); return; }
    doLogin(email, password);
  };

  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white shadow-md mb-4 border border-[#c5c5d8]">
          <span className="material-symbols-outlined text-[#2d3fe0] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            visibility
          </span>
        </div>
        <h1 className="text-[30px] leading-[38px] font-bold tracking-tight text-white mb-2">RetiVue</h1>
        <p className="text-[13px] text-[#bac5ee]">AI-Assisted Retinal Screening Platform</p>
      </div>

      <div className="bg-white rounded-xl shadow-[0px_8px_16px_rgba(29,36,89,0.12)] border border-[#c5c5d8]/30 p-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="text-left text-[13px] text-[#DC2626] bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-bold tracking-[0.05em] text-[#454655] mb-2 text-left" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#757687]">person</span>
              </div>
              <input
                id="email" type="email" placeholder="you@clinic.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="block w-full pl-10 pr-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm text-[#191c1e] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold tracking-[0.05em] text-[#454655] mb-2 text-left" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#757687]">lock</span>
              </div>
              <input
                id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className="block w-full pl-10 pr-10 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm text-[#191c1e] bg-white"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" aria-label="Toggle password" onClick={() => setShowPass(!showPass)}
                  className="text-[#757687] hover:text-[#454655] focus:outline-none">
                  <span className="material-symbols-outlined text-[20px]">{showPass ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 rounded-lg text-[12px] font-bold tracking-[0.05em] text-white bg-[#2d3fe0] hover:bg-[#3748e7] disabled:opacity-60 transition-colors">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-sm text-[#D97706] flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            Authorized medical personnel only
          </p>
        </form>

        <div className="mt-6 text-center">
          <Link to="/register" className="text-sm text-[#2d3fe0] hover:underline">Register as Patient</Link>
        </div>
      </div>

      <p className="text-center mt-8 text-[11px] text-[#bac5ee]/70 tracking-widest uppercase">
        RetiVue v2.0 · Powered by SwinV2 AI Model
      </p>
    </div>
  );
}
