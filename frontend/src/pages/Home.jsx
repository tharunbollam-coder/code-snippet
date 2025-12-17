import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { snippetsAPI } from '../services/api';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Home = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    fetchSnippets();
    fetchLanguages();
  }, []);

  const fetchSnippets = async () => {
    try {
      const response = await snippetsAPI.getSnippets({ limit: 6, sort: 'createdAt', order: 'desc' });
      setSnippets(response.data.snippets);
    } catch (error) {
      toast.error('Failed to fetch snippets');
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = () => {
    // Dummy data for popular languages (no counts)
    const dummyLanguages = [
      { language: 'javascript' },
      { language: 'python' },
      { language: 'java' },
      { language: 'typescript' },
      { language: 'cpp' },
      { language: 'go' },
      { language: 'rust' },
      { language: 'php' }
    ];
    setLanguages(dummyLanguages);
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
    <div className="space-y-12">
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          Code Snippet Manager
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Save, organize, and share your code snippets with the community. 
          Support for multiple programming languages with syntax highlighting.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/search"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Explore Snippets
          </Link>
          <Link
            to="/register"
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Popular Languages</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {languages.map((lang) => (
            <Link
              key={lang.language}
              to={`/search?language=${lang.language}`}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-6 text-center transition-colors"
            >
              <div className="text-gray-300 capitalize font-medium">{lang.language}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Snippets</h2>
          <Link
            to="/search"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="grid gap-6">
          {snippets.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-lg">No snippets found. Be the first to create one!</p>
              <Link
                to="/register"
                className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create Your First Snippet
              </Link>
            </div>
          ) : (
            snippets.map((snippet) => (
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
                      {snippet.code}
                    </SyntaxHighlighter>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                        {snippet.author && snippet.author.username ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">
                                {snippet.author.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-gray-300">{snippet.author.username}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">U</span>
                            </div>
                            <span className="text-gray-300">Unknown User</span>
                          </div>
                        )}
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
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
