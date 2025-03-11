import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import AgentDetail from './pages/AgentDetail';
import Auth from './pages/Auth';
import Pricing from './pages/Pricing';
import Affiliates from './pages/Affiliates';
import Docs from './pages/Docs';
import Blog from './pages/Blog';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import Terms from './pages/Terms';

function App() {
  const [loading, setLoading] = useState(true);
  const { checkAuth } = useAuth();

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setLoading(false);
    };

    verifyAuth();
  }, [checkAuth]);

  const DashboardWithAuth = () => {
    const { user } = useAuth();
    return user ? <Dashboard /> : <Auth />;
  };

  const AgentDetailWithAuth = () => {
    const { user } = useAuth();
    return user ? <AgentDetail /> : <Auth />;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<DashboardWithAuth />} />
        <Route path="/agents/:agentId" element={<AgentDetailWithAuth />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/affiliates" element={<Affiliates />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function AppWithProviders() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppWithProviders;
