import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PatientRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      navigate('/pasien/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      {/* Logo & Branding */}
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white shadow-md mb-4 border border-[#c5c5d8]">
          <span className="material-symbols-outlined text-[#2d3fe0] text-[32px]">visibility</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Patient Registration</h1>
        <p className="text-sm text-[#bac5ee]">Create your RetiVue account</p>
      </div>

      {/* Register Card */}
      <div className="bg-white rounded-xl shadow-[0px_8px_16px_rgba(29,36,89,0.12)] border border-[#c5c5d8]/30 p-8 w-full backdrop-blur-sm">
        {error && (
          <div className="mb-4 p-3 bg-[#FEE2E2] text-[#DC2626] rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-[#454655] mb-2" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#757687]">person</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm text-[#191c1e] bg-white placeholder-[#757687]/60"
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[#454655] mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#757687]">email</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm text-[#191c1e] bg-white placeholder-[#757687]/60"
                id="email"
                name="email"
                type="email"
                placeholder="john@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-[#454655] mb-2" htmlFor="phone">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#757687]">phone</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm text-[#191c1e] bg-white placeholder-[#757687]/60"
                id="phone"
                name="phone"
                type="tel"
                placeholder="081234567890"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#454655] mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#757687]">lock</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm text-[#191c1e] bg-white placeholder-[#757687]/60"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-[#454655] mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#757687]">lock</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-[#c5c5d8] rounded-lg focus:ring-[#2d3fe0] focus:border-[#2d3fe0] text-sm text-[#191c1e] bg-white placeholder-[#757687]/60"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Register Button */}
          <button
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-[#2d3fe0] hover:bg-[#3748e7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2d3fe0] transition-colors duration-200 mt-6 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-[#2d3fe0] hover:underline">
            Already have an account? Sign In
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center mt-8">
        <p className="text-[11px] text-[#bac5ee]/70 tracking-widest uppercase">
          RETIVUE V2.0 · POWERED BY SWINV2 AI MODEL
        </p>
      </div>
    </div>
  );
}
