import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { garageApi } from '../../api/garage.api';
import { useT } from '../../hooks/useT';
import DateRangePicker from '../../components/DateRangePicker';

function fmt(n) {
  if (n == null) return '—';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString()}`;
}

function StatCard({ icon, label, value, accent, bg }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-xl font-extrabold" style={{ color: accent }}>{value}</div>
      </div>
    </div>
  );
}

const ICONS = {
  jobs: (c) => (
    <svg className="w-5 h-5" fill="none" stroke={c} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  dues: (c) => (
    <svg className="w-5 h-5" fill="none" stroke={c} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ontime: (c) => (
    <svg className="w-5 h-5" fill="none" stroke={c} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  duration: (c) => (
    <svg className="w-5 h-5" fill="none" stroke={c} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

export default function RevenuePage() {
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(location.state?.from ?? '');
  const [dateTo, setDateTo]     = useState(location.state?.to   ?? '');
  const navigate = useNavigate();
  const t = useT();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (dateFrom) params.from = dateFrom;
    if (dateTo)   params.to   = dateTo;
    garageApi.getDashboardMonthly(params).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  const totalRevenue  = data?.total_revenue  ?? 0;
  const cashRevenue   = data?.cash_collected  ?? 0;
  const onlineRevenue = data?.online_collected ?? 0;
  const totalJobs     = data?.total_jobs       ?? 0;
  const pendingDues   = data?.pending_dues     ?? 0;
  // backend returns on_time_rate already as "100%" string
  const onTimeRate    = data?.on_time_rate ?? null;
  // backend returns avg_job_duration_minutes in minutes
  const avgMins       = data?.avg_job_duration_minutes ?? null;
  const avgDuration   = avgMins != null
    ? (avgMins < 60 ? `${avgMins} min` : `${(avgMins / 60).toFixed(1)} hrs`)
    : null;

  const cashPct   = totalRevenue > 0 ? Math.round((cashRevenue   / totalRevenue) * 100) : 0;
  const onlinePct = totalRevenue > 0 ? Math.round((onlineRevenue / totalRevenue) * 100) : 0;

  return (
    <div className="p-6" style={{ background: '#f6f6f6', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{t('revenue.title')}</h1>
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onChange={({ from, to }) => { setDateFrom(from); setDateTo(to); }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E85D04', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <>
          {/* Hero revenue card */}
          <div className="rounded-2xl text-white p-7 mb-6 shadow-lg relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #E85D04 0%, #c44e00 100%)' }}>
            {/* Decorative circle */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10" style={{ background: '#fff' }} />
            <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full opacity-10" style={{ background: '#fff' }} />
            <div className="relative">
              <div className="text-xs font-bold uppercase tracking-widest opacity-75 mb-2">{t('revenue.totalRevenue')}</div>
              <div className="text-5xl font-extrabold tracking-tight mb-4">{fmt(totalRevenue)}</div>
              {/* Cash / Online inline split */}
              <div className="flex gap-6">
                <div>
                  <div className="text-xs opacity-70 mb-0.5">{t('revenue.cash')}</div>
                  <div className="text-lg font-bold">{fmt(cashRevenue)}</div>
                </div>
                <div className="w-px bg-white opacity-20" />
                <div>
                  <div className="text-xs opacity-70 mb-0.5">{t('revenue.onlineUpi')}</div>
                  <div className="text-lg font-bold">{fmt(onlineRevenue)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment split bars */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Payment Split</h2>
            <div className="space-y-4">
              {/* Cash */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#2d6a4f' }} />
                    <span className="text-gray-700 font-medium">{t('revenue.cash')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{cashPct}%</span>
                    <span className="font-bold text-gray-900">{fmt(cashRevenue)}</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cashPct}%`, background: '#2d6a4f' }} />
                </div>
              </div>
              {/* Online */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#0077b6' }} />
                    <span className="text-gray-700 font-medium">{t('revenue.onlineUpi')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{onlinePct}%</span>
                    <span className="font-bold text-gray-900">{fmt(onlineRevenue)}</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${onlinePct}%`, background: '#0077b6' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={ICONS.jobs('#E85D04')}
              label={t('revenue.totalJobs')}
              value={totalJobs}
              accent="#E85D04"
              bg="#FFF4EE"
            />
            <StatCard
              icon={ICONS.dues('#c62828')}
              label={t('revenue.pendingDues')}
              value={fmt(pendingDues)}
              accent="#c62828"
              bg="#fff5f5"
            />
            {onTimeRate != null && (
              <StatCard
                icon={ICONS.ontime('#2d6a4f')}
                label={t('revenue.onTimeRate')}
                value={onTimeRate}
                accent="#2d6a4f"
                bg="#f0faf4"
              />
            )}
            {avgDuration != null && (
              <StatCard
                icon={ICONS.duration('#0077b6')}
                label={t('revenue.avgDuration')}
                value={avgDuration}
                accent="#0077b6"
                bg="#e8f4fb"
              />
            )}
          </div>

          {/* Collection by Employee */}
          {data?.collector_breakdown?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Collection by Employee</h2>
              <div className="space-y-3">
                {data.collector_breakdown.map((c) => (
                  <div key={c._id ?? 'unknown'} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#E85D04' }}>
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{c.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{fmt(c.collected)}</span>
                      <span className="text-xs text-gray-400 ml-2">{c.count} job{c.count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View payments button */}
          <button
            onClick={() => navigate('/garage/payments')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#E85D04' }}
          >
            {t('revenue.viewPayments')}
            <span className="text-base leading-none">→</span>
          </button>
        </>
      )}
    </div>
  );
}
