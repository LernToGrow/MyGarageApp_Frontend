const config = {
  blue: {
    bg: 'from-blue-50 to-blue-50/30',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    value: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  green: {
    bg: 'from-emerald-50 to-emerald-50/30',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    value: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  orange: {
    bg: 'from-orange-50 to-orange-50/30',
    border: 'border-orange-100',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    value: 'text-orange-700',
    dot: 'bg-orange-500',
  },
  purple: {
    bg: 'from-purple-50 to-purple-50/30',
    border: 'border-purple-100',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    value: 'text-purple-700',
    dot: 'bg-purple-500',
  },
};

const icons = {
  blue: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  purple: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  orange: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  green: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function StatCard({ label, value, sub, color = 'blue' }) {
  const c = config[color];

  return (
    <div className={`bg-white rounded-2xl border ${c.border} shadow-sm overflow-hidden`}>
      <div className={`bg-gradient-to-br ${c.bg} px-5 pt-5 pb-4`}>
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${c.iconBg} ${c.iconColor} flex items-center justify-center`}>
            {icons[color]}
          </div>
          <div className={`w-2 h-2 rounded-full ${c.dot} mt-1 opacity-60`} />
        </div>
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</div>
        <div className={`text-3xl font-extrabold ${c.value} leading-none`}>{value}</div>
      </div>
      {sub && (
        <div className="px-5 py-2.5 border-t border-slate-100 bg-white">
          <span className="text-xs text-slate-400">{sub}</span>
        </div>
      )}
    </div>
  );
}
