import express from 'express';
import User from '../models/User.js';
import Snippet from '../models/Snippet.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findOne({ username })
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const snippets = await Snippet.find({ 
      author: user._id, 
      isPublic: true 
    })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Snippet.countDocuments({ 
      author: user._id, 
      isPublic: true 
    });

    const stats = await Snippet.aggregate([
      { $match: { author: user._id } },
      {
        $group: {
          _id: null,
          totalSnippets: { $sum: 1 },
          publicSnippets: {
            $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } }
        }
      }
    ]);

    res.json({
      user,
      snippets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSnippets: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      stats: stats[0] || {
        totalSnippets: 0,
        publicSnippets: 0,
        totalViews: 0,
        totalLikes: 0
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      username: { $regex: q, $options: 'i' }
    })
      .select('username avatar bio')
      .limit(parseInt(limit))
      .lean();

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error searching users' });
  }
});

router.get('/stats/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await Snippet.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalSnippets: { $sum: 1 },
          publicSnippets: {
            $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
          },
          privateSnippets: {
            $sum: { $cond: [{ $eq: ['$isPublic', false] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } },
          totalForks: { $sum: { $size: '$forks' } }
        }
      }
    ]);

    const languageStats = await Snippet.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const collectionStats = await Snippet.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$collection',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overall: stats[0] || {
        totalSnippets: 0,
        publicSnippets: 0,
        privateSnippets: 0,
        totalViews: 0,
        totalLikes: 0,
        totalForks: 0
      },
      languages: languageStats,
      collections: collectionStats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error fetching user statistics' });
  }
});

router.get('/liked-snippets', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const snippets = await Snippet.find({
      _id: { $in: req.user.likedSnippets || [] },
      isPublic: true
    })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Snippet.countDocuments({
      _id: { $in: req.user.likedSnippets || [] },
      isPublic: true
    });

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
    console.error('Get liked snippets error:', error);
    res.status(500).json({ message: 'Server error fetching liked snippets' });
  }
});

export default router;
