import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { snippetsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    public: 0,
    private: 0,
    views: 0,
    likes: 0
  });

  useEffect(() => {
    fetchSnippets();
  }, [filter, searchTerm]);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      
      if (filter !== 'all') {
        params.isPublic = filter === 'public';
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await snippetsAPI.getMySnippets(params);
      setSnippets(response.data.snippets);
      
      const totalSnippets = response.data.snippets.length;
      const publicSnippets = response.data.snippets.filter(s => s.isPublic).length;
      const privateSnippets = totalSnippets - publicSnippets;
      const totalViews = response.data.snippets.reduce((sum, s) => sum + s.views, 0);
      const totalLikes = response.data.snippets.reduce((sum, s) => sum + s.likes.length, 0);
      
      setStats({
        total: totalSnippets,
        public: publicSnippets,
        private: privateSnippets,
        views: totalViews,
        likes: totalLikes
      });
    } catch (error) {
      toast.error('Failed to fetch snippets');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSnippet = async (id) => {
    if (!confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    try {
      await snippetsAPI.deleteSnippet(id);
      setSnippets(snippets.filter(snippet => snippet._id !== id));
      toast.success('Snippet deleted successfully');
    } catch (error) {
      toast.error('Failed to delete snippet');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Manage your code snippets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-2xl font-bold text-blue-400 mb-1">{stats.total}</div>
          <div className="text-gray-400 text-sm">Total Snippets</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-2xl font-bold text-green-400 mb-1">{stats.public}</div>
          <div className="text-gray-400 text-sm">Public</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.private}</div>
          <div className="text-gray-400 text-sm">Private</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-2xl font-bold text-purple-400 mb-1">{stats.views}</div>
          <div className="text-gray-400 text-sm">Total Views</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-2xl font-bold text-red-400 mb-1">{stats.likes}</div>
          <div className="text-gray-400 text-sm">Total Likes</div>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 md:mb-0">My Snippets</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Snippets</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <Link
              to="/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
            >
              Create New
            </Link>
          </div>
        </div>

        {snippets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <p className="text-lg">No snippets found</p>
              <p className="text-sm mt-2">Create your first code snippet to get started</p>
            </div>
            <Link
              to="/create"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create Your First Snippet
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Language</th>
                  <th className="pb-3">Visibility</th>
                  <th className="pb-3">Views</th>
                  <th className="pb-3">Likes</th>
                  <th className="pb-3">Created</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {snippets.map((snippet) => (
                  <tr key={snippet._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-4">
                      <Link
                        to={`/snippet/${snippet._id}`}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                      >
                        {snippet.title}
                      </Link>
                      {snippet.description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                          {snippet.description}
                        </p>
                      )}
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full capitalize">
                        {snippet.language}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        snippet.isPublic 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {snippet.isPublic ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="py-4 text-gray-400">{snippet.views}</td>
                    <td className="py-4 text-gray-400">{snippet.likes.length}</td>
                    <td className="py-4 text-gray-400">{formatDate(snippet.createdAt)}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/edit/${snippet._id}`}
                          className="text-blue-400 hover:text-blue-300"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeleteSnippet(snippet._id)}
                          className="text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
