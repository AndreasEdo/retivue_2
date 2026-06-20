import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ROLE_HOME = {
  admin: '/admin/dashboard',
  medical_record: '/medical-record/dashboard',
  dokter: '/doctor/dashboard',
  pasien: '/pasien/dashboard',
};

const features = [
  {
    icon: 'biotech',
    title: 'SwinV2 AI Engine',
    desc: 'Swin Transformer V2 trained on 5-fold cross-validation — QWK 0.93 — grading retinal images in under 3 seconds on CPU.',
  },
  {
    icon: 'group',
    title: 'Multi-Role Workflow',
    desc: 'Admin → Medical Record (AI submission) → Doctor (review & validate) → Patient (approved report). Human always in the loop.',
  },
  {
    icon: 'visibility',
    title: 'Explainable AI',
    desc: 'Grad-CAM heat maps show exactly where the model focuses, enabling ophthalmologists to verify AI findings efficiently.',
  },
  {
    icon: 'lock',
    title: 'Patient Privacy',
    desc: 'Raw AI scores, confidence, and gradient maps are never exposed to patients — only the doctor-approved clinical summary.',
  },
];

const steps = [
  { num: '01', label: 'Upload Fundus Photo', desc: 'Medical record staff uploads the retinal image via drag-and-drop.' },
  { num: '02', label: 'AI Screening', desc: 'Ben Graham preprocessing + SwinV2 regression grades DR severity (0–4).' },
  { num: '03', label: 'Doctor Validation', desc: 'Ophthalmologist reviews AI results with Grad-CAM and writes the final diagnosis.' },
  { num: '04', label: 'Patient Report', desc: 'Patient receives the doctor-approved clinical summary — no raw AI data.' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) navigate(ROLE_HOME[user.role] || '/login');
    else navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1e] text-[#0f172a] dark:text-[#e2e8f0] transition-colors duration-300 page-fade">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0f1e]/80 backdrop-blur-md border-b border-[#e2e8f0] dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/retivue_logo_new.png" alt="RetiVue" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle dark mode"
            >
              <span className="material-symbols-outlined text-[22px]">{dark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            {!loading && (
              user ? (
                <button
                  onClick={handleCTA}
                  className="px-4 py-2 bg-[#2d3fe0] text-white text-sm font-semibold rounded-lg hover:bg-[#3748e7] transition-colors"
                >
                  Go to Dashboard
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-[#2d3fe0] text-white text-sm font-semibold rounded-lg hover:bg-[#3748e7] transition-colors"
                >
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2d3fe0]/10 dark:bg-[#2d3fe0]/20 text-[#2d3fe0] dark:text-[#93a5ff] text-xs font-semibold mb-8 border border-[#2d3fe0]/20 dark:border-[#2d3fe0]/30">
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          ASEAN AI Hackathon 2026 · Telemedicine Track
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          AI-Powered Retinal Screening
          <br />
          <span className="text-[#2d3fe0]">for ASEAN Telemedicine</span>
        </h1>
        <p className="text-lg text-[#64748b] dark:text-[#94a3b8] max-w-2xl mx-auto mb-10">
          RetiVue detects Diabetic Retinopathy severity (Grade 0–4) from fundus photographs
          using a SwinV2 AI model — assisting ophthalmologists with fast, explainable triage.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={handleCTA}
            className="px-8 py-3.5 bg-[#2d3fe0] text-white font-semibold rounded-xl hover:bg-[#3748e7] transition-all hover:scale-[1.02] shadow-lg shadow-[#2d3fe0]/30"
          >
            {user ? 'Go to Dashboard' : 'Get Started'}
          </button>
          <a
            href="#how-it-works"
            className="px-8 py-3.5 bg-white dark:bg-white/10 text-[#0f172a] dark:text-[#e2e8f0] font-semibold rounded-xl border border-[#e2e8f0] dark:border-white/20 hover:border-[#2d3fe0] dark:hover:border-[#2d3fe0] transition-all"
          >
            How It Works
          </a>
        </div>

        {/* Stat badges */}
        <div className="flex items-center justify-center gap-6 mt-14 flex-wrap">
          {[
            { val: '0.93', label: 'QWK Score' },
            { val: '5-fold', label: 'Cross Validation' },
            { val: 'Grade 0–4', label: 'DR Severity' },
            { val: 'CPU', label: 'Inference' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-[#2d3fe0]">{val}</p>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-[#f8fafc] dark:bg-[#0f172a] py-20 border-y border-[#e2e8f0] dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3">Built for Clinical Workflows</h2>
          <p className="text-center text-[#64748b] dark:text-[#94a3b8] mb-12">
            Every feature is designed around the real needs of telemedicine clinics.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-[#e2e8f0] dark:border-white/10 hover:border-[#2d3fe0] dark:hover:border-[#2d3fe0]/50 transition-all hover:shadow-lg hover:shadow-[#2d3fe0]/5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#2d3fe0]/10 dark:bg-[#2d3fe0]/20 flex items-center justify-center mb-4 group-hover:bg-[#2d3fe0]/20 transition-colors">
                  <span className="material-symbols-outlined text-[#2d3fe0] text-[22px]">{icon}</span>
                </div>
                <h3 className="font-semibold text-sm mb-2">{title}</h3>
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-3">How It Works</h2>
        <p className="text-center text-[#64748b] dark:text-[#94a3b8] mb-14">
          Four steps from fundus photo to clinical report.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ num, label, desc }, i) => (
            <div key={num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-gradient-to-r from-[#2d3fe0]/30 to-transparent -translate-x-4 z-0" />
              )}
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-[#2d3fe0] text-white flex items-center justify-center text-sm font-bold mb-4 shadow-lg shadow-[#2d3fe0]/30">
                  {num}
                </div>
                <h3 className="font-semibold mb-2">{label}</h3>
                <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-gradient-to-r from-[#1e2a4a] to-[#2d3fe0] py-16 text-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Screening?</h2>
          <p className="text-[#bac5ee] mb-8 text-sm">
            Sign in with your clinical credentials or register as a patient.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/login"
              className="px-8 py-3 bg-white text-[#2d3fe0] font-semibold rounded-xl hover:bg-[#f0f4ff] transition-colors shadow-md"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-colors"
            >
              Register as Patient
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 border-t border-[#e2e8f0] dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/retivue_logo_new.png" alt="RetiVue" className="h-6 w-auto" />
            <span className="text-xs text-[#64748b] dark:text-[#94a3b8]">RetiVue v2.0 · Powered by SwinV2</span>
          </div>
          <p className="text-xs text-[#64748b] dark:text-[#94a3b8] text-center">
            ⚕️ For triage assistance only. Not a substitute for professional medical diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
}
