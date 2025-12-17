import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { snippetsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardSimple = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMySnippets();
  }, []);

  const fetchMySnippets = async () => {
    try {
      setLoading(true);
      const response = await snippetsAPI.getMySnippets({ page: 1, limit: 12 });
      setSnippets(response.data.snippets || []);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch snippets:', error);
      // Don't show error for auth issues, just show empty state
      if (error.response?.status === 401 || error.response?.status === 403) {
        setSnippets([]);
        setError(null);
      } else {
        setError('Failed to load your snippets');
        setSnippets([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Loading your snippets...</p>
        </div>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome to your code snippet dashboard!</p>
        </div>
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-200">{error}</p>
          <button 
            onClick={fetchMySnippets}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to your code snippet dashboard!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Total Snippets</h3>
          <p className="text-3xl font-bold text-blue-400">{snippets.length}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Languages</h3>
          <p className="text-3xl font-bold text-green-400">
            {new Set(snippets.map(s => s.language)).size || 0}
          </p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Created</h3>
          <p className="text-3xl font-bold text-purple-400">
            {snippets.filter(s => s.createdAt).length}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Your Snippets</h2>
          <Link
            to="/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Create New Snippet
          </Link>
        </div>
        
        {snippets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No snippets yet. Create your first snippet!</p>
            <Link
              to="/create"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Snippet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snippets.map((snippet) => (
              <div key={snippet._id || snippet.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-2 truncate">{snippet.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{snippet.description || 'No description'}</p>
                
                {/* Code Preview */}
                <div className="mb-3">
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={snippet.programmingLanguage || snippet.language}
                    customStyle={{
                      background: '#1f2937',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">{snippet.programmingLanguage || snippet.language}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(snippet.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {snippet.tags && snippet.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {snippet.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSimple;
