const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const User = require('../models/User');
const { getIO } = require('../realtime/io');

// Create a new public post
exports.createPost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { content, ideaId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }
    const post = await Post.create({ user: userId, content: content.trim(), idea: ideaId || undefined });
    const populated = await Post.findById(post._id)
      .populate('user', 'name profilePicture')
      .populate('idea', 'title score verdict')
      .lean();

    // realtime
    try { getIO().emit('post:new', populated); } catch {}

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create post', details: err.message });
  }
};

// Fetch feed
exports.getFeed = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { tab = 'all', page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (tab === 'my') {
      query.user = userId;
    }

    let sort = { createdAt: -1 };
    if (tab === 'top') {
      sort = { likesCount: -1, commentsCount: -1, createdAt: -1 };
    }

    const posts = await Post.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name profilePicture')
      .populate('idea', 'title score verdict')
      .lean();

    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load feed', details: err.message });
  }
};

// Toggle like
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params; // post id

    const existing = await Like.findOne({ post: id, user: userId });
    let liked = false;
    if (existing) {
      await existing.deleteOne();
    } else {
      await Like.create({ post: id, user: userId });
      liked = true;
    }

    // Recompute likesCount cheaply
    const likesCount = await Like.countDocuments({ post: id });
    await Post.findByIdAndUpdate(id, { likesCount });

    // realtime
    try { getIO().emit('like:update', { postId: id, likesCount, userId, liked }); } catch {}

    res.json({ success: true, data: { postId: id, likesCount, liked } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle like', details: err.message });
  }
};

// Comments
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params; // post id
    const comments = await Comment.find({ post: id })
      .sort({ createdAt: 1 })
      .populate('user', 'name profilePicture')
      .lean();
    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load comments', details: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params; // post id
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }
    const comment = await Comment.create({ post: id, user: userId, text: text.trim() });
    // increment counter
    const commentsCount = await Comment.countDocuments({ post: id });
    await Post.findByIdAndUpdate(id, { commentsCount });

    const populated = await Comment.findById(comment._id).populate('user', 'name profilePicture').lean();

    // realtime
    try { getIO().emit('comment:new', populated); } catch {}

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add comment', details: err.message });
  }
};
