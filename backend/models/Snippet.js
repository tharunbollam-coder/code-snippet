import mongoose from 'mongoose';

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    trim: true
  },
  programmingLanguage: {
    type: String,
    required: [true, 'Language is required'],
    enum: [
      'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 
      'php', 'ruby', 'go', 'rust', 'typescript', 'html', 
      'css', 'sql', 'bash', 'powershell', 'swift', 'kotlin',
      'scala', 'r', 'perl', 'lua', 'dart', 'elixir', 'haskell'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isForked: {
    type: Boolean,
    default: false
  },
  originalSnippet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Snippet'
  },
  forks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Snippet'
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  snippetCollection: {
    type: String,
    trim: true,
    default: 'uncategorized'
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

snippetSchema.index({ title: 'text', description: 'text' });
snippetSchema.index({ language: 1 });
snippetSchema.index({ author: 1 });
snippetSchema.index({ isPublic: 1 });
snippetSchema.index({ createdAt: -1 });
snippetSchema.index({ tags: 1 });

snippetSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

snippetSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(likeIndex, 1);
  }
  return this.save();
};

export default mongoose.model('Snippet', snippetSchema);
