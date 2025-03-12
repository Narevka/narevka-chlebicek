
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AgentDetail from "./pages/AgentDetail";
import Connect from "./pages/Connect";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Affiliates from "./pages/Affiliates";
import Blog from "./pages/Blog";
import Docs from "./pages/Docs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
            <Route path="/agents/:id/connect" element={<Connect />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/affiliates" element={<Affiliates />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/docs" element={<Docs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
