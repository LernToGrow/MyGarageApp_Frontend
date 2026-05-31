import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getGarage, getGarageUsers, getGarageJobs,
  getGarageCustomers, getGarageParts, getGarageServices, updateGaragePlan,
} from '../../api/admin.api';
import DataTable from '../../components/DataTable';

const TABS = ['Overview', 'Users', 'Jobs', 'Customers', 'Inventory', 'Services'];

const STATUS_COLORS = {
  received:    'bg-slate-100 text-slate-600',
  inspecting:  'bg-yellow-50 text-yellow-700',
  estimated:   'bg-blue-50 text-blue-700',
  in_progress: 'bg-orange-50 text-orange-700',
  done:        'bg-green-50 text-green-700',
  paid:        'bg-emerald-50 text-emerald-700',
  closed:      'bg-slate-100 text-slate-400',
};

const STATUS_DOTS = {
  received:    'bg-slate-400',
  inspecting:  'bg-yellow-400',
  estimated:   'bg-blue-400',
  in_progress: 'bg-orange-400',
  done:        'bg-green-500',
  paid:        'bg-emerald-500',
  closed:      'bg-slate-300',
};

const planConfig = {
  free:       'bg-slate-100 text-slate-600',
  pro:        'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  enterprise: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
};

const STAT_ICONS = {
  Jobs: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Customers: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Employees: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Revenue: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const STAT_COLORS = {
  Jobs:      { icon: 'bg-orange-100 text-orange-600', value: 'text-orange-700' },
  Customers: { icon: 'bg-purple-100 text-purple-600', value: 'text-purple-700' },
  Employees: { icon: 'bg-blue-100 text-blue-600',     value: 'text-blue-700'   },
  Revenue:   { icon: 'bg-emerald-100 text-emerald-600', value: 'text-emerald-700' },
};

export default function GarageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab]           = useState('Overview');
  const [garage, setGarage]     = useState(null);
  const [users, setUsers]       = useState([]);
  const [jobs, setJobs]         = useState([]);
  const [customers, setCustomers] = useState([]);
  const [parts, setParts]       = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [planEdit, setPlanEdit] = useState(false);
  const [newPlan, setNewPlan]   = useState('');
  const [tabPage, setTabPage]   = useState({});

  const PAGE_SIZE = 10;
  const currentPage = tabPage[tab] || 1;
  const setCurrentPage = (p) => setTabPage(prev => ({ ...prev, [tab]: p }));

  const paginate = (arr) => arr.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = (arr) => Math.ceil(arr.length / PAGE_SIZE) || 1;

  useEffect(() => {
    getGarage(id).then(g => { setGarage(g); setNewPlan(g.plan); }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (tab === 'Users')     getGarageUsers(id).then(setUsers);
    if (tab === 'Jobs')      getGarageJobs(id).then(r => setJobs(r.data));
    if (tab === 'Customers') getGarageCustomers(id).then(setCustomers);
    if (tab === 'Inventory') getGarageParts(id).then(setParts);
    if (tab === 'Services')  getGarageServices(id).then(setServices);
  }, [tab, id]);

  const savePlan = async () => {
    await updateGaragePlan(id, { plan: newPlan });
    setGarage(g => ({ ...g, plan: newPlan }));
    setPlanEdit(false);
  };

  const userCols = useMemo(() => [
    {
      accessorKey: 'name', header: 'Name',
      cell: ({ getValue }) => {
        const name = getValue();
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="font-medium text-slate-800">{name}</span>
          </div>
        );
      },
    },
    { accessorKey: 'phone', header: 'Phone', cell: ({ getValue }) => <span className="font-mono text-xs text-slate-500">{getValue()}</span> },
    {
      accessorKey: 'role', header: 'Role',
      cell: ({ getValue }) => (
        <span className="capitalize bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {getValue().replace('_', ' ')}
        </span>
      ),
    },
    {
      id: 'status', header: 'Status',
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          row.original.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.original.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
          {row.original.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ], []);

  const jobCols = useMemo(() => [
    {
      accessorKey: 'job_number', header: 'Job #',
      cell: ({ getValue }) => <span className="font-mono text-xs font-semibold text-slate-700">{getValue()}</span>,
    },
    { id: 'customer', header: 'Customer', cell: ({ row }) => row.original.customer_id?.name || <span className="text-slate-300">—</span> },
    {
      id: 'assigned', header: 'Mechanic',
      cell: ({ row }) => row.original.assigned_to?.name
        ? <span className="text-slate-700">{row.original.assigned_to.name}</span>
        : <span className="text-slate-300 text-xs">Unassigned</span>,
    },
    {
      id: 'status', header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[s] || 'bg-slate-100 text-slate-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOTS[s] || 'bg-slate-400'}`} />
            {s?.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      accessorKey: 'total_amount', header: 'Amount',
      cell: ({ getValue }) => <span className="font-semibold text-slate-800">₹{(getValue() || 0).toLocaleString()}</span>,
    },
    {
      id: 'date', header: 'Date',
      cell: ({ row }) => <span className="text-xs text-slate-400">{new Date(row.original.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>,
    },
  ], []);

  const custCols = useMemo(() => [
    {
      accessorKey: 'name', header: 'Name',
      cell: ({ getValue }) => {
        const name = getValue();
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="font-medium text-slate-800">{name}</span>
          </div>
        );
      },
    },
    { accessorKey: 'phone', header: 'Phone', cell: ({ getValue }) => <span className="font-mono text-xs text-slate-500">{getValue()}</span> },
    { accessorKey: 'address', header: 'Address', cell: ({ getValue }) => <span className="text-slate-500 text-xs">{getValue() || '—'}</span> },
    {
      id: 'bikes', header: 'Bikes',
      cell: ({ row }) => (
        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
          {row.original.bikes?.length || 0}
        </span>
      ),
    },
  ], []);

  const serviceCols = useMemo(() => [
    { accessorKey: 'name', header: 'Service Name', cell: ({ getValue }) => <span className="font-medium text-slate-800">{getValue()}</span> },
    { accessorKey: 'category', header: 'Category', cell: ({ getValue }) => getValue()
      ? <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{getValue()}</span>
      : <span className="text-slate-300">—</span>
    },
    { accessorKey: 'default_charge', header: 'Charge', cell: ({ getValue }) => <span className="font-semibold text-slate-800">₹{getValue()}</span> },
    {
      id: 'status', header: 'Status',
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          row.original.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.original.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
          {row.original.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { id: 'created', header: 'Added', cell: ({ row }) => <span className="text-xs text-slate-400">{new Date(row.original.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span> },
  ], []);

  const partCols = useMemo(() => [
    { accessorKey: 'name_en', header: 'Part Name', cell: ({ getValue }) => <span className="font-medium text-slate-800">{getValue()}</span> },
    { accessorKey: 'brand', header: 'Brand', cell: ({ getValue }) => <span className="text-slate-500">{getValue() || '—'}</span> },
    { accessorKey: 'category', header: 'Category', cell: ({ getValue }) => getValue()
      ? <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{getValue()}</span>
      : <span className="text-slate-300">—</span>
    },
    { accessorKey: 'quantity', header: 'Stock', cell: ({ getValue }) => <span className="font-semibold text-slate-700">{getValue()}</span> },
    { accessorKey: 'min_quantity', header: 'Min', cell: ({ getValue }) => <span className="text-slate-400 text-xs">{getValue()}</span> },
    { accessorKey: 'sell_price', header: 'Price', cell: ({ getValue }) => <span className="font-semibold text-slate-800">₹{getValue()}</span> },
    {
      id: 'stock_status', header: 'Alert',
      cell: ({ row }) => row.original.quantity <= row.original.min_quantity
        ? <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Low Stock</span>
        : <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-xs font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />OK</span>,
    },
  ], []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <svg className="animate-spin w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading garage…
    </div>
  );
  if (!garage) return <div className="p-8 text-red-500 text-sm">Garage not found</div>;

  const location = [garage.taluka, garage.district, garage.state].filter(Boolean).join(', ') || garage.city || '—';
  const initials = garage.name?.slice(0, 2).toUpperCase() || 'GA';

  const stats = [
    { key: 'Jobs',      value: garage.job_count },
    { key: 'Customers', value: garage.customer_count },
    { key: 'Employees', value: garage.employee_count },
    { key: 'Revenue',   value: `₹${(garage.total_revenue || 0).toLocaleString()}` },
  ];

  const TabPagination = ({ data }) => {
    const tp = totalPages(data);
    if (tp <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="text-slate-400">
          Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, data.length)}–{Math.min(currentPage * PAGE_SIZE, data.length)} of {data.length}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium">{currentPage} / {tp}</span>
          <button
            disabled={currentPage >= tp}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Sticky top section */}
      <div className="shrink-0 px-8 pt-6 pb-4 space-y-4 bg-slate-50">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4">
        {/* Back */}
        <button
          onClick={() => navigate('/garages')}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-100 shrink-0" />

        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: 'linear-gradient(135deg, #E85D04, #f97316)' }}>
          {initials}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-bold text-slate-900 truncate">{garage.name}</h1>
            <span className={`capitalize px-2 py-0.5 rounded-full text-xs font-semibold ${planConfig[garage.plan] || planConfig.free}`}>
              {garage.plan || 'free'}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              garage.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${garage.is_active !== false ? 'bg-emerald-500' : 'bg-red-400'}`} />
              {garage.is_active !== false ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {garage.phone}
            </span>
          </div>
        </div>

        {/* Owner */}
        <div className="shrink-0 flex items-center gap-2 border-l border-slate-100 pl-4">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold">
            {garage.owner_id?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="text-xs text-slate-400 leading-none">Owner</div>
            <div className="text-sm font-semibold text-slate-800 leading-tight mt-0.5">{garage.owner_id?.name || '—'}</div>
          </div>
        </div>

        {/* Plan edit */}
        <div className="shrink-0 border-l border-slate-100 pl-4">
          {planEdit ? (
            <div className="flex items-center gap-1.5">
              <select
                value={newPlan}
                onChange={e => setNewPlan(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <button onClick={savePlan} title="Save" className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button onClick={() => setPlanEdit(false)} title="Cancel" className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setPlanEdit(true)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Change plan
            </button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ key, value }) => {
          const c = STAT_COLORS[key];
          return (
            <div key={key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
                {STAT_ICONS[key]}
              </div>
              <div>
                <div className={`text-2xl font-extrabold leading-none ${c.value}`}>{value}</div>
                <div className="text-xs text-slate-400 mt-1">{key}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      </div>{/* end sticky top */}

      {/* Scrollable tab content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {tab === 'Overview' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-5">Garage Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-sm">
              <InfoRow label="Address"       value={garage.address || '—'} />
              <InfoRow label="State"         value={garage.state || '—'} />
              <InfoRow label="District"      value={garage.district || '—'} />
              <InfoRow label="Taluka"        value={garage.taluka || '—'} />
              <InfoRow label="City"          value={garage.city || '—'} />
              <InfoRow label="Pincode"       value={garage.pincode || '—'} />
              <InfoRow label="GSTIN"         value={garage.gstin || '—'} />
              <InfoRow label="Language"      value={garage.language || '—'} />
              <InfoRow label="GST Collected" value={`₹${(garage.total_gst || 0).toLocaleString()}`} highlight />
              <InfoRow label="Joined"        value={new Date(garage.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
            </div>
          </div>
        )}
        {tab === 'Users' && (<>
          <DataTable columns={userCols} data={paginate(users)} />
          <TabPagination data={users} />
        </>)}
        {tab === 'Jobs' && (<>
          <DataTable columns={jobCols} data={paginate(jobs)} />
          <TabPagination data={jobs} />
        </>)}
        {tab === 'Customers' && (<>
          <DataTable columns={custCols} data={paginate(customers)} />
          <TabPagination data={customers} />
        </>)}
        {tab === 'Inventory' && (<>
          <DataTable columns={partCols} data={paginate(parts)} />
          <TabPagination data={parts} />
        </>)}
        {tab === 'Services' && (<>
          <DataTable columns={serviceCols} data={paginate(services)} />
          <TabPagination data={services} />
        </>)}
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <span className="w-32 text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm ${highlight ? 'font-semibold text-emerald-700' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
}
