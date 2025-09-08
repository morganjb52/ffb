import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import HTMLTest from './components/HTMLTest';

function App() {
  const { setUser } = useStore();

  useEffect(() => {
    // Initialize with a default user (no login required)
    const defaultUser = {
      id: 'user-1',
      email: 'demo@fantasycentral.com',
      name: 'Fantasy Manager',
      teams: [],
      leagueRecords: [],
      preferences: {
        notifications: true,
        defaultView: 'dashboard' as const
      }
    };
    setUser(defaultUser);
  }, [setUser]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/test" element={<HTMLTest />} />
      </Routes>
    </Layout>
  );
}

export default App;
