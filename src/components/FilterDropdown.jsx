import { useState, useRef, useEffect } from 'react';

export default function FilterDropdown({ label, value, options, onChange, activeColor = '#E85D04', activeBg = '#FFF4EE' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const active = value !== 'all';
  const selectedLabel = options.find(o => o.value === value)?.label ?? label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
        style={active
          ? { borderColor: activeColor, color: activeColor, background: activeBg }
          : { borderColor: '#e0e0e0', color: '#555', background: '#fff' }}
      >
        {active ? selectedLabel : label}
        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={open ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-max">
          {options.map(opt => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between gap-4 transition-colors"
                style={isSelected
                  ? { color: activeColor, background: activeBg }
                  : { color: '#444', background: '#fff' }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f6f6f6'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#fff'; }}
              >
                {opt.label}
                {isSelected && (
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
