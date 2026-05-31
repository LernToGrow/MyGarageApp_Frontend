import { useEffect, useState } from 'react';
import { garageApi } from '../../api/garage.api';
import { useT } from '../../hooks/useT';

const EMPTY_PART = { name_en: '', brand: '', category: '', sku: '', sell_price: '', buy_price: '', quantity: '', min_quantity: '', vendor_name: '', vendor_phone: '' };
const PAGE_SIZE = 12;

export default function InventoryPage() {
  const [parts, setParts]         = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(EMPTY_PART);
  const [saving, setSaving]       = useState(false);
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [page, setPage]           = useState(1);
  const t = useT();

  const load = () => {
    setLoading(true);
    garageApi.listParts()
      .then(data => setParts(Array.isArray(data) ? data : (data.parts ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(EMPTY_PART); setModal({ mode: 'add' }); };
  const openEdit = (part) => {
    setForm({ name_en: part.name_en ?? '', brand: part.brand ?? '', category: part.category ?? '', sku: part.sku ?? '', sell_price: part.sell_price ?? '', buy_price: part.buy_price ?? '', quantity: part.quantity ?? '', min_quantity: part.min_quantity ?? '', vendor_name: part.vendor_name ?? '', vendor_phone: part.vendor_phone ?? '' });
    setModal({ mode: 'edit', part });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name_en: form.name_en, brand: form.brand, category: form.category, sku: form.sku, sell_price: Number(form.sell_price), buy_price: Number(form.buy_price), quantity: Number(form.quantity), min_quantity: Number(form.min_quantity), vendor_name: form.vendor_name, vendor_phone: form.vendor_phone };
      if (modal.mode === 'add') await garageApi.createPart(payload);
      else await garageApi.updatePart(modal.part._id, payload);
      setModal(null); load();
    } catch (err) {
      alert(err.response?.data?.message || t('inventory.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleRestock = async (id) => {
    const qty = Number(restockQty);
    if (!qty || qty <= 0) return;
    try {
      await garageApi.adjustStock(id, { adjustment: qty });
      setRestockId(null); setRestockQty(''); load();
    } catch (err) {
      alert(err.response?.data?.message || t('common.error'));
    }
  };

  const ALL_FIELDS = [
    { key: 'name_en',      label: t('inventory.partName'),   type: 'text',   required: true },
    { key: 'brand',        label: t('inventory.brand'),      type: 'text' },
    { key: 'category',     label: t('inventory.category'),   type: 'text' },
    { key: 'sku',          label: t('inventory.sku'),        type: 'text' },
    { key: 'sell_price',   label: t('inventory.sellPrice'),  type: 'number' },
    { key: 'buy_price',    label: t('inventory.buyPrice'),   type: 'number' },
    { key: 'quantity',     label: t('inventory.quantity'),   type: 'number' },
    { key: 'min_quantity', label: t('inventory.minQty'),     type: 'number' },
    { key: 'vendor_name',  label: t('inventory.vendorName'), type: 'text' },
    { key: 'vendor_phone', label: t('inventory.vendorPhone'),type: 'tel' },
  ];
  const FIELDS = modal?.mode === 'edit'
    ? ALL_FIELDS.filter(f => f.key !== 'quantity')
    : ALL_FIELDS;

  const q        = search.toLowerCase();
  const filtered = parts.filter(p =>
    !q ||
    (p.name_en ?? p.name ?? '').toLowerCase().includes(q) ||
    (p.brand ?? '').toLowerCase().includes(q) ||
    (p.category ?? '').toLowerCase().includes(q)
  );
  const lowStock   = filtered.filter(p => p.quantity <= (p.min_quantity ?? 0));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };

  return (
    <div className="flex flex-col p-6" style={{ background: '#f6f6f6', height: '100vh', overflow: 'hidden' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('inventory.title')}</h1>
          {lowStock.length > 0 && (
            <p className="text-xs font-semibold mt-0.5" style={{ color: '#c62828' }}>
              ⚠ {lowStock.length} {t('inventory.low')} stock item{lowStock.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: '#E85D04' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {t('inventory.addPart')}
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
            placeholder={`Search parts, brand, category…`}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none"
            onFocus={e => e.target.style.boxShadow = '0 0 0 2px #E85D0440'}
            onBlur={e => e.target.style.boxShadow = ''}
          />
        </div>
        <span className="ml-auto text-xs font-semibold text-gray-400">{filtered.length} parts</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E85D04', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{t('inventory.noPartsYet')}</div>
        ) : (
          <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E85D04 #f0f0f0' }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                  {[t('inventory.partName'), t('inventory.brand'), t('inventory.category'), t('inventory.quantity'), `${t('inventory.sellPrice')} ₹`, `${t('inventory.buyPrice')} ₹`, ''].map((h, i) => (
                    <th key={i} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((part, idx) => {
                  const isLow = part.quantity <= (part.min_quantity ?? 0);
                  return (
                    <tr
                      key={part._id}
                      style={{ borderBottom: '1px solid #f5f5f5', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FFF4EE'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{part.name_en ?? part.name}</span>
                          {isLow && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: '#c62828' }}>
                              {t('inventory.low')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{part.brand ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        {part.category
                          ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#f0f0f0', color: '#555' }}>{part.category}</span>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {restockId === part._id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={restockQty}
                              onChange={e => setRestockQty(e.target.value)}
                              placeholder="+qty"
                              className="w-16 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                              onFocus={e => e.target.style.boxShadow = '0 0 0 2px #E85D0440'}
                              onBlur={e => e.target.style.boxShadow = ''}
                            />
                            <button onClick={() => handleRestock(part._id)} className="text-xs font-bold" style={{ color: '#2d6a4f' }}>✓</button>
                            <button onClick={() => setRestockId(null)} className="text-xs text-gray-400">✕</button>
                          </div>
                        ) : (
                          <span
                            className="font-bold cursor-pointer px-2 py-0.5 rounded-lg"
                            style={{
                              color: isLow ? '#c62828' : '#333',
                              background: isLow ? '#fff5f5' : 'transparent',
                            }}
                            onClick={() => { setRestockId(part._id); setRestockQty(''); }}
                            title={t('inventory.restock')}
                          >
                            {part.quantity}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{part.sell_price != null ? `₹${part.sell_price.toLocaleString()}` : '—'}</td>
                      <td className="px-5 py-3.5 text-gray-500">{part.buy_price != null ? `₹${part.buy_price.toLocaleString()}` : '—'}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => openEdit(part)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold border transition-colors"
                          style={{ color: '#E85D04', borderColor: '#fcd9b8', background: '#FFF4EE' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#ffe3cf'}
                          onMouseLeave={e => e.currentTarget.style.background = '#FFF4EE'}
                        >
                          {t('inventory.editPart')}
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

      {/* Add / Edit slide-over panel */}
      {modal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setModal(null)} />
          <div
            className="fixed top-0 right-0 h-full z-50 flex flex-col"
            style={{ width: 420, background: '#f6f6f6', boxShadow: '-4px 0 32px rgba(0,0,0,0.15)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-gray-100 shrink-0">
              <button
                onClick={() => setModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">
                  {modal.mode === 'add' ? t('inventory.addPart') : t('inventory.editPart')}
                </h3>
                {modal.mode === 'edit' && (
                  <p className="text-xs text-gray-400">{modal.part.name_en}</p>
                )}
              </div>
            </div>

            {/* Form body */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
                {modal.mode === 'edit' && (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: '#fff', border: '1px solid #f0f0f0' }}>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{t('inventory.quantity')} (current)</span>
                    <span className="text-lg font-bold text-gray-800">{modal.part.quantity}</span>
                  </div>
                )}

                {/* Group: Basic info */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-4 pt-4 pb-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Part Info</p>
                  </div>
                  <div className="px-4 pb-4 space-y-3 mt-2">
                    {FIELDS.filter(f => ['name_en','brand','category','sku'].includes(f.key)).map(({ key, label, type, required }) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">{label}{required && ' *'}</label>
                        <input
                          type={type}
                          value={form[key]}
                          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                          required={required}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50"
                          onFocus={e => { e.target.style.boxShadow = '0 0 0 2px #E85D0440'; e.target.style.background = '#fff'; }}
                          onBlur={e => { e.target.style.boxShadow = ''; e.target.style.background = '#f9f9f9'; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group: Pricing & Stock */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-4 pt-4 pb-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Pricing & Stock</p>
                  </div>
                  <div className="px-4 pb-4 space-y-3 mt-2">
                    {FIELDS.filter(f => ['sell_price','buy_price','quantity','min_quantity'].includes(f.key)).map(({ key, label, type, required }) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                        <input
                          type={type}
                          value={form[key]}
                          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                          required={required}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50"
                          onFocus={e => { e.target.style.boxShadow = '0 0 0 2px #E85D0440'; e.target.style.background = '#fff'; }}
                          onBlur={e => { e.target.style.boxShadow = ''; e.target.style.background = '#f9f9f9'; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group: Vendor */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-4 pt-4 pb-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Vendor</p>
                  </div>
                  <div className="px-4 pb-4 space-y-3 mt-2">
                    {FIELDS.filter(f => ['vendor_name','vendor_phone'].includes(f.key)).map(({ key, label, type }) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                        <input
                          type={type}
                          value={form[key]}
                          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50"
                          onFocus={e => { e.target.style.boxShadow = '0 0 0 2px #E85D0440'; e.target.style.background = '#fff'; }}
                          onBlur={e => { e.target.style.boxShadow = ''; e.target.style.background = '#f9f9f9'; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 px-5 py-4 bg-white border-t border-gray-100 flex gap-3">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
                  style={{ background: '#E85D04' }}>
                  {saving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
