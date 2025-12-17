import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/DashboardSimple';
import CreateSnippet from './pages/CreateSnippetWorking';
import SnippetDetail from './pages/SnippetDetail';
import Profile from './pages/Profile';
import DebugAuth from './pages/DebugAuth';
import Search from './pages/Search';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/search" element={<Search />} />
          <Route path="/snippet/:id" element={<SnippetDetail />} />
          <Route path="/profile/:username" element={<Profile />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
<Route path="/create" element={<CreateSnippet />} />
<Route path="/edit/:id" element={<CreateSnippet />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
