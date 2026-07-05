import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../lib/supabase.js';
import { T } from '../i18n.js';

export default function AdminLogin({ session }) {
  const navigate = useNavigate();
  const lang = localStorage.getItem('nm_lang') || 'en';
  const t = T[lang];
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => { if (session) navigate('/admin/dashboard'); }, [session, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await signIn(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-chrome flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-ice/30 bg-white/[0.03] backdrop-blur-xl p-10">
        <div className="font-mono text-[10px] tracking-[0.4em] text-ice mb-4">/ADMIN/LOGIN — RESTRICTED</div>
        <h1 className="font-display tracking-[0.2em] text-xl mb-8">{t.adminTitle}</h1>
        <label className="block font-mono text-[10px] tracking-[0.3em] text-chrome/50 mb-2">EMAIL</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-5 rounded-lg bg-ink/70 border border-white/20 px-4 py-3 text-sm focus:border-ice outline-none" />
        <label className="block font-mono text-[10px] tracking-[0.3em] text-chrome/50 mb-2">PASSWORD</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-5 rounded-lg bg-ink/70 border border-white/20 px-4 py-3 text-sm focus:border-ice outline-none" />
        {error && <div className="font-mono text-[10px] tracking-widest text-red-400 mb-4">▮ {error}</div>}
        <button disabled={busy} className="w-full font-display text-xs tracking-[0.3em] py-4 rounded-lg bg-gradient-to-r from-ice to-nova text-ink disabled:opacity-50">
          {busy ? '...' : t.signIn}
        </button>
      </form>
    </div>
  );
}