
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'

import Index from './pages/Index.tsx'
import Dashboard from './pages/Dashboard.tsx'
import NotFound from './pages/NotFound.tsx'
import Auth from './pages/Auth.tsx'
import Blog from './pages/Blog.tsx'
import Docs from './pages/Docs.tsx'
import Pricing from './pages/Pricing.tsx'
import AgentDetail from './pages/AgentDetail.tsx'
import Connect from './pages/Connect.tsx'
import Affiliates from './pages/Affiliates.tsx'
import DebugChat from './pages/DebugChat.tsx'

import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Index />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="agents/:id/*" element={<AgentDetail />} />
              <Route path="connect/:id" element={<Connect />} />
              <Route path="login" element={<Auth />} />
              <Route path="register" element={<Auth />} />
              <Route path="blog" element={<Blog />} />
              <Route path="docs" element={<Docs />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="affiliates" element={<Affiliates />} />
              <Route path="debug-chat" element={<DebugChat />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
