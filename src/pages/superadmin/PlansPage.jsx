import { useEffect, useState } from 'react';
import { listGarages, updateGaragePlan } from '../../api/admin.api';

const PLAN_CONFIG = {
  free:       { badge: 'bg-slate-100 text-slate-600',           btn: 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600' },
  pro:        { badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',     btn: 'border-blue-500 text-blue-600 bg-blue-50' },
  enterprise: { badge: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200', btn: 'border-purple-500 text-purple-600 bg-purple-50' },
};

export default function PlansPage() {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});

  const fetchAll = () => {
    setLoading(true);
    listGarages({ limit: 100 }).then(r => setGarages(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handlePlanChange = async (id, plan) => {
    await updateGaragePlan(id, { plan });
    setGarages(gs => gs.map(g => g._id === id ? { ...g, plan } : g));
    setEditing(e => ({ ...e, [id]: false }));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <svg className="animate-spin w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading plans…
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">

      {/* Sticky header */}
      <div className="shrink-0 px-8 pt-6 pb-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Subscription Plans</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage subscription plans per garage</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {['free', 'pro', 'enterprise'].map(p => (
            <span key={p} className={`capitalize px-2.5 py-1 rounded-full font-semibold ${PLAN_CONFIG[p].badge}`}>{p}</span>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {['Garage', 'Owner', 'City', 'Current Plan', 'Expires', 'Change Plan'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {garages.map((g, i) => (
                <tr key={g._id} className={`border-b border-slate-50 last:border-0 transition-colors hover:bg-blue-50/30 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>

                  {/* Garage */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg, #E85D04, #f97316)' }}>
                        {g.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{g.name}</span>
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {g.owner_id?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-slate-600">{g.owner_id?.name || '—'}</span>
                    </div>
                  </td>

                  {/* City */}
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {g.city || '—'}
                    </span>
                  </td>

                  {/* Current Plan */}
                  <td className="px-5 py-4">
                    {g.plan ? (
                      <span className={`capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold ${PLAN_CONFIG[g.plan]?.badge || 'bg-slate-100 text-slate-600'}`}>
                        {g.plan}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Expires */}
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {g.plan_expires_at
                      ? new Date(g.plan_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : <span className="text-slate-300">—</span>}
                  </td>

                  {/* Change Plan */}
                  <td className="px-5 py-4">
                    {editing[g._id] ? (
                      <div className="flex items-center gap-1.5">
                        {['free', 'pro', 'enterprise'].map(p => (
                          <button
                            key={p}
                            onClick={() => handlePlanChange(g._id, p)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border transition-all ${
                              g.plan === p ? PLAN_CONFIG[p].btn : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          onClick={() => setEditing(e => ({ ...e, [g._id]: false }))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 transition-colors ml-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditing(e => ({ ...e, [g._id]: true }))}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Change
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
