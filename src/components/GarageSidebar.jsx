import { NavLink, useNavigate } from 'react-router-dom';
import { useGarageAuthStore } from '../store/garageAuthStore';
import { useLanguageStore } from '../store/languageStore';
import { useT } from '../hooks/useT';

const NAV = [
  { to: '/garage/dashboard', labelKey: 'dashboard.title', icon: '⊞' },
  { to: '/garage/jobs',      labelKey: 'jobs.title',      icon: '🔧' },
  { to: '/garage/revenue',   labelKey: 'revenue.title',   icon: '📊' },
  { to: '/garage/payments',  labelKey: 'payments.title',  icon: '💳' },
  { to: '/garage/employees', labelKey: 'employees.title', icon: '👥' },
  { to: '/garage/performance', labelKey: 'performance.jobs', icon: '📈' },
  { to: '/garage/inventory', labelKey: 'inventory.title', icon: '📦' },
  { to: '/garage/services',  labelKey: 'services.title',  icon: '🛠️' },
];

const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हिं', name: 'Hindi' },
  { code: 'mr', label: 'मर', name: 'Marathi' },
];

export default function GarageSidebar() {
  const { user, logout } = useGarageAuthStore();
  const { lang, setLang } = useLanguageStore();
  const t = useT();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/garage/login');
  };

  return (
    <aside className="w-56 min-h-screen flex flex-col" style={{ background: '#1a1a1a' }}>
      {/* Header */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: '#E85D04' }}
          >
            {user?.name?.[0]?.toUpperCase() ?? 'G'}
          </div>
          <div className="min-w-0">
            <div className="text-white font-semibold text-sm leading-tight truncate">
              {user?.name ?? 'Garage Owner'}
            </div>
            <div className="text-white/40 text-xs">{t('roles.garage_owner')}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2">
        {NAV.map(({ to, labelKey, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`
            }
            style={({ isActive }) => isActive ? { background: '#E85D04' } : {}}
          >
            <span className="text-base">{icon}</span>
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>

      {/* Language switcher */}
      <div className="px-3 pb-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-white/30 mb-2 px-1">
          {t('settings.language')}
        </div>
        <div className="flex gap-1">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              title={l.name}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors"
              style={
                lang === l.code
                  ? { background: '#E85D04', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }
              }
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span>🚪</span> {t('settings.logout')}
        </button>
      </div>
    </aside>
  );
}
