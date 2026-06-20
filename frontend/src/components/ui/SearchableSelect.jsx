import { useState, useRef, useEffect } from 'react';

// Combobox: klik -> dropdown dengan kotak ketik untuk filter opsi.
export default function SearchableSelect({ options, value, onChange, placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);

  const selectedLabel = options.find((o) => o.value === value)?.label || '';

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQ(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
    : options;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 border border-[#c5c5d8] rounded-lg text-sm bg-white text-left"
      >
        <span className={selectedLabel ? 'text-[#191c1e]' : 'text-[#94a3b8]'}>
          {selectedLabel || placeholder}
        </span>
        <span className="material-symbols-outlined text-[#64748B] text-[20px]">expand_more</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-[#E2E8F0] rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 sticky top-0 bg-white border-b border-[#F1F5F9]">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type to search…"
              className="w-full px-2.5 py-1.5 border border-[#c5c5d8] rounded-md text-sm focus:ring-[#2d3fe0] focus:border-[#2d3fe0]"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-xs text-[#64748B]">No match.</p>
          ) : (
            filtered.map((o) => (
              <button
                type="button"
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); setQ(''); }}
                className={`block w-full text-left px-3 py-2 text-sm hover:bg-[#f2f4f6] transition-colors ${
                  o.value === value ? 'bg-[#EEF2FF] text-[#2d3fe0] font-semibold' : 'text-[#191c1e]'
                }`}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
