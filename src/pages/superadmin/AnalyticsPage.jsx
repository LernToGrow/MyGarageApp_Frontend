import { useEffect, useState } from 'react';
import { getRevenueAnalytics, getJobAnalytics } from '../../api/admin.api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const STATUS_COLORS = {
  paid:        '#10b981',
  done:        '#8b5cf6',
  in_progress: '#f59e0b',
  inspecting:  '#3b82f6',
  estimated:   '#ef4444',
  received:    '#6b7280',
  closed:      '#94a3b8',
};
const PIE_COLORS = ['#10b981','#8b5cf6','#f59e0b','#3b82f6','#ef4444','#6b7280','#14b8a6'];

function fmt(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl space-y-1">
      <div className="text-slate-400 mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-bold">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: p.payload.fill }} />
        <span className="capitalize font-semibold">{p.name?.replace('_', ' ')}</span>
        <span className="text-slate-300">— {p.value} jobs</span>
      </div>
    </div>
  );
}

const STAT_CARDS = [
  {
    key: 'all_time_revenue',
    label: 'All-time Revenue',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'all_time_gst',
    label: 'All-time GST',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    border: 'border-blue-100',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
];

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState(null);
  const [jobs, setJobs]       = useState(null);
  const [months, setMonths]   = useState(6);

  useEffect(() => {
    getRevenueAnalytics({ months }).then(setRevenue);
    getJobAnalytics().then(setJobs);
  }, [months]);

  const totalJobs = jobs?.by_status?.reduce((s, x) => s + x.count, 0) || 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Sticky header */}
      <div className="shrink-0 px-8 pt-6 pb-4 bg-slate-50 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-slate-400 text-sm mt-0.5">Revenue, jobs, and GST insights</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

      {revenue && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4">
            {STAT_CARDS.map(c => (
              <div key={c.key} className={`bg-white rounded-2xl border ${c.border} shadow-sm overflow-hidden`}>
                <div className={`bg-gradient-to-br from-white to-${c.bg.replace('bg-', '')} px-5 pt-5 pb-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.iconColor} flex items-center justify-center`}>
                      {c.icon}
                    </div>
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{c.label}</div>
                  <div className={`text-3xl font-extrabold ${c.color} leading-none`}>{fmt(revenue[c.key])}</div>
                </div>
              </div>
            ))}

            {/* Avg job value card */}
            {jobs && (
              <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Avg Job Value</div>
                  <div className="text-3xl font-extrabold text-purple-700 leading-none">{fmt(jobs.avg_job_value)}</div>
                  <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Avg turnaround: {Math.round(jobs.avg_duration_minutes)} min
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Revenue Trend */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Monthly Revenue Trend</h2>
                <p className="text-xs text-slate-400 mt-0.5">Revenue vs GST collected per month</p>
              </div>
              <div className="relative">
                <select
                  value={months}
                  onChange={e => setMonths(Number(e.target.value))}
                  className="appearance-none pl-3 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white shadow-sm"
                >
                  <option value={3}>3 months</option>
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-3 rounded bg-blue-500" /> Revenue
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-3 rounded bg-indigo-200" /> GST
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenue.monthly_trend} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Revenue" maxBarSize={40} />
                  <Bar dataKey="gst"     fill="#a5b4fc" radius={[6, 6, 0, 0]} name="GST"     maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Garages */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50">
              <h2 className="text-sm font-semibold text-slate-800">Top Garages by Revenue</h2>
              <p className="text-xs text-slate-400 mt-0.5">{revenue.top_garages.length} garages ranked</p>
            </div>
            <div className="p-4 space-y-2">
              {revenue.top_garages.map((g, i) => {
                const max = revenue.top_garages[0]?.revenue || 1;
                const pct = Math.round((g.revenue / max) * 100);
                return (
                  <div key={i} className="flex items-center gap-4 px-2 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-800 truncate">{g.garage?.name || 'Unknown'}</span>
                        {g.garage?.city && <span className="text-xs text-slate-400 shrink-0">{g.garage.city}</span>}
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-800">{fmt(g.revenue)}</div>
                      <div className="text-xs text-slate-400">GST: {fmt(g.gst)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Jobs by Status */}
      {jobs && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Jobs by Status</h2>
              <p className="text-xs text-slate-400 mt-0.5">{totalJobs} total jobs</p>
            </div>
          </div>
          <div className="p-6 flex gap-8">
            {/* Donut chart */}
            <div className="shrink-0">
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie
                    data={jobs.by_status}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%" cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {jobs.by_status.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry._id] || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend list */}
            <div className="flex-1 flex flex-col justify-center gap-2">
              {jobs.by_status.map((entry, i) => {
                const color = STATUS_COLORS[entry._id] || PIE_COLORS[i % PIE_COLORS.length];
                const pct = Math.round((entry.count / totalJobs) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-sm text-slate-600 capitalize flex-1">{entry._id?.replace('_', ' ')}</span>
                    <span className="text-sm font-bold text-slate-800">{entry.count}</span>
                    <span className="text-xs text-slate-400 w-10 text-right">{pct}%</span>
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      </div>{/* end scrollable */}
    </div>
  );
}
