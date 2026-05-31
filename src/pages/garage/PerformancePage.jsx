import { useEffect, useState } from 'react';
import { garageApi } from '../../api/garage.api';
import { useT } from '../../hooks/useT';

function fmt(n) {
  if (n == null) return '—';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

function MetricChip({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
      <div className="text-lg font-extrabold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

export default function PerformancePage() {
  const [employees, setEmployees] = useState([]);
  const [perf, setPerf] = useState({});
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const t = useT();

  const PERIODS = [
    { key: 'today', label: t('presets.today') },
    { key: 'week',  label: t('presets.thisWeek') },
    { key: 'month', label: t('presets.thisMonth') },
  ];

  useEffect(() => {
    garageApi.listEmployees()
      .then(data => setEmployees(Array.isArray(data) ? data : (data.employees ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (employees.length === 0) return;
    Promise.all(
      employees.map(emp =>
        garageApi.getPerformance(emp._id, { period })
          .then(data => ({ id: emp._id, data }))
          .catch(() => ({ id: emp._id, data: null }))
      )
    ).then(results => {
      const map = {};
      results.forEach(r => { map[r.id] = r.data; });
      setPerf(map);
    });
  }, [employees, period]);

  return (
    <div className="p-6" style={{ background: '#f6f6f6', minHeight: '100vh' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('employees.performance')}</h1>
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={period === p.key ? { background: '#E85D04', color: '#fff' } : { color: '#888' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E85D04', borderTopColor: 'transparent' }} />
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400 text-sm">{t('performance.noData')}</div>
      ) : (
        <div className="space-y-4">
          {employees.map(emp => {
            const p = perf[emp._id];
            return (
              <div key={emp._id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: '#E85D04' }}>
                    {emp.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{emp.name}</div>
                    <div className="text-xs text-gray-400">{emp.phone}</div>
                  </div>
                </div>
                {p ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <MetricChip label={t('performance.jobsCompleted')} value={p.jobs_completed ?? '—'} />
                    <MetricChip label={t('performance.revenue')} value={fmt(p.revenue)} />
                    <MetricChip label={t('performance.onTimeRate')} value={p.on_time_rate != null ? `${Math.round(p.on_time_rate * 100)}%` : '—'} />
                    <MetricChip label={t('performance.avgDuration')} value={p.avg_duration_minutes != null ? `${p.avg_duration_minutes}m` : '—'} />
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 text-center py-2">{t('performance.noData')}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
