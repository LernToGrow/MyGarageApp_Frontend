import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { garageApi } from '../../api/garage.api';
import { useT } from '../../hooks/useT';

const STATUS_COLORS = {
  received: '#6c757d', inspecting: '#0077b6', estimated: '#9c6644',
  in_progress: '#E85D04', done: '#2d6a4f', paid: '#1b4332',
};

function fmt(n) {
  if (n == null) return '—';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

const CARD_ICONS = {
  wrench: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  rupee: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function MetricCard({ label, value, sub, accent, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-5 shadow-sm border-l-4 transition-all duration-200"
      style={{
        borderColor: accent,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</div>
        {icon && <div style={{ color: accent, opacity: 0.7 }}>{CARD_ICONS[icon]}</div>}
      </div>
      <div className="text-3xl font-extrabold" style={{ color: accent }}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function StatusBadge({ status, t }) {
  const color = STATUS_COLORS[status] ?? '#6c757d';
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: color }}>
      {t(`jobs.status.${status}`) !== `jobs.status.${status}` ? t(`jobs.status.${status}`) : status?.replace('_', ' ')}
    </span>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const t = useT();

  useEffect(() => {
    Promise.all([garageApi.getDashboardSummary(), garageApi.getDashboardAlerts()])
      .then(([s, a]) => { setSummary(s); setAlerts(a); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E85D04', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const activeJobs = summary?.active_jobs ?? 0;
  const doneToday = summary?.done_jobs_today ?? 0;
  const revenue = summary?.today_revenue ?? 0;
  const pendingDues = summary?.total_pending_dues ?? 0;
  const liveJobs = summary?.live_jobs ?? [];
  const lowStock = alerts?.low_stock_parts ?? [];
  const overduePayments = alerts?.overdue_payments ?? [];

  return (
    <div className="p-6" style={{ background: '#f6f6f6', minHeight: '100vh' }}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <MetricCard label={t('dashboard.activeJobs')} value={activeJobs} sub={t('dashboard.liveJobs')} accent="#E85D04" icon="wrench" onClick={() => navigate('/garage/jobs', { state: { statusFilter: 'active' } })} />
        <MetricCard label={t('dashboard.doneToday')} value={doneToday} accent="#2d6a4f" icon="check" onClick={() => navigate('/garage/jobs', { state: { statusFilter: 'done' } })} />
        <MetricCard label={t('dashboard.revenue')} value={fmt(revenue)} sub={t('dashboard.todayRevenue')} accent="#0077b6" icon="rupee" onClick={() => { const today = new Date().toISOString().slice(0, 10); navigate('/garage/revenue', { state: { from: today, to: today } }); }} />
        <MetricCard label={t('dashboard.pendingDues')} value={fmt(pendingDues)} accent="#c62828" icon="clock" onClick={() => navigate('/garage/payments', { state: { statusFilter: 'pending_dues' } })} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">{t('dashboard.liveJobs')}</h2>
            <button
              onClick={() => navigate('/garage/jobs')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: '#FFF4EE', color: '#E85D04' }}
              onMouseEnter={e => e.currentTarget.style.background = '#ffe3cf'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFF4EE'}
            >
              {t('common.all')} →
            </button>
          </div>
          {liveJobs.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">{t('dashboard.noActiveJobs')}</p>
          ) : (
            <div className="space-y-2">
              {liveJobs.map(job => (
                <div
                  key={job._id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg border-l-4 bg-gray-50"
                  style={{ borderColor: STATUS_COLORS[job.status] ?? '#6c757d' }}
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-800">#{job.job_number}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {job.customer_id?.name ?? '—'} · {[job.bike_id?.make, job.bike_id?.model].filter(Boolean).join(' ') || '—'} ({job.bike_id?.plate_number ?? '—'})
                    </div>
                  </div>
                  <StatusBadge status={job.status} t={t} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-4">{t('dashboard.alerts')}</h2>

          {lowStock.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 mb-2">{t('dashboard.lowStock')}</div>
              {lowStock.map(part => (
                <div key={part._id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{part.name_en ?? part.name}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#c62828' }}>
                    {t('dashboard.qtyMin', { qty: part.quantity, min: part.min_quantity })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {overduePayments.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">{t('dashboard.overduePayments')}</div>
              {overduePayments.map(job => (
                <div key={job._id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">#{job.job_number} · {job.customer_id?.name ?? '—'}</span>
                  <span className="text-xs font-bold" style={{ color: '#c62828' }}>{fmt(job.balance_due)}</span>
                </div>
              ))}
            </div>
          )}

          {lowStock.length === 0 && overduePayments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#f0faf4' }}>
                <svg className="w-5 h-5" fill="none" stroke="#2d6a4f" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: '#2d6a4f' }}>{t('dashboard.allClear')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
