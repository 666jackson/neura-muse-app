import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import DailyMuse from './pages/oracle/DailyMuse.jsx';
import Divination from './pages/oracle/Divination.jsx';
import Gacha from './pages/oracle/Gacha.jsx';
import Rates from './pages/oracle/Rates.jsx';
import Vault from './pages/oracle/Vault.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import VideoManager from './pages/VideoManager.jsx';
import AudioManager from './pages/AudioManager.jsx';
import { onAuthChange, supabase } from './lib/supabase.js';

export default function App() {
  const [session, setSession] = React.useState(null);
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = onAuthChange(setSession);
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/daily" element={<DailyMuse />} />
      <Route path="/divination" element={<Divination />} />
      <Route path="/gacha" element={<Gacha />} />
      <Route path="/rates" element={<Rates />} />
      <Route path="/vault" element={<Vault />} />
      <Route path="/admin/login" element={<AdminLogin session={session} />} />
      <Route path="/admin/dashboard" element={<AdminDashboard session={session} />} />
      <Route path="/admin/videos" element={<VideoManager session={session} />} />
      <Route path="/admin/audio" element={<AudioManager session={session} />} />
    </Routes>
  );
}