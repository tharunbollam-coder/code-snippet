import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { snippetsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { value: '', label: 'All Languages' },
  'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 
  'php', 'ruby', 'go', 'rust', 'typescript', 'html', 
  'css', 'sql', 'bash', 'powershell', 'swift', 'kotlin',
  'scala', 'r', 'perl', 'lua', 'dart', 'elixir', 'haskell'
];

const Search = () => {
  const [snippets, setSnippets] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTags, setSelectedTags] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSnippets: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search') || '';
    const language = urlParams.get('language') || '';
    const tags = urlParams.get('tags') || '';
    
    setSearchTerm(search);
    setSelectedLanguage(language);
    setSelectedTags(tags);
    
    fetchSnippets({ search, language, tags });
    fetchLanguages();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedLanguage) params.set('language', selectedLanguage);
    if (selectedTags) params.set('tags', selectedTags);
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchTerm, selectedLanguage, selectedTags]);

  const fetchSnippets = async (params = {}) => {
    try {
      setLoading(true);
      const response = await snippetsAPI.getSnippets({
        page: currentPage,
        limit: 12,
        sort: sortBy,
        order: sortOrder,
        ...params
      });
      
      setSnippets(response.data.snippets);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch snippets');
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await snippetsAPI.getLanguages();
      setLanguages(response.data.languages);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSnippets({
      search: searchTerm,
      language: selectedLanguage,
      tags: selectedTags
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchSnippets({
      search: searchTerm,
      language: selectedLanguage,
      tags: selectedTags,
      page
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Search Snippets</h1>
        <p className="text-gray-400">Find code snippets from the community</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search snippets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {LANGUAGES.map(lang => (
              <option key={typeof lang === 'string' ? lang : lang.value} value={typeof lang === 'string' ? lang : lang.value}>
                {typeof lang === 'string' ? lang.charAt(0).toUpperCase() + lang.slice(1) : lang.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={selectedTags}
            onChange={(e) => setSelectedTags(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Search
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">Sort by:</span>
            <button
              onClick={() => handleSort('createdAt')}
              className={`text-sm font-medium transition-colors ${
                sortBy === 'createdAt' ? 'text-blue-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('views')}
              className={`text-sm font-medium transition-colors ${
                sortBy === 'views' ? 'text-blue-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Views {sortBy === 'views' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('likes')}
              className={`text-sm font-medium transition-colors ${
                sortBy === 'likes' ? 'text-blue-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Likes {sortBy === 'likes' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
          
          <div className="text-gray-400 text-sm">
            {pagination.totalSnippets} results found
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          {snippets.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg">No snippets found</p>
                <p className="text-sm mt-2">Try adjusting your search criteria</p>
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
        </>
      )}
    </div>
  );
};

export default Search;
