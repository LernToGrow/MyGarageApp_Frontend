import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { garageApi } from '../../api/garage.api';

export default function SetPasswordPage() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const token     = params.get('token') ?? '';
  const phone     = params.get('phone') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await garageApi.setInvitePassword(phone, token, password);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired invite link.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !phone) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f6f6f6' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <p className="text-gray-500 text-sm">Invalid invite link. Please ask your admin to resend it.</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f6f6f6' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4" style={{ background: '#22c55e' }}>
            ✓
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Password Set!</h2>
          <p className="text-sm text-gray-500 mb-6">Your account is active. You can now log in.</p>
          <button
            onClick={() => navigate('/garage/login')}
            className="w-full py-2.5 rounded-xl text-white font-semibold text-sm"
            style={{ background: '#E85D04' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f6f6f6' }}>
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold" style={{ background: '#E85D04' }}>
            G
          </div>
        </div>
        <h1 className="text-xl font-bold text-center text-gray-900 mb-1">Set Your Password</h1>
        <p className="text-sm text-gray-500 text-center mb-5">Welcome! Create a password to activate your account.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none"
              onFocus={e => e.target.style.boxShadow = '0 0 0 2px #E85D0440'}
              onBlur={e => e.target.style.boxShadow = ''}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
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
            {loading ? 'Setting…' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
