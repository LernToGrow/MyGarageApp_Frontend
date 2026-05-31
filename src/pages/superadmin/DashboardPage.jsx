import { useEffect, useState } from 'react';
import { getStats } from '../../api/admin.api';
import StatCard from '../../components/StatCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function fmt(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
      <div className="text-slate-400 mb-0.5">{label}</div>
      <div className="font-bold text-blue-400">{payload[0].value} new garage{payload[0].value !== 1 ? 's' : ''}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-slate-400">
        <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading dashboard…
      </div>
    </div>
  );

  if (!stats) return (
    <div className="p-8 text-red-500 text-sm">Failed to load stats</div>
  );

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">Real-time stats across all garages</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Live
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Garages"
          value={stats.total_garages}
          sub={`${stats.active_garages} active · ${stats.inactive_garages} inactive`}
          color="blue"
        />
        <StatCard label="Total Users" value={stats.total_users} color="purple" />
        <StatCard label="Total Jobs" value={stats.total_jobs} color="orange" />
        <StatCard
          label="Platform Revenue"
          value={fmt(stats.total_revenue)}
          sub={`GST: ${fmt(stats.total_gst)}`}
          color="green"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">New Garages</h2>
            <p className="text-xs text-slate-400 mt-0.5">Signups over the last 30 days</p>
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Last 30 days</span>
        </div>

        <div className="p-6">
          {stats.signups_last_30_days.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm">No signup data yet</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.signups_last_30_days} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#blueGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
