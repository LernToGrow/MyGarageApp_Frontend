import { useEffect, useState } from 'react';
import { garageApi } from '../../api/garage.api';
import { useT } from '../../hooks/useT';

const EMPTY_SVC  = { name: '', category: '', default_charge: '' };
const PAGE_SIZE  = 12;

const CATEGORY_COLORS = {
  Body:       { bg: '#fff0e6', color: '#c44e00' },
  Electrical: { bg: '#e8f4fb', color: '#0077b6' },
  Electric:   { bg: '#e8f4fb', color: '#0077b6' },
  Engine:     { bg: '#fff5f5', color: '#c62828' },
  Brakes:     { bg: '#f0faf4', color: '#2d6a4f' },
  Premium:    { bg: '#f5f0ff', color: '#6d28d9' },
  General:    { bg: '#f5f5f5', color: '#555' },
  Cleaning:   { bg: '#e6f7ff', color: '#0369a1' },
  Wheels:     { bg: '#fef9c3', color: '#92400e' },
  Service:    { bg: '#f0fdf4', color: '#166534' },
};
const defaultCat = { bg: '#f5f5f5', color: '#555' };

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY_SVC);
  const [saving, setSaving]     = useState(false);
  const [page, setPage]         = useState(1);
  const t = useT();

  const load = () => {
    setLoading(true);
    garageApi.listServices()
      .then(data => setServices(Array.isArray(data) ? data : (data.services ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(EMPTY_SVC); setModal({ mode: 'add' }); };
  const openEdit = (svc) => {
    setForm({ name: svc.name ?? '', category: svc.category ?? '', default_charge: svc.default_charge ?? '' });
    setModal({ mode: 'edit', svc });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, category: form.category, default_charge: Number(form.default_charge) };
      if (modal.mode === 'add') await garageApi.createService(payload);
      else await garageApi.updateService(modal.svc._id, payload);
      setModal(null); load();
    } catch (err) {
      alert(err.response?.data?.message || t('services.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const q        = search.toLowerCase();
  const filtered = services.filter(s =>
    !q ||
    (s.name ?? '').toLowerCase().includes(q) ||
    (s.category ?? '').toLowerCase().includes(q)
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };

  return (
    <div className="flex flex-col p-6" style={{ background: '#f6f6f6', height: '100vh', overflow: 'hidden' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">{t('services.title')}</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: '#E85D04' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {t('services.addService')}
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-xl shadow-sm px-4 py-3 mb-4 flex items-center gap-3 shrink-0">
        <div className="relative flex-1 max-w-xs">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search services or category…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none"
            onFocus={e => e.target.style.boxShadow = '0 0 0 2px #E85D0440'}
            onBlur={e => e.target.style.boxShadow = ''}
          />
        </div>
        <span className="ml-auto text-xs font-semibold text-gray-400">{filtered.length} services</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E85D04', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{t('services.empty')}</div>
        ) : (
          <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E85D04 #f0f0f0' }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                  {[t('services.serviceName'), t('inventory.category'), t('services.defaultCharge'), ''].map((h, i) => (
                    <th key={i} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((svc, idx) => {
                  const catStyle = CATEGORY_COLORS[svc.category] ?? defaultCat;
                  return (
                    <tr
                      key={svc._id}
                      style={{ borderBottom: '1px solid #f5f5f5', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FFF4EE'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
                    >
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{svc.name}</td>
                      <td className="px-5 py-3.5">
                        {svc.category
                          ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: catStyle.bg, color: catStyle.color }}>{svc.category}</span>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3.5 font-extrabold" style={{ color: '#E85D04' }}>
                        ₹{(svc.default_charge ?? 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => openEdit(svc)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold border transition-colors"
                          style={{ color: '#E85D04', borderColor: '#fcd9b8', background: '#FFF4EE' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#ffe3cf'}
                          onMouseLeave={e => e.currentTarget.style.background = '#FFF4EE'}
                        >
                          {t('services.editService')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
                className="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold"
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 max-w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">
                {modal.mode === 'add' ? t('services.addService') : t('services.editService')}
              </h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('services.serviceName')}</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                  placeholder={t('services.namePlaceholder')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  onFocus={e => e.target.style.boxShadow = '0 0 0 2px #E85D0440'} onBlur={e => e.target.style.boxShadow = ''} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('inventory.category')}</label>
                <input type="text" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  placeholder={t('services.categoryPlaceholder')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  onFocus={e => e.target.style.boxShadow = '0 0 0 2px #E85D0440'} onBlur={e => e.target.style.boxShadow = ''} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('services.defaultCharge')}</label>
                <input type="number" value={form.default_charge} onChange={e => setForm(p => ({ ...p, default_charge: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  onFocus={e => e.target.style.boxShadow = '0 0 0 2px #E85D0440'} onBlur={e => e.target.style.boxShadow = ''} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                  style={{ background: '#E85D04' }}>
                  {saving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
