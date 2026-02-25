import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Summary from './pages/UsageSummary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                  <Navbar />
                  <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/activity" element={<Activity />} />
                      <Route path="/summary" element={<Summary />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
