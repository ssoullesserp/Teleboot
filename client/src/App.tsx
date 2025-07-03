import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Dashboard } from './pages/Dashboard';
import { BotBuilder } from './pages/BotBuilder';
import { Templates } from './pages/Templates';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Layout } from './components/Layout';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bots/:botId/flows/:flowId" element={<BotBuilder />} />
        <Route path="/bots/:botId/flows/new" element={<BotBuilder />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;