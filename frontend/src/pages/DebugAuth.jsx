import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const DebugAuth = () => {
  const { isAuthenticated, loading, user, token } = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg">
      <h1 className="text-2xl font-bold text-white mb-4">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-lg font-semibold text-white mb-2">Auth State:</h2>
          <div className="text-gray-300">
            <p>Loading: {loading ? 'true' : 'false'}</p>
            <p>Authenticated: {isAuthenticated ? 'true' : 'false'}</p>
            <p>Token exists: {token ? 'true' : 'false'}</p>
            <p>User: {user ? JSON.stringify(user) : 'null'}</p>
          </div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-lg font-semibold text-white mb-2">Next Steps:</h2>
          <div className="text-gray-300">
            {loading && <p>Still loading authentication...</p>}
            {!loading && !isAuthenticated && <p>Please <a href="/login" className="text-blue-400">login</a> or <a href="/register" className="text-blue-400">register</a></p>}
            {!loading && isAuthenticated && <p>Authentication successful! You should be able to access protected routes.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;
