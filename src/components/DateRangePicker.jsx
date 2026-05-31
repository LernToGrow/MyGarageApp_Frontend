import { useState, useRef, useEffect } from 'react';
import { useLanguageStore } from '../store/languageStore';
import { useT } from '../hooks/useT';

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOf(unit) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (unit === 'week')   { d.setDate(d.getDate() - d.getDay()); }
  if (unit === 'month')  { d.setDate(1); }
  if (unit === 'month3') { d.setMonth(d.getMonth() - 3); d.setDate(1); }
  return d;
}

function CalendarMonth({ year, month, from, to, hovering, onSelect, onHover }) {
  const { translations } = useLanguageStore();
  const monthNames = translations?.common?.months ?? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dayLabels  = translations?.common?.dayLabels ?? ['S','M','T','W','T','F','S'];

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Pad start, build day cells
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const iso = (day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const inRange = (d) => {
    if (!d) return false;
    const end = to || hovering;
    if (!from || !end) return false;
    const [a, b] = from <= end ? [from, end] : [end, from];
    return d > a && d < b;
  };

  const isEdge = (d) => d && (d === from || d === to || (!to && d === hovering && from));
  const isFrom = (d) => d === from;
  const isTo   = (d) => d === (to || hovering);

  // Round left/right edges for range highlight
  const roundClass = (d) => {
    if (!d) return '';
    if (isFrom(d) && isTo(d)) return 'rounded-full';
    if (isFrom(d)) return 'rounded-l-full';
    if (isTo(d))   return 'rounded-r-full';
    return '';
  };

  return (
    <div style={{ width: 252 }}>
      {/* Month / Year heading */}
      <div className="text-sm font-bold text-center text-gray-800 mb-3 tracking-wide">
        {monthNames[month]} {year}
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {dayLabels.map((d, i) => (
          <div key={i} className="flex items-center justify-center text-xs font-semibold text-gray-400" style={{ height: 32, width: 36 }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const d = day ? iso(day) : null;
          const edge  = isEdge(d);
          const range = inRange(d);
          const from_ = isFrom(d);
          const to_   = isTo(d);

          return (
            <div
              key={i}
              style={{ height: 36, width: 36 }}
              className={`relative flex items-center justify-center ${day ? 'cursor-pointer' : ''}`}
              onClick={() => day && onSelect(d)}
              onMouseEnter={() => day && onHover(d)}
            >
              {/* Range band behind the number */}
              {(range || (edge && (from || to))) && (
                <div
                  className="absolute inset-y-1"
                  style={{
                    left:  from_ ? '50%' : 0,
                    right: to_   ? '50%' : 0,
                    background: '#E85D0420',
                  }}
                />
              )}

              {/* Circle for edge dates */}
              {edge && (
                <div
                  className="absolute inset-1 rounded-full"
                  style={{ background: '#E85D04' }}
                />
              )}

              {/* Day number */}
              <span
                className="relative z-10 text-xs font-semibold select-none"
                style={{
                  color: edge ? '#fff' : day ? '#333' : 'transparent',
                }}
              >
                {day ?? ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePicker({ from, to, onChange, className }) {
  const t = useT();
  const { translations } = useLanguageStore();
  const monthNames = translations?.common?.months ?? [];

  const PRESETS = [
    { key: 'today',  label: t('presets.today'),    getFrom: () => toISO(startOf('day')),    getTo: () => toISO(new Date()) },
    { key: 'week',   label: t('presets.thisWeek'),  getFrom: () => toISO(startOf('week')),   getTo: () => toISO(new Date()) },
    { key: 'month',  label: t('presets.thisMonth'), getFrom: () => toISO(startOf('month')),  getTo: () => toISO(new Date()) },
    { key: 'month3', label: t('presets.last3'),     getFrom: () => toISO(startOf('month3')), getTo: () => toISO(new Date()) },
  ];

  const [open, setOpen]               = useState(false);
  const [hovering, setHovering]       = useState(null);
  const [activePreset, setActivePreset] = useState(null);
  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const applyPreset = (p) => {
    setActivePreset(p.key);
    onChange({ from: p.getFrom(), to: p.getTo() });
    setOpen(false);
  };

  const handleSelect = (d) => {
    setActivePreset(null);
    if (!from || (from && to)) {
      // Start new range
      onChange({ from: d, to: '' });
    } else {
      // Complete range
      const [a, b] = d >= from ? [from, d] : [d, from];
      onChange({ from: a, to: b });
      setOpen(false);
    }
  };

  const clear = (e) => {
    e?.stopPropagation();
    setActivePreset(null);
    onChange({ from: '', to: '' });
  };

  const prevMonth = () => viewMonth === 0 ? (setViewYear(y => y - 1), setViewMonth(11)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewYear(y => y + 1), setViewMonth(0)) : setViewMonth(m => m + 1);

  const formatDate = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const mName = monthNames[m - 1] ?? iso;
    return `${d} ${mName}`;
  };

  const hasRange = from || to;

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>

      {/* ── Trigger Button ── */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all"
        style={
          hasRange
            ? { borderColor: '#E85D04', background: '#FFF4EE', color: '#E85D04' }
            : { borderColor: '#e0e0e0', background: '#fff', color: '#666' }
        }
      >
        {/* calendar icon */}
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="whitespace-nowrap">
          {hasRange
            ? `${formatDate(from)}${to && to !== from ? ` – ${formatDate(to)}` : ''}`
            : `${t('common.from')} – ${t('common.to')}`}
        </span>
        {hasRange && (
          <span
            onClick={clear}
            className="ml-0.5 text-lg leading-none hover:text-red-500 transition-colors"
            style={{ lineHeight: 1 }}
          >
            ×
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex overflow-hidden"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}
        >
          {/* Preset list */}
          <div className="flex flex-col py-3 px-2 border-r border-gray-100" style={{ width: 148 }}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 px-3 mb-2">Quick</p>
            {PRESETS.map(p => (
              <button
                key={p.key}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={
                  activePreset === p.key
                    ? { background: '#E85D04', color: '#fff' }
                    : { color: '#444' }
                }
                onMouseEnter={e => { if (activePreset !== p.key) e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseLeave={e => { if (activePreset !== p.key) e.currentTarget.style.background = ''; }}
              >
                {p.label}
              </button>
            ))}
            {hasRange && (
              <>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => clear()}
                  className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = '#fff0f0'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  {t('common.cancel')}
                </button>
              </>
            )}
          </div>

          {/* Calendar */}
          <div className="p-4">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-1" style={{ width: 252 }}>
              <button
                type="button"
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors text-lg"
              >
                ‹
              </button>
              <div /> {/* month label is inside CalendarMonth */}
              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors text-lg"
              >
                ›
              </button>
            </div>

            <CalendarMonth
              year={viewYear}
              month={viewMonth}
              from={from}
              to={to}
              hovering={hovering}
              onSelect={handleSelect}
              onHover={setHovering}
            />

            {/* Hint */}
            {from && !to && (
              <p className="text-xs text-gray-400 text-center mt-2">
                {t('common.to')} →
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
