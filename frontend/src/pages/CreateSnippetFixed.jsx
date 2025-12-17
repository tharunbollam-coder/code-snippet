import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { snippetsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const LANGUAGES = [
  'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 
  'php', 'ruby', 'go', 'rust', 'typescript', 'html', 
  'css', 'sql', 'bash', 'powershell', 'swift', 'kotlin',
  'scala', 'r', 'perl', 'lua', 'dart', 'elixir', 'haskell'
];

const CreateSnippetFixed = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: '',
    snippetCollection: 'uncategorized',
    isPublic: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchSnippet();
    }
  }, [id]);

  const fetchSnippet = async () => {
    try {
      setFetchLoading(true);
      const response = await snippetsAPI.getSnippet(id);
      const snippet = response.data.snippet;
      
      setFormData({
        title: snippet.title,
        description: snippet.description || '',
        code: snippet.code,
        language: snippet.language,
        tags: snippet.tags.join(', '),
        snippetCollection: snippet.snippetCollection || 'uncategorized',
        isPublic: snippet.isPublic
      });
    } catch (error) {
      toast.error('Failed to fetch snippet');
      navigate('/dashboard');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }
    
    if (!formData.language) {
      newErrors.language = 'Language is required';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    
    if (formData.snippetCollection && formData.snippetCollection.length > 50) {
      newErrors.snippetCollection = 'Collection name cannot exceed 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const snippetData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (isEdit) {
        await snippetsAPI.updateSnippet(id, snippetData);
        toast.success('Snippet updated successfully');
      } else {
        await snippetsAPI.createSnippet(snippetData);
        toast.success('Snippet created successfully');
      }
      
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save snippet';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isEdit ? 'Edit Snippet' : 'Create New Snippet'}
        </h1>
        <p className="text-gray-400">
          {isEdit ? 'Update your code snippet' : 'Share your code with the community'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter snippet title"
              disabled={loading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
              Programming Language *
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.language ? 'border-red-500' : 'border-gray-600'
              }`}
              disabled={loading}
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
            {errors.language && (
              <p className="mt-1 text-sm text-red-400">{errors.language}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Brief description of your snippet (optional)"
            disabled={loading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-400">{errors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
            Code *
          </label>
          <textarea
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            rows={12}
            className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm ${
              errors.code ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Paste your code here..."
            disabled={loading}
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-400">{errors.code}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="react, javascript, web"
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-400">Separate tags with commas</p>
          </div>

          <div>
            <label htmlFor="collection" className="block text-sm font-medium text-gray-300 mb-2">
              Collection
            </label>
            <input
              type="text"
              id="collection"
              name="snippetCollection"
              value={formData.snippetCollection}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.snippetCollection ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="uncategorized"
              disabled={loading}
            />
            {errors.snippetCollection && (
              <p className="mt-1 text-sm text-red-400">{errors.snippetCollection}</p>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            disabled={loading}
          />
          <label htmlFor="isPublic" className="ml-2 text-sm font-medium text-gray-300">
            Make this snippet public (others can view and fork it)
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">
                  {isEdit ? 'Updating...' : 'Creating...'}
                </span>
              </>
            ) : (
              isEdit ? 'Update Snippet' : 'Create Snippet'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSnippetFixed;
