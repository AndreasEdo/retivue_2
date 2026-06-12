import { useEffect, useState } from 'react';

/**
 * Intro splash — logo muncul di tengah layar navy, lalu fade-out.
 * Tampil sekali per sesi browser (sessionStorage).
 */
export default function SplashScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const hold = setTimeout(() => setLeaving(true), 1500);   // mulai fade-out
    const done = setTimeout(() => onDone?.(), 2050);         // unmount setelah fade
    return () => { clearTimeout(hold); clearTimeout(done); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#0a1228] ${
        leaving ? 'splash-out' : ''
      }`}
    >
      <div className="splash-content flex flex-col items-center gap-5">
        <div className="splash-logo w-20 h-20 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-2xl">
          <img src="/logo.jpg" alt="RetiVue" className="w-full h-full object-contain" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">RetiVue</h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#7e8bc4] mt-2">
            AI Retinal Screening
          </p>
        </div>
      </div>
    </div>
  );
}
