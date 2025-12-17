import express from 'express';
import { body, validationResult } from 'express-validator';
import Snippet from '../models/Snippet.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, code, language, tags, snippetCollection, isPublic } = req.body;

    // Use the authenticated user's ID from req.user
    const userId = req.user._id;

    const snippet = new Snippet({
      title,
      description,
      code,
      programmingLanguage: language,
      tags: Array.isArray(tags) ? tags.map(tag => tag.toLowerCase().trim()) : [],
      author: userId,
      snippetCollection,
      isPublic
    });

    await snippet.save();
    await snippet.populate('author', 'username avatar');

    res.status(201).json({
      message: 'Snippet created successfully',
      snippet
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating snippet' });
  }
});

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      language,
      tags,
      author,
      snippetCollection,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { isPublic: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (language) {
      query.programmingLanguage = language;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    if (author) {
      query.author = author;
    }

    if (snippetCollection) {
      query.snippetCollection = snippetCollection;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sort]: sortOrder };

    const snippets = await Snippet.find(query)
      .populate('author', 'username avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Snippet.countDocuments(query);

    res.json({
      snippets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSnippets: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching snippets' });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      language,
      tags,
      snippetCollection,
      isPublic,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Use the authenticated user's ID from req.user
    const userId = req.user._id;
    const query = { author: userId };

    if (search) {
      query.$text = { $search: search };
    }

    if (language) {
      query.programmingLanguage = language;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    if (snippetCollection) {
      query.snippetCollection = snippetCollection;
    }

    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sort]: sortOrder };

    const snippets = await Snippet.find(query)
      .populate('author', 'username avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Snippet.countDocuments(query);

    res.json({
      snippets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSnippets: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching your snippets' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('originalSnippet', 'title author')
      .lean();

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    if (!snippet.isPublic && (!req.user || snippet.author._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Snippet.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ snippet });
  } catch (error) {
    console.error('Get snippet error:', error);
    res.status(500).json({ message: 'Server error fetching snippet' });
  }
});

router.put('/:id', auth, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Code cannot be empty'),
  body('language')
    .optional()
    .isIn([
      'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 
      'php', 'ruby', 'go', 'rust', 'typescript', 'html', 
      'css', 'sql', 'bash', 'powershell', 'swift', 'kotlin',
      'scala', 'r', 'perl', 'lua', 'dart', 'elixir', 'haskell'
    ])
    .withMessage('Invalid programming language'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('snippetCollection')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Collection name cannot exceed 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    if (snippet.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own snippets' });
    }

    const updates = {};
    const allowedFields = ['title', 'description', 'code', 'language', 'tags', 'snippetCollection', 'isPublic'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'tags') {
          updates[field] = req.body[field].map(tag => tag.toLowerCase().trim());
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    const updatedSnippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'username avatar');

    res.json({
      message: 'Snippet updated successfully',
      snippet: updatedSnippet
    });
  } catch (error) {
    console.error('Update snippet error:', error);
    res.status(500).json({ message: 'Server error updating snippet' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    if (snippet.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own snippets' });
    }

    await Snippet.findByIdAndDelete(req.params.id);

    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Delete snippet error:', error);
    res.status(500).json({ message: 'Server error deleting snippet' });
  }
});

router.post('/:id/fork', auth, async (req, res) => {
  try {
    const originalSnippet = await Snippet.findById(req.params.id);

    if (!originalSnippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    if (!originalSnippet.isPublic) {
      return res.status(403).json({ message: 'Cannot fork private snippets' });
    }

    const forkedSnippet = new Snippet({
      title: `${originalSnippet.title} (Fork)`,
      description: originalSnippet.description,
      code: originalSnippet.code,
      language: originalSnippet.language,
      tags: [...originalSnippet.tags],
      author: req.user._id,
      snippetCollection: 'forks',
      isPublic: false,
      isForked: true,
      originalSnippet: originalSnippet._id
    });

    await forkedSnippet.save();
    await forkedSnippet.populate('author', 'username avatar');

    await Snippet.findByIdAndUpdate(
      originalSnippet._id,
      { $push: { forks: forkedSnippet._id } }
    );

    res.status(201).json({
      message: 'Snippet forked successfully',
      snippet: forkedSnippet
    });
  } catch (error) {
    console.error('Fork snippet error:', error);
    res.status(500).json({ message: 'Server error forking snippet' });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    if (!snippet.isPublic) {
      return res.status(403).json({ message: 'Cannot like private snippets' });
    }

    await snippet.toggleLike(req.user._id);
    
    const isLiked = snippet.likes.includes(req.user._id);

    res.json({
      message: isLiked ? 'Snippet liked successfully' : 'Snippet unliked successfully',
      likesCount: snippet.likes.length,
      isLiked
    });
  } catch (error) {
    console.error('Like snippet error:', error);
    res.status(500).json({ message: 'Server error liking snippet' });
  }
});

router.get('/languages/list', async (req, res) => {
  try {
    const languages = await Snippet.distinct('language', { isPublic: true });
    const languageCounts = await Promise.all(
      languages.map(async (lang) => {
        const count = await Snippet.countDocuments({ language: lang, isPublic: true });
        return { language: lang, count };
      })
    );

    languageCounts.sort((a, b) => b.count - a.count);

    res.json({ languages: languageCounts });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ message: 'Server error fetching languages' });
  }
});

router.get('/tags/list', async (req, res) => {
  try {
    const tags = await Snippet.aggregate([
      { $match: { isPublic: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    res.json({ 
      tags: tags.map(tag => ({ name: tag._id, count: tag.count }))
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error fetching tags' });
  }
});

export default router;
