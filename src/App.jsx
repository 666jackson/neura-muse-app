import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
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
      <Route path="/admin/login" element={<AdminLogin session={session} />} />
      <Route path="/admin/dashboard" element={<AdminDashboard session={session} />} />
    </Routes>
  );
}