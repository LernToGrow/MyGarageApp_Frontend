import { useEffect, useState } from 'react';
import { garageApi } from '../../api/garage.api';
import { useT } from '../../hooks/useT';

const ALL_PERMISSIONS = [
  'add_job', 'edit_job', 'delete_job',
  'manage_customers',
  'add_employee', 'edit_employee',
  'add_inventory', 'edit_inventory',
  'add_billing', 'view_billing',
  'view_reports',
  'manage_services',
  'manage_settings',
  'manage_garage',
];

function Avatar({ name }) {
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: '#E85D04' }}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [permError, setPermError] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', phone: '' });
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeError, setActiveError] = useState('');
  const t = useT();

  const load = () => {
    setLoading(true);
    garageApi.listEmployees()
      .then(data => setEmployees(Array.isArray(data) ? data : (data.employees ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openEdit = (emp) => { setEditing(emp); setPermissions([...(emp.permissions ?? [])]); setPermError(''); };
  const togglePerm = (perm) => setPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);

  const savePermissions = async () => {
    setSaving(true);
    try {
      await garageApi.updatePermissions(editing._id, permissions);
      setEmployees(prev => prev.map(e => e._id === editing._id ? { ...e, permissions } : e));
      setEditing(null);
    } catch (err) {
      setPermError(err.response?.data?.error || t('employees.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (emp) => {
    setActiveError('');
    try {
      await garageApi.deactivateEmployee(emp._id);
      setEmployees(prev => prev.map(e => e._id === emp._id ? { ...e, is_active: !e.is_active } : e));
    } catch (err) {
      setActiveError(err.response?.data?.error || t('employees.deactivateError'));
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviting(true);
    try {
      const data = await garageApi.inviteEmployee(inviteData);
      setInviteLink(data.inviteUrl);
      setInviteData({ name: '', phone: '' });
      load();
    } catch (err) {
      setInviteError(err.response?.data?.error || t('employees.inviteError'));
    } finally {
      setInviting(false);
    }
  };

  const closeInviteModal = () => {
    setInviteOpen(false);
    setInviteLink('');
    setLinkCopied(false);
  };

  const permLabel = (perm) => {
    const key = `employees.perms.${perm}`;
    const val = t(key);
    return val !== key ? val : perm.replace(/_/g, ' ');
  };

  return (
    <div className="p-6" style={{ background: '#f6f6f6', minHeight: '100vh' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('employees.title')}</h1>
        <button onClick={() => setInviteOpen(true)} className="px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: '#E85D04' }}>
          + {t('employees.invite')}
        </button>
      </div>

      {activeError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 flex justify-between items-center">
          {activeError}
          <button onClick={() => setActiveError('')} className="text-red-400 hover:text-red-600 ml-3 font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E85D04', borderTopColor: 'transparent' }} />
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400 text-sm">{t('employees.noEmployees')}</div>
      ) : (
        <div className="space-y-3">
          {employees.map(emp => (
            <div key={emp._id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
              <Avatar name={emp.name} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{emp.name}</div>
                <div className="text-xs text-gray-500">{emp.phone}</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: emp.is_active ? '#2d6a4f' : '#6c757d' }}>
                {emp.is_active ? 'Active' : t('employees.inactive')}
              </span>
              <button onClick={() => openEdit(emp)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ color: '#E85D04', borderColor: '#E85D04' }}>
                {t('employees.permissions')}
              </button>
              <button onClick={() => toggleActive(emp)} className="text-xs font-semibold text-gray-400 hover:text-gray-700">
                {emp.is_active ? t('common.deactivate') : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96 max-w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-1">{t('employees.permissions')}</h3>
            <p className="text-xs text-gray-500 mb-4">{editing.name}</p>
            {permError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-3">{permError}</div>
            )}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {ALL_PERMISSIONS.map(perm => (
                <label key={perm} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={permissions.includes(perm)} onChange={() => togglePerm(perm)} className="accent-orange-500 w-4 h-4" />
                  <span className="text-xs text-gray-700">{permLabel(perm)}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600">{t('common.cancel')}</button>
              <button onClick={savePermissions} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60" style={{ background: '#E85D04' }}>
                {saving ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={closeInviteModal}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 max-w-full" onClick={e => e.stopPropagation()}>
            {inviteLink ? (
              <>
                <h3 className="text-base font-bold text-gray-900 mb-2">{t('employees.inviteSuccess')}</h3>
                <p className="text-xs text-gray-500 mb-4">{t('employees.inviteLinkHint')}</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 break-all mb-4 select-all">
                  {inviteLink}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { navigator.clipboard.writeText(inviteLink); setLinkCopied(true); }}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                    style={{ background: '#E85D04' }}
                  >
                    {linkCopied ? t('employees.linkCopied') : t('employees.copyLink')}
                  </button>
                  <button onClick={closeInviteModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">
                    {t('employees.inviteLinkDone')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-gray-900 mb-4">{t('employees.invite')}</h3>
                {inviteError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-3">{inviteError}</div>
                )}
                <form onSubmit={handleInvite} className="space-y-3">
                  <input type="text" placeholder={t('employees.namePlaceholder')} value={inviteData.name}
                    onChange={e => setInviteData(p => ({ ...p, name: e.target.value }))} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                    onFocus={e => e.target.style.boxShadow = '0 0 0 2px #E85D0440'} onBlur={e => e.target.style.boxShadow = ''} />
                  <input type="tel" placeholder={t('employees.phonePlaceholder')} value={inviteData.phone}
                    onChange={e => setInviteData(p => ({ ...p, phone: e.target.value }))} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                    onFocus={e => e.target.style.boxShadow = '0 0 0 2px #E85D0440'} onBlur={e => e.target.style.boxShadow = ''} />
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={closeInviteModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">{t('common.cancel')}</button>
                    <button type="submit" disabled={inviting} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60" style={{ background: '#E85D04' }}>
                      {inviting ? t('common.loading') : t('employees.inviteBtn')}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
