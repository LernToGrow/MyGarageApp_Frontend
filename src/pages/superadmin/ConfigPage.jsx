import { useState } from 'react';
import client from '../../api/client';

export default function ConfigPage() {
  const [announcement, setAnnouncement] = useState('');
  const [pushed, setPushed] = useState(false);
  const [pushing, setPushing] = useState(false);

  const handlePush = async () => {
    if (!announcement.trim()) return;
    setPushing(true);
    try {
      await client.post('/admin/config/announcement', { message: announcement });
      setPushed(true);
      setAnnouncement('');
      setTimeout(() => setPushed(false), 3000);
    } catch {
      alert('Failed to push announcement');
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Config & Content</h1>
        <p className="text-slate-500 text-sm">Platform-wide settings</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-xl">
        <h2 className="text-base font-semibold text-slate-800">Platform Announcement</h2>
        <p className="text-sm text-slate-500">This message will be shown to all garage owners on their next login.</p>
        <textarea
          value={announcement}
          onChange={e => setAnnouncement(e.target.value)}
          placeholder="Type your announcement…"
          rows={4}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handlePush}
            disabled={pushing || !announcement.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {pushing ? 'Pushing…' : 'Push to All Garages'}
          </button>
          {pushed && <span className="text-green-600 text-sm">Announcement pushed!</span>}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-xl">
        <h2 className="text-base font-semibold text-slate-700 mb-2">Coming Soon</h2>
        <ul className="text-sm text-slate-500 space-y-1 list-disc list-inside">
          <li>Manage global service categories</li>
          <li>Default pricing templates</li>
          <li>Language/localization overrides per garage</li>
          <li>Feature flags per plan</li>
        </ul>
      </div>
    </div>
  );
}
