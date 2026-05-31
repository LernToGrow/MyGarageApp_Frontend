import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { garageApi } from '../../api/garage.api';
import { useT } from '../../hooks/useT';
import DateRangePicker from '../../components/DateRangePicker';
import FilterDropdown from '../../components/FilterDropdown';

function fmt(n) {
  if (n == null) return '—';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString()}`;
}

const STATUS_COLORS = { paid: '#2d6a4f', partial: '#E85D04', pending: '#c62828' };
const STATUS_BG     = { paid: '#f0faf4', partial: '#FFF4EE', pending: '#fff5f5' };
const PAGE_SIZE = 10;

export default function PaymentsPage() {
  const location = useLocation();
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [mode, setMode]         = useState('all');
  const [status, setStatus]     = useState(location.state?.statusFilter ?? 'all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [search, setSearch]     = useState('');
  const [collectedBy, setCollectedBy] = useState('all');
  const [selected, setSelected] = useState(null);
  const [page, setPage]         = useState(1);
  const [remitting, setRemitting] = useState(null);
  const t = useT();

  const MODE_OPTS   = ['all', 'cash', 'online'];
  const STATUS_OPTS = ['all', 'paid', 'partial', 'pending'];

  useEffect(() => {
    garageApi.getDashboardPayments().then(data => {
      const list = Array.isArray(data) ? data : (data.payments ?? []);
      setPayments(list); setFiltered(list);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = payments;
    if (mode !== 'all') list = list.filter(p => p.payment_mode === mode);
    if (status === 'pending_dues') list = list.filter(p => p.payment_status === 'pending' || p.payment_status === 'partial');
    else if (status !== 'all') list = list.filter(p => p.payment_status === status);
    if (dateFrom) list = list.filter(p => new Date(p.created_at) >= new Date(dateFrom));
    if (dateTo)   list = list.filter(p => new Date(p.created_at) <= new Date(dateTo + 'T23:59:59'));
    if (collectedBy !== 'all') list = list.filter(p => p.collected_by?._id === collectedBy);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.job_number?.toString().includes(q) ||
        (p.customer_id?.name ?? p.customer?.name ?? '').toLowerCase().includes(q)
      );
    }
    setFiltered(list);
    setPage(1);
  }, [payments, mode, status, dateFrom, dateTo, search, collectedBy]);

  const modeLabel   = (m) => m === 'all' ? t('common.all') : m === 'cash' ? t('payment.cash') : t('payment.online');
  const statusLabel = (s) => s === 'all' ? t('common.all') : s === 'paid' ? t('payments.paid') : s === 'partial' ? t('payment.partialPayment') : t('payment.unpaid');

  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  async function handleRemit(id) {
    setRemitting(id);
    try {
      const data = await garageApi.remitPayment(id);
      const updated = data.job;
      setPayments(prev => prev.map(p => p._id === id ? { ...p, remitted_to_admin: true, remitted_at: updated.remitted_at } : p));
      if (selected?._id === id) setSelected(s => ({ ...s, remitted_to_admin: true, remitted_at: updated.remitted_at }));
    } catch {}
    setRemitting(null);
  }

  return (
    <div className="flex flex-col p-6" style={{ background: '#f6f6f6', height: '100vh', overflow: 'hidden' }}>
      <h1 className="text-2xl font-bold text-gray-900 mb-5">{t('payments.title')}</h1>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm px-4 py-3 mb-4 flex flex-wrap gap-3 items-center shrink-0">
        {/* Search */}
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder={t('jobs.searchPlaceholder')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm w-52 focus:outline-none"
            onFocus={e => e.target.style.boxShadow = '0 0 0 2px #E85D0440'}
            onBlur={e => e.target.style.boxShadow = ''}
          />
        </div>

        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onChange={({ from, to }) => { setDateFrom(from); setDateTo(to); }}
        />

        {/* Collected-by dropdown */}
        {(() => {
          const employees = [...new Map(
            payments.filter(p => p.collected_by?._id).map(p => [p.collected_by._id, p.collected_by])
          ).values()];
          if (employees.length === 0) return null;
          return (
            <FilterDropdown
              label="Collected By"
              value={collectedBy}
              onChange={setCollectedBy}
              options={[{ value: 'all', label: 'All Employees' }, ...employees.map(e => ({ value: e._id, label: e.name }))]}
              activeColor="#2d6a4f"
              activeBg="#f0faf4"
            />
          );
        })()}

        <div className="w-px h-5 bg-gray-200" />

        {/* Status chips */}
        <div className="flex gap-1 flex-wrap">
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
              style={status === s
                ? { background: STATUS_COLORS[s] ?? '#111', color: '#fff', borderColor: STATUS_COLORS[s] ?? '#111' }
                : { background: '#fff', color: '#555', borderColor: '#e0e0e0' }}>
              {statusLabel(s)}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-200" />

        {/* Mode chips */}
        <div className="flex gap-1">
          {MODE_OPTS.map(m => (
            <button key={m} onClick={() => setMode(m)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
              style={mode === m
                ? { background: '#E85D04', color: '#fff', borderColor: '#E85D04' }
                : { background: '#fff', color: '#555', borderColor: '#e0e0e0' }}>
              {modeLabel(m)}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs font-semibold text-gray-400">{filtered.length} {t('payments.title').toLowerCase()}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E85D04', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{t('payments.noPayments')}</div>
        ) : (
          <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E85D04 #f0f0f0' }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                  {[t('jobs.jobNumber'), t('common.name'), t('payments.mode'), t('payments.totalBill'), t('payments.paid'), t('payments.balanceDue'), 'Status', 'Collected By', 'Admin Received', ''].map((h, i) => (
                    <th key={i} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((p, idx) => (
                  <tr
                    key={p._id}
                    style={{ borderBottom: '1px solid #f5f5f5', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFF4EE'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
                  >
                    <td className="px-5 py-3.5 font-bold text-gray-800">#{p.job_number ?? '—'}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-700">{p.customer_id?.name ?? p.customer?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500 capitalize">{p.payment_mode ?? '—'}</td>
                    <td className="px-5 py-3.5 text-gray-800 font-medium">{fmt(p.total_amount)}</td>
                    <td className="px-5 py-3.5 font-semibold" style={{ color: '#2d6a4f' }}>{fmt(p.amount_paid)}</td>
                    <td className="px-5 py-3.5 font-semibold" style={{ color: p.balance_due > 0 ? '#c62828' : '#2d6a4f' }}>{fmt(p.balance_due)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: STATUS_BG[p.payment_status]     ?? '#f5f5f5',
                          color:      STATUS_COLORS[p.payment_status]  ?? '#6c757d',
                        }}
                      >
                        {statusLabel(p.payment_status ?? 'pending')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{p.collected_by?.name ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      {p.remitted_to_admin ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#f0faf4', color: '#2d6a4f' }}>✓ Received</span>
                      ) : p.amount_paid > 0 ? (
                        <button
                          onClick={() => handleRemit(p._id)}
                          disabled={remitting === p._id}
                          className="px-2.5 py-1 rounded-full text-xs font-bold border transition-colors"
                          style={{ background: '#FFF4EE', color: '#E85D04', borderColor: '#fcd9b8' }}
                        >
                          {remitting === p._id ? '...' : 'Mark Received'}
                        </button>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelected(p)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold border transition-colors"
                        style={{ color: '#E85D04', borderColor: '#fcd9b8', background: '#FFF4EE' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#ffe3cf'}
                        onMouseLeave={e => e.currentTarget.style.background = '#FFF4EE'}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 shrink-0">
          <span className="text-xs text-gray-400">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-semibold disabled:opacity-30"
              style={{ borderColor: '#e0e0e0', color: '#555' }}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition-colors"
                style={page === p
                  ? { background: '#E85D04', color: '#fff', borderColor: '#E85D04' }
                  : { background: '#fff', color: '#555', borderColor: '#e0e0e0' }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-semibold disabled:opacity-30"
              style={{ borderColor: '#e0e0e0', color: '#555' }}>›</button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96 max-w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-lg font-extrabold text-gray-900">#{selected.job_number ?? '—'}</div>
                <span
                  className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: STATUS_BG[selected.payment_status], color: STATUS_COLORS[selected.payment_status] }}
                >
                  {statusLabel(selected.payment_status ?? 'pending')}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-xl">×</button>
            </div>

            <div className="space-y-0 divide-y divide-gray-100 text-sm mb-5">
              {[
                { label: t('common.name'),         value: selected.customer_id?.name ?? selected.customer?.name ?? '—' },
                { label: t('payments.mode'),        value: selected.payment_mode ?? '—', capitalize: true },
                { label: t('payments.totalBill'),   value: fmt(selected.total_amount) },
                { label: t('payments.paid'),        value: fmt(selected.amount_paid), color: '#2d6a4f' },
                { label: t('payments.balanceDue'),  value: fmt(selected.balance_due), color: selected.balance_due > 0 ? '#c62828' : '#2d6a4f' },
                { label: 'Collected By',  value: selected.collected_by?.name ?? '—' },
                { label: 'Admin Received', value: selected.remitted_to_admin
                    ? new Date(selected.remitted_at).toLocaleDateString()
                    : 'Pending',
                  color: selected.remitted_to_admin ? '#2d6a4f' : '#E85D04' },
              ].map(({ label, value, color, capitalize }) => (
                <div key={label} className="flex justify-between items-center py-2.5">
                  <span className="text-gray-500">{label}</span>
                  <span className={`font-semibold ${capitalize ? 'capitalize' : ''}`} style={{ color: color ?? '#111' }}>{value}</span>
                </div>
              ))}
            </div>

            {!selected.remitted_to_admin && selected.amount_paid > 0 && (
              <button
                onClick={() => handleRemit(selected._id)}
                disabled={remitting === selected._id}
                className="w-full py-2.5 rounded-xl font-semibold text-sm mb-2 border"
                style={{ background: '#FFF4EE', color: '#E85D04', borderColor: '#fcd9b8' }}
              >
                {remitting === selected._id ? '...' : '✓ Mark Cash Received'}
              </button>
            )}
            <button onClick={() => setSelected(null)} className="w-full py-2.5 rounded-xl text-white font-semibold text-sm" style={{ background: '#E85D04' }}>
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
