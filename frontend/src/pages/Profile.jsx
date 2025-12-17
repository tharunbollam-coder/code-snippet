import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { usersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSnippets: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    fetchProfile();
  }, [username, currentPage]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileResponse, snippetsResponse] = await Promise.all([
        usersAPI.getUserProfile(username, { page: currentPage, limit: 6 }),
        usersAPI.getUserProfile(username, { page: currentPage, limit: 6 })
      ]);
      
      setProfile(profileResponse.data.user);
      setSnippets(snippetsResponse.data.snippets);
      setStats(profileResponse.data.stats);
      setPagination(snippetsResponse.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">User not found</h2>
        <Link to="/" className="text-blue-400 hover:text-blue-300">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <div className="flex items-center space-x-6">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{profile.username}</h1>
            {profile.bio && (
              <p className="text-gray-300 text-lg mb-4">{profile.bio}</p>
            )}
            
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{stats.totalSnippets}</div>
                  <div className="text-gray-400 text-sm">Snippets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats.publicSnippets}</div>
                  <div className="text-gray-400 text-sm">Public</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{stats.totalViews}</div>
                  <div className="text-gray-400 text-sm">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{stats.totalLikes}</div>
                  <div className="text-gray-400 text-sm">Likes</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Public Snippets</h2>
        
        {snippets.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <p className="text-lg">No public snippets yet</p>
              <p className="text-sm mt-2">This user hasn't shared any public snippets</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {snippets.map((snippet) => (
              <div key={snippet._id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <Link
                        to={`/snippet/${snippet._id}`}
                        className="text-xl font-semibold text-white hover:text-blue-400 transition-colors"
                      >
                        {snippet.title}
                      </Link>
                      {snippet.description && (
                        <p className="text-gray-400 mt-2 line-clamp-2">{snippet.description}</p>
                      )}
                    </div>
                    <span className="ml-4 px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full capitalize">
                      {snippet.language}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={snippet.language}
                      customStyle={{
                        background: '#1f2937',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        maxHeight: '200px',
                        overflow: 'auto'
                      }}
                    >
                      {snippet.code.substring(0, 500) + (snippet.code.length > 500 ? '...' : '')}
                    </SyntaxHighlighter>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span>•</span>
                      <span>{formatDate(snippet.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{snippet.views}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{snippet.likes.length}</span>
                      </span>
                    </div>
                  </div>

                  {snippet.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mt-4">
                      <span className="text-gray-500 text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-2">
                        {snippet.tags.map((tag, index) => (
                          <Link
                            key={index}
                            to={`/search?tags=${tag}`}
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      pageNum === pagination.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
