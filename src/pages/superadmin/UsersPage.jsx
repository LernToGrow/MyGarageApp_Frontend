import { useEffect, useState, useMemo } from 'react';
import { listUsers, toggleUserActive, resetUserPassword } from '../../api/admin.api';
import DataTable from '../../components/DataTable';

export default function UsersPage() {
  const [data, setData]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [role, setRole]         = useState('');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [resetModal, setResetModal] = useState(null);
  const [newPwd, setNewPwd]     = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const limit = 20;

  const fetchData = () => {
    setLoading(true);
    listUsers({ role, search, page, limit })
      .then(r => { setData(r.data); setTotal(r.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [role, search, page]);

  const handleToggle = async (id) => { await toggleUserActive(id); fetchData(); };

  const handleReset = async () => {
    if (!newPwd || newPwd.length < 6) return alert('Min 6 characters');
    await resetUserPassword(resetModal._id, newPwd);
    setResetModal(null);
    setNewPwd('');
    alert('Password reset successfully');
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'name', header: 'Name',
      cell: ({ getValue }) => {
        const name = getValue();
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="font-semibold text-slate-800">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'phone', header: 'Phone',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-500">{getValue()}</span>,
    },
    {
      id: 'role', header: 'Role',
      cell: ({ row }) => {
        const isOwner = row.original.role === 'garage_owner';
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
            isOwner ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {isOwner ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            )}
            {row.original.role.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      id: 'garage', header: 'Garage',
      cell: ({ row }) => {
        const name = row.original.garage_id?.name;
        return name
          ? <span className="text-slate-700 text-sm">{name}</span>
          : <span className="text-slate-300">—</span>;
      },
    },
    {
      id: 'status', header: 'Status',
      cell: ({ row }) => (
        <button
          onClick={() => handleToggle(row.original._id)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
            row.original.is_active
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${row.original.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
          {row.original.is_active ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      id: 'joined', header: 'Joined',
      cell: ({ row }) => (
        <span className="text-xs text-slate-400">
          {new Date(row.original.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => setResetModal(row.original)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Reset pwd
        </button>
      ),
    },
  ], []);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} user{total !== 1 ? 's' : ''} registered</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Role filter */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {[['', 'All'], ['garage_owner', 'Owners'], ['employee', 'Employees']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setRole(val); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  role === val ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search name / phone…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <svg className="animate-spin w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading users…
        </div>
      ) : (
        <DataTable columns={columns} data={data} />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400 text-xs">Showing {data.length} of {total} users</span>
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

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">Reset Password</h2>
                  <p className="text-xs text-slate-400">{resetModal.name}</p>
                </div>
              </div>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="New password (min 6 characters)"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => { setResetModal(null); setNewPwd(''); setShowPwd(false); }}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
