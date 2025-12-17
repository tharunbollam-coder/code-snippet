import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../context/AuthContext';
import { snippetsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const SnippetDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchSnippet();
  }, [id]);

  const fetchSnippet = async () => {
    try {
      const response = await snippetsAPI.getSnippet(id);
      setSnippet(response.data.snippet);
      setLikeCount(response.data.snippet.likes.length);
      
      if (isAuthenticated && user) {
        setIsLiked(response.data.snippet.likes.some(like => like._id === user.id));
      }
    } catch (error) {
      toast.error('Failed to fetch snippet');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like snippets');
      navigate('/login');
      return;
    }

    try {
      const response = await snippetsAPI.likeSnippet(id);
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likesCount);
    } catch (error) {
      toast.error('Failed to like snippet');
    }
  };

  const handleFork = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to fork snippets');
      navigate('/login');
      return;
    }

    try {
      const response = await snippetsAPI.forkSnippet(id);
      toast.success('Snippet forked successfully!');
      navigate(`/edit/${response.data.snippet._id}`);
    } catch (error) {
      toast.error('Failed to fork snippet');
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    try {
      await snippetsAPI.deleteSnippet(id);
      toast.success('Snippet deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete snippet');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet.code);
    toast.success('Code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Snippet not found</h2>
        <Link to="/" className="text-blue-400 hover:text-blue-300">
          Back to Home
        </Link>
      </div>
    );
  }

  const isOwner = isAuthenticated && user && snippet.author._id === user.id;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{snippet.title}</h1>
            {snippet.description && (
              <p className="text-gray-300 text-lg">{snippet.description}</p>
            )}
          </div>
          <span className="ml-4 px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full capitalize">
            {snippet.language}
          </span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to={`/profile/${snippet.author.username}`}
              className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded-lg transition-colors"
            >
              {snippet.author.avatar ? (
                <img
                  src={snippet.author.avatar}
                  alt={snippet.author.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {snippet.author.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="text-white font-medium">{snippet.author.username}</div>
                <div className="text-gray-400 text-sm">
                  {formatDate(snippet.createdAt)}
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{snippet.views} views</span>
            </div>

            {snippet.isPublic && (
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isLiked
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{likeCount}</span>
              </button>
            )}

            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </button>

            {snippet.isPublic && isAuthenticated && !isOwner && (
              <button
                onClick={handleFork}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Fork</span>
              </button>
            )}

            {isOwner && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Code</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              {snippet.collection && snippet.collection !== 'uncategorized' && (
                <span className="px-2 py-1 bg-gray-700 rounded">
                  📁 {snippet.collection}
                </span>
              )}
              <span className="px-2 py-1 bg-gray-700 rounded">
                {snippet.isPublic ? '🌐 Public' : '🔒 Private'}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={snippet.language}
              customStyle={{
                background: '#1f2937',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                padding: '1.5rem',
                margin: 0,
              }}
              showLineNumbers
              wrapLines
            >
              {snippet.code}
            </SyntaxHighlighter>
          </div>
        </div>

        {snippet.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {snippet.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/search?tags=${tag}`}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {snippet.isForked && snippet.originalSnippet && (
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>
                Forked from{' '}
                <Link
                  to={`/snippet/${snippet.originalSnippet._id}`}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {snippet.originalSnippet.title}
                </Link>
                {' '}by{' '}
                <Link
                  to={`/profile/${snippet.originalSnippet.author.username}`}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {snippet.originalSnippet.author.username}
                </Link>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnippetDetail;
