import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useMutation, useQueryClient } from '@tanstack/react-query';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Summary from './pages/UsageSummary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LogChoreModal from './components/LogChoreModal';
import { useRoomStore } from './store/roomStore';
import api from './services/api';

const queryClient = new QueryClient();

function AppContent() {
  const { currentRoom, isLoggingChore, setIsLoggingChore } = useRoomStore();
  const qc = useQueryClient();

  const logChoreMutation = useMutation({
    mutationFn: async (chore_type: string) => {
      const { data } = await api.post(`/rooms/${currentRoom?.id}/chores`, { chore_type });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
      qc.invalidateQueries({ queryKey: ['activity'] });
      setIsLoggingChore(false);
    },
  });

  return (
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

                {isLoggingChore && (
                  <LogChoreModal
                    onClose={() => setIsLoggingChore(false)}
                    onLogChore={(type) => logChoreMutation.mutate(type)}
                    isPending={logChoreMutation.isPending}
                  />
                )}
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
