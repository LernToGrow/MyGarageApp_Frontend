import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { garageApi } from '../../api/garage.api';
import { useGarageAuthStore } from '../../store/garageAuthStore';
import { useT } from '../../hooks/useT';
import DateRangePicker from '../../components/DateRangePicker';
import FilterDropdown from '../../components/FilterDropdown';
import JobDetailPanel from './JobDetailPanel';
import ConfirmModal from '../../components/ConfirmModal';

const STATUS_COLORS = {
  received: '#6c757d', inspecting: '#0077b6', estimated: '#9c6644',
  in_progress: '#E85D04', done: '#2d6a4f', paid: '#1b4332',
};

const ALL_STATUSES = ['all', 'received', 'inspecting', 'estimated', 'in_progress', 'done', 'paid'];
const ACTIVE_STATUSES = ['received', 'inspecting', 'estimated', 'in_progress'];
const DONE_STATUSES = ['done', 'paid'];

function StatusBadge({ status, t }) {
  const color = STATUS_COLORS[status] ?? '#6c757d';
  const label = t(`jobs.status.${status}`);
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: color }}>
      {label !== `jobs.status.${status}` ? label : status?.replace('_', ' ')}
    </span>
  );
}

export default function JobsPage() {
  const location = useLocation();
  const initialFilter = location.state?.statusFilter ?? 'all';

  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialFilter);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const t = useT();
  const { user } = useGarageAuthStore();
  const isOwner = user?.role === 'garage_owner';

  const load = () => {
    setLoading(true);
    garageApi.listJobs().then(data => {
      const list = Array.isArray(data) ? data : (data.jobs ?? []);
      setJobs(list);
      setFiltered(list);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = jobs;
    if (status === 'active') list = list.filter(j => ACTIVE_STATUSES.includes(j.status));
    else if (status === 'done') list = list.filter(j => DONE_STATUSES.includes(j.status));
    else if (status !== 'all') list = list.filter(j => j.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(j =>
        j.job_number?.toString().includes(q) ||
        j.customer?.name?.toLowerCase().includes(q) ||
        j.bike?.plate_number?.toLowerCase().includes(q)
      );
    }
    if (dateFrom) list = list.filter(j => new Date(j.created_at) >= new Date(dateFrom));
    if (dateTo) list = list.filter(j => new Date(j.created_at) <= new Date(dateTo + 'T23:59:59'));
    if (assignedFilter !== 'all') list = list.filter(j => j.assigned_to?._id === assignedFilter);
    setFiltered(list);
    setPage(1);
  }, [jobs, search, status, dateFrom, dateTo, assignedFilter]);

  const handleDeleteConfirmed = async () => {
    const id = confirmId;
    setConfirmId(null);
    setDeleting(id);
    try {
      await garageApi.deleteJob(id);
      setJobs(prev => prev.filter(j => j._id !== id));
    } catch {
      // error silently — could add a toast here
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col p-6" style={{ background: '#f6f6f6', height: '100vh', overflow: 'hidden' }}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('jobs.title')}</h1>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm px-4 py-3 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder={t('jobs.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm w-56 focus:outline-none"
            onFocus={e => e.target.style.boxShadow = '0 0 0 2px #E85D0440'}
            onBlur={e => e.target.style.boxShadow = ''}
          />
        </div>
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onChange={({ from, to }) => { setDateFrom(from); setDateTo(to); }}
        />

        {/* Assigned-to filter */}
        {(() => {
          const employees = [...new Map(
            jobs.filter(j => j.assigned_to?._id).map(j => [j.assigned_to._id, j.assigned_to])
          ).values()];
          if (employees.length === 0) return null;
          return (
            <FilterDropdown
              label="Assigned To"
              value={assignedFilter}
              onChange={setAssignedFilter}
              options={[{ value: 'all', label: 'All Employees' }, ...employees.map(e => ({ value: e._id, label: e.name }))]}
              activeColor="#E85D04"
              activeBg="#FFF4EE"
            />
          );
        })()}

        <div className="w-px h-5 bg-gray-200" />

        {/* Status chips */}
        {['all', 'active', ...ALL_STATUSES.slice(1), 'done_group'].map(s => {
          const key = s === 'done_group' ? 'done' : s;
          const label =
            s === 'all'        ? t('jobs.all') :
            s === 'active'     ? t('dashboard.activeJobs') :
            s === 'done_group' ? `${t('jobs.status.done')} / ${t('jobs.status.paid')}` :
            (t(`jobs.status.${s}`) !== `jobs.status.${s}` ? t(`jobs.status.${s}`) : s.replace('_', ' '));
          const isActive = status === key;
          if (s === 'done' || s === 'paid') return null;
          return (
            <button
              key={s}
              onClick={() => setStatus(key)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
              style={isActive
                ? { background: '#E85D04', color: '#fff', borderColor: '#E85D04' }
                : { background: '#fff', color: '#555', borderColor: '#e0e0e0' }}
            >
              {label}
            </button>
          );
        })}

        {(search || status !== 'all' || assignedFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setStatus('all'); setAssignedFilter('all'); }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
            style={{ background: '#fff', color: '#c62828', borderColor: '#c62828' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff0f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
          >
            {t('common.cancel')}
          </button>
        )}
        <span className="ml-auto text-xs font-semibold text-gray-400">{filtered.length} {t('jobs.title')}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E85D04', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{t('jobs.noJobs')}</div>
        ) : (
          <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E85D04 #f0f0f0' }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                {[t('jobs.jobNumber'), t('common.name'), t('jobs.bike') || 'Bike', 'Status', 'Assigned To', t('common.date') || 'Date', 'Amount', ''].map((h, i) => (
                  <th key={i} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((job, idx) => (
                <tr
                  key={job._id}
                  className="transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid #f5f5f5', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FFF4EE'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
                  onClick={() => setDetailId(job._id)}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-gray-800">#{job.job_number}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-gray-700">{job.customer_id?.name ?? job.customer?.name ?? '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-gray-700 font-medium">{[job.bike_id?.make ?? job.bike?.make, job.bike_id?.model ?? job.bike?.model].filter(Boolean).join(' ') || '—'}</div>
                    <div className="text-xs text-gray-400">{job.bike_id?.plate_number ?? job.bike?.plate_number ?? ''}</div>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={job.status} t={t} /></td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{job.assigned_to?.name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{job.created_at ? new Date(job.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{job.total_amount ? `₹${job.total_amount.toLocaleString()}` : '—'}</td>
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    {isOwner && (
                      <button onClick={() => setConfirmId(job._id)} disabled={deleting === job._id}
                        className="px-3 py-1 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50"
                        style={{ color: '#c62828', borderColor: '#fca5a5', background: '#fff5f5' }}
                        onMouseEnter={e => { if (deleting !== job._id) e.currentTarget.style.background = '#fee2e2'; }}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff5f5'}
                      >
                        {deleting === job._id ? '…' : t('common.delete')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (() => {
        const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        return (
          <div className="flex items-center justify-between pt-3 shrink-0">
            <span className="text-xs text-gray-400">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-semibold transition-colors disabled:opacity-30"
                style={{ borderColor: '#e0e0e0', color: '#555' }}
              >‹</button>

              {pages.map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition-colors"
                  style={page === p
                    ? { background: '#E85D04', color: '#fff', borderColor: '#E85D04' }
                    : { background: '#fff', color: '#555', borderColor: '#e0e0e0' }}
                >{p}</button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-semibold transition-colors disabled:opacity-30"
                style={{ borderColor: '#e0e0e0', color: '#555' }}
              >›</button>
            </div>
          </div>
        );
      })()}

      {detailId && (
        <JobDetailPanel jobId={detailId} onClose={() => setDetailId(null)} />
      )}

      <ConfirmModal
        open={!!confirmId}
        title={t('common.delete') + ' Job'}
        message="All job data will be permanently removed."
        confirmLabel={t('common.delete')}
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
