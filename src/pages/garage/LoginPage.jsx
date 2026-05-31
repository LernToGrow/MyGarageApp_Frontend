import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { garageApi } from '../../api/garage.api';
import { useGarageAuthStore } from '../../store/garageAuthStore';
import { useLanguageStore } from '../../store/languageStore';
import { useT } from '../../hooks/useT';

const COUNTRIES = [
  { code: 'IN', name: 'India',          dial: '+91',  flag: '🇮🇳' },
  { code: 'US', name: 'United States',  dial: '+1',   flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '+44',  flag: '🇬🇧' },
  { code: 'AE', name: 'UAE',            dial: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia',   dial: '+966', flag: '🇸🇦' },
  { code: 'AU', name: 'Australia',      dial: '+61',  flag: '🇦🇺' },
  { code: 'CA', name: 'Canada',         dial: '+1',   flag: '🇨🇦' },
  { code: 'SG', name: 'Singapore',      dial: '+65',  flag: '🇸🇬' },
  { code: 'NZ', name: 'New Zealand',    dial: '+64',  flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa',   dial: '+27',  flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria',        dial: '+234', flag: '🇳🇬' },
  { code: 'PK', name: 'Pakistan',       dial: '+92',  flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh',     dial: '+880', flag: '🇧🇩' },
  { code: 'NP', name: 'Nepal',          dial: '+977', flag: '🇳🇵' },
  { code: 'LK', name: 'Sri Lanka',      dial: '+94',  flag: '🇱🇰' },
];

const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हिं', name: 'Hindi' },
  { code: 'mr', label: 'मर', name: 'Marathi' },
];

function CountryPicker({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        className="flex items-center gap-1.5 h-full px-3 border-r border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-l-lg transition-colors whitespace-nowrap"
      >
        <span className="text-base">{selected.flag}</span>
        <span className="text-gray-500">{selected.dial}</span>
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              placeholder="Search country…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none"
              onFocus={e => e.target.style.boxShadow = '0 0 0 2px #E85D0440'}
              onBlur={e => e.target.style.boxShadow = ''}
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">No results</li>
            ) : filtered.map(c => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => { onChange(c); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-orange-50 transition-colors text-left"
                  style={selected.code === c.code ? { background: '#E85D0415', color: '#E85D04' } : {}}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1 text-gray-700">{c.name}</span>
                  <span className="text-gray-400 font-medium">{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function GarageLoginPage() {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useGarageAuthStore();
  const { lang, setLang } = useLanguageStore();
  const t = useT();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fullPhone = country.dial + phone.replace(/^0+/, '');
      const data = await garageApi.login(fullPhone, password);
      login(data.token, data.user);
      navigate('/garage/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f6f6f6' }}>
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold" style={{ background: '#E85D04' }}>
            G
          </div>
        </div>
        <h1 className="text-xl font-bold text-center text-gray-900 mb-1">Garage Owner Portal</h1>
        <p className="text-sm text-gray-500 text-center mb-5">{t('auth.signInToContinue')}</p>

        {/* Language picker */}
        <div className="flex justify-center gap-2 mb-5">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              title={l.name}
              className="px-3 py-1 rounded-full text-xs font-bold border transition-colors"
              style={lang === l.code
                ? { background: '#E85D04', color: '#fff', borderColor: '#E85D04' }
                : { background: '#fff', color: '#888', borderColor: '#e0e0e0' }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              {t('auth.phoneLabel')}
            </label>
            <div
              className="flex items-stretch border border-gray-200 rounded-lg overflow-visible"
              onFocusCapture={e => e.currentTarget.style.boxShadow = '0 0 0 2px #E85D0440'}
              onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.style.boxShadow = ''; }}
            >
              <CountryPicker selected={country} onChange={setCountry} />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder={t('auth.phoneLabel')}
                required
                className="flex-1 px-3 py-2.5 text-sm focus:outline-none rounded-r-lg bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              {t('auth.passwordLabel')}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none"
              onFocus={e => e.target.style.boxShadow = '0 0 0 2px #E85D0440'}
              onBlur={e => e.target.style.boxShadow = ''}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
            style={{ background: '#E85D04' }}
          >
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>
      </div>
    </div>
  );
}
