import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import Login from './pages/Login';
import Register from './pages/Register';
import AvatarSelection from './pages/AvatarSelection';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadsEnquiry from './pages/LeadsEnquiry';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import NewCompany from './pages/NewCompany';
import { useAuth } from './lib/auth';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { user, loading } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/avatar-selection"
          element={
            <PrivateRoute>
              <AvatarSelection />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <PrivateRoute>
              <Leads />
            </PrivateRoute>
          }
        />
        <Route
          path="/leads/new"
          element={
            <PrivateRoute>
              <NewCompany />
            </PrivateRoute>
          }
        />
        <Route
          path="/leads-enquiry"
          element={
            <PrivateRoute>
              <LeadsEnquiry />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route 
          path="/" 
          element={
            loading ? (
              <div>Loading...</div>
            ) : user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Landing />
            )
          } 
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;