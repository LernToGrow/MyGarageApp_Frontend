import { useEffect, useState, useMemo } from 'react';
import { getInventoryAnalytics } from '../../api/admin.api';
import DataTable from '../../components/DataTable';

export default function InventoryPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInventoryAnalytics().then(setData).finally(() => setLoading(false));
  }, []);

  const lowStockCols = useMemo(() => [
    {
      accessorKey: 'name_en', header: 'Part',
      cell: ({ getValue }) => <span className="font-semibold text-slate-800">{getValue()}</span>,
    },
    {
      accessorKey: 'brand', header: 'Brand',
      cell: ({ getValue }) => getValue()
        ? <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{getValue()}</span>
        : <span className="text-slate-300">—</span>,
    },
    {
      id: 'garage', header: 'Garage',
      cell: ({ row }) => <span className="text-slate-700">{row.original.garage_id?.name || '—'}</span>,
    },
    {
      id: 'city', header: 'City',
      cell: ({ row }) => <span className="text-slate-400 text-xs">{row.original.garage_id?.city || '—'}</span>,
    },
    {
      accessorKey: 'quantity', header: 'Stock',
      cell: ({ getValue, row }) => {
        const low = getValue() <= row.original.min_quantity;
        return (
          <span className={`font-bold ${low ? 'text-red-600' : 'text-slate-700'}`}>{getValue()}</span>
        );
      },
    },
    {
      accessorKey: 'min_quantity', header: 'Min',
      cell: ({ getValue }) => <span className="text-slate-400 text-xs">{getValue()}</span>,
    },
    {
      accessorKey: 'sell_price', header: 'Price',
      cell: ({ getValue }) => <span className="font-semibold text-slate-800">₹{getValue()}</span>,
    },
  ], []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <svg className="animate-spin w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading inventory…
    </div>
  );
  if (!data) return <div className="p-8 text-red-500 text-sm">Failed to load</div>;


  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">

      {/* Sticky header */}
      <div className="shrink-0 px-8 pt-6 pb-4 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Monitor</h1>
            <p className="text-slate-400 text-sm mt-0.5">Cross-garage parts usage and stock alerts</p>
          </div>
          {data.low_stock_alerts.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-semibold text-red-600">{data.low_stock_alerts.length} low stock alert{data.low_stock_alerts.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

        {/* Most Used Parts */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Most Used Parts</h2>
              <p className="text-xs text-slate-400">Platform-wide consumption ranking</p>
            </div>
          </div>

          <div className="p-4 space-y-1">
            {data.most_used_parts.length === 0 ? (
              <div className="text-slate-300 text-sm py-8 text-center">No job data yet</div>
            ) : (
              data.most_used_parts.map((p, i) => {
                return (
                  <div key={i} className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                    {/* Rank */}
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0 ? 'bg-amber-100 text-amber-600' :
                      i === 1 ? 'bg-slate-200 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {i + 1}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{p._id}</div>
                    </div>

                    {/* Stats */}
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-800">{p.total_qty} <span className="text-xs font-normal text-slate-400">units</span></div>
                      <div className="text-xs text-slate-400">₹{p.total_value?.toLocaleString()} total</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              data.low_stock_alerts.length > 0 ? 'bg-red-50' : 'bg-emerald-50'
            }`}>
              {data.low_stock_alerts.length > 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-800">Low Stock Alerts</h2>
                {data.low_stock_alerts.length > 0 && (
                  <span className="bg-red-50 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-red-100">
                    {data.low_stock_alerts.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Parts below minimum threshold across all garages</p>
            </div>
          </div>

          {data.low_stock_alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">All garages have sufficient stock</span>
            </div>
          ) : (
            <DataTable columns={lowStockCols} data={data.low_stock_alerts} />
          )}
        </div>

      </div>
    </div>
  );
}
