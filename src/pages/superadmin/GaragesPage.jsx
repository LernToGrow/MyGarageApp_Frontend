import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGarages, toggleGarageActive } from '../../api/admin.api';
import DataTable from '../../components/DataTable';
import locations from '../../data/locations.json';

const STATES = Object.keys(locations);

const planConfig = {
  free:       'bg-slate-100 text-slate-600',
  pro:        'bg-blue-50 text-blue-700',
  enterprise: 'bg-purple-50 text-purple-700',
};

export default function GaragesPage() {
  const [data, setData]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [search, setSearch]   = useState('');
  const [state, setState]     = useState('');
  const [district, setDistrict] = useState('');
  const [taluka, setTaluka]   = useState('');
  const [plan, setPlan]       = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const limit = 20;

  const districts = state ? Object.keys(locations[state] || {}) : [];
  const talukas   = state && district ? (locations[state]?.[district] || []) : [];
  const hasFilters = state || district || taluka || plan || isActive;

  const fetchData = () => {
    setLoading(true);
    const params = { page, limit };
    if (search)     params.search    = search;
    if (state)      params.state     = state;
    if (district)   params.district  = district;
    if (taluka)     params.taluka    = taluka;
    if (plan)       params.plan      = plan;
    if (isActive !== '') params.is_active = isActive;
    listGarages(params)
      .then(r => { setData(r.data); setTotal(r.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search, state, district, taluka, plan, isActive, page]);

  const handleStateChange    = val => { setState(val); setDistrict(''); setTaluka(''); setPage(1); };
  const handleDistrictChange = val => { setDistrict(val); setTaluka(''); setPage(1); };
  const clearFilters = () => { setState(''); setDistrict(''); setTaluka(''); setPlan(''); setIsActive(''); setPage(1); };

  const handleToggle = async (e, id) => {
    e.stopPropagation();
    await toggleGarageActive(id);
    fetchData();
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'name', header: 'Garage',
      cell: ({ getValue }) => (
        <span className="font-semibold text-slate-800">{getValue()}</span>
      ),
    },
    {
      id: 'location', header: 'Location',
      cell: ({ row }) => {
        const g = row.original;
        const parts = [g.taluka, g.district, g.state].filter(Boolean);
        const label = parts.length ? parts.join(', ') : (g.city || '—');
        return (
          <span className="flex items-center gap-1.5 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {label}
          </span>
        );
      },
    },
    {
      id: 'owner', header: 'Owner',
      cell: ({ row }) => {
        const name = row.original.owner_id?.name || '—';
        if (name === '—') return <span className="text-slate-300">—</span>;
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {name[0].toUpperCase()}
            </div>
            <span className="text-slate-700">{name}</span>
          </div>
        );
      },
    },
    {
      id: 'phone', header: 'Phone',
      cell: ({ row }) => {
        const phone = row.original.owner_id?.phone || row.original.phone;
        return <span className="text-slate-500 font-mono text-xs">{phone}</span>;
      },
    },
    {
      accessorKey: 'plan', header: 'Plan',
      cell: ({ getValue }) => {
        const val = getValue() || 'free';
        return (
          <span className={`capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold ${planConfig[val] || planConfig.free}`}>
            {val}
          </span>
        );
      },
    },
    {
      accessorKey: 'job_count', header: 'Jobs',
      cell: ({ getValue }) => <span className="font-medium text-slate-700">{getValue()}</span>,
    },
    {
      accessorKey: 'employee_count', header: 'Staff',
      cell: ({ getValue }) => <span className="font-medium text-slate-700">{getValue()}</span>,
    },
    {
      id: 'status', header: 'Status',
      cell: ({ row }) => {
        const active = row.original.is_active !== false;
        return (
          <button
            onClick={e => handleToggle(e, row.original._id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              active
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-400'}`} />
            {active ? 'Active' : 'Inactive'}
          </button>
        );
      },
    },
    {
      id: 'created', header: 'Joined',
      cell: ({ row }) => (
        <span className="text-slate-400 text-xs">
          {new Date(row.original.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
  ], []);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Garages</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} garage{total !== 1 ? 's' : ''} registered</p>
        </div>

        {/* Search */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          {
            value: state, onChange: handleStateChange,
            placeholder: 'All States',
            options: STATES.map(s => ({ value: s, label: s })),
            disabled: false,
          },
          {
            value: district, onChange: handleDistrictChange,
            placeholder: 'All Districts',
            options: districts.map(d => ({ value: d, label: d })),
            disabled: !state,
          },
          {
            value: taluka, onChange: val => { setTaluka(val); setPage(1); },
            placeholder: 'All Talukas',
            options: talukas.map(t => ({ value: t, label: t })),
            disabled: !district,
          },
          {
            value: plan, onChange: val => { setPlan(val); setPage(1); },
            placeholder: 'All Plans',
            options: [{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }, { value: 'enterprise', label: 'Enterprise' }],
            disabled: false,
          },
          {
            value: isActive, onChange: val => { setIsActive(val); setPage(1); },
            placeholder: 'All Status',
            options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }],
            disabled: false,
          },
        ].map((f, i) => (
          <div key={i} className="relative">
            <select
              value={f.value}
              onChange={e => f.onChange(e.target.value)}
              disabled={f.disabled}
              className={`appearance-none pr-8 pl-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm ${
                f.value
                  ? 'border-blue-300 bg-blue-50 text-blue-700 font-medium'
                  : 'border-slate-200 bg-white text-slate-600'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <option value="">{f.placeholder}</option>
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        ))}

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <svg className="animate-spin w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading garages…
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data}
            onRowClick={row => navigate(`/garages/${row._id}`)}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 text-xs">
              Showing {data.length} of {total} garages
            </span>
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
  );
}
