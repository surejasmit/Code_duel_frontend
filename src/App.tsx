import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import CodeEditor from "@/components/CodeEditor";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ChallengePage from "@/pages/ChallengePage";
import CreateChallenge from "@/pages/CreateChallenge";
import Leaderboard from "@/pages/Leaderboard";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Leetcode from "@/pages/Leetcode";
import NotFound from "@/pages/NotFound";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ErrorFallback from "@/components/common/ErrorFallback";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<ErrorBoundary fallback={<ErrorFallback onRetry={() => window.location.reload()} onReload={() => window.location.reload()} />}><Index /></ErrorBoundary>} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback onRetry={() => window.location.reload()} onReload={() => window.location.reload()} />}>
                        <Dashboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<AuthRoute><ErrorBoundary fallback={<ErrorFallback onRetry={() => window.location.reload()} onReload={() => window.location.reload()} />}><Login /></ErrorBoundary></AuthRoute>} />
                <Route path="/register" element={<AuthRoute><ErrorBoundary fallback={<ErrorFallback onRetry={() => window.location.reload()} onReload={() => window.location.reload()} />}><Register /></ErrorBoundary></AuthRoute>} />
                <Route
                  path="/challenge/:id"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback onRetry={() => window.location.reload()} onReload={() => window.location.reload()} />}>
                        <ChallengePage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-challenge"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback onRetry={() => window.location.reload()} onReload={() => window.location.reload()} />}>
                        <CreateChallenge />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback onRetry={() => window.location.reload()} onReload={() => window.location.reload()} />}>
                        <Leaderboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback onRetry={() => window.location.reload()} onReload={() => window.location.reload()} />}>
                        <Settings />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback onRetry={() => window.location.reload()} onReload={() => window.location.reload()} />}>
                        <Profile />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leetcode"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback onRetry={() => window.location.reload()} onReload={() => window.location.reload()} />}>
                        <Leetcode />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<ErrorBoundary fallback={<ErrorFallback onRetry={() => window.location.reload()} onReload={() => window.location.reload()} />}><NotFound /></ErrorBoundary>} />
              </Routes>
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
