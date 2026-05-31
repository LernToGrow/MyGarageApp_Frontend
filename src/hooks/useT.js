import { useLanguageStore } from '../store/languageStore';

// Resolves dot-notation key from nested object: t('dashboard.title')
function resolve(obj, key) {
  return key.split('.').reduce((o, k) => o?.[k], obj) ?? key;
}

// Replaces {{variable}} placeholders: t('dashboard.qtyMin', { qty: 2, min: 5 })
function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

export function useT() {
  const { translations } = useLanguageStore();
  return (key, vars) => interpolate(resolve(translations, key), vars);
}
