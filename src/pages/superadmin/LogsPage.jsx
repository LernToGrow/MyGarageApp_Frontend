import { useEffect, useState } from 'react';
import { getLogs, listGarages } from '../../api/admin.api';

const ACTION_CONFIG = {
  garage_activated:       { color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  garage_deactivated:     { color: 'bg-red-50 text-red-600',         dot: 'bg-red-500' },
  user_activated:         { color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  user_deactivated:       { color: 'bg-red-50 text-red-600',         dot: 'bg-red-500' },
  plan_updated:           { color: 'bg-blue-50 text-blue-700',       dot: 'bg-blue-500' },
  password_reset_by_admin:{ color: 'bg-orange-50 text-orange-700',   dot: 'bg-orange-500' },
};

function formatMeta(meta) {
  if (!meta) return null;
  return Object.entries(meta).map(([k, v]) => (
    <span key={k} className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-mono">
      <span className="text-slate-400">{k}:</span>
      <span className="font-semibold">{String(v)}</span>
    </span>
  ));
}

export default function LogsPage() {
  const [logs, setLogs]               = useState([]);
  const [total, setTotal]             = useState(0);
  const [garages, setGarages]         = useState([]);
  const [garageFilter, setGarageFilter] = useState('');
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(true);
  const limit = 50;

  useEffect(() => { listGarages({ limit: 200 }).then(r => setGarages(r.data)); }, []);

  useEffect(() => {
    setLoading(true);
    getLogs({ garage_id: garageFilter || undefined, page, limit })
      .then(r => { setLogs(r.data); setTotal(r.total); })
      .finally(() => setLoading(false));
  }, [garageFilter, page]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">

      {/* Sticky header */}
      <div className="shrink-0 px-8 pt-6 pb-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activity Logs</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} total entries</p>
        </div>

        {/* Garage filter */}
        <div className="relative">
          <select
            value={garageFilter}
            onChange={e => { setGarageFilter(e.target.value); setPage(1); }}
            className={`appearance-none pl-3 pr-8 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 shadow-sm transition-all ${
              garageFilter ? 'border-blue-300 bg-blue-50 text-blue-700 font-medium' : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <option value="">All Garages</option>
            {garages.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <svg className="animate-spin w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading logs…
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    {['Time', 'Action', 'By', 'Garage', 'Details'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center text-slate-300">
                        <div className="flex flex-col items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-sm">No logs yet</span>
                        </div>
                      </td>
                    </tr>
                  ) : logs.map((log, i) => {
                    const cfg = ACTION_CONFIG[log.action] || { color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
                    return (
                      <tr key={log._id} className={`border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/60 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>

                        {/* Time */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-xs font-medium text-slate-700">
                            {new Date(log.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </td>

                        {/* Action badge */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* By */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {log.user_id?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-800">{log.user_id?.name || '—'}</div>
                              <div className="text-xs text-slate-400 capitalize">{log.user_id?.role?.replace('_', ' ')}</div>
                            </div>
                          </div>
                        </td>

                        {/* Garage */}
                        <td className="px-5 py-4">
                          {log.garage_id?.name
                            ? <span className="text-sm text-slate-700 font-medium">{log.garage_id.name}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>

                        {/* Details */}
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {formatMeta(log.meta) || <span className="text-slate-300 text-xs">—</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 text-xs">Showing {logs.length} of {total} entries</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-medium shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Previous
                </button>
                <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 font-medium shadow-sm">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page * limit >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-medium shadow-sm"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
