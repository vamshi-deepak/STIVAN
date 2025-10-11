const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createPost, getFeed, toggleLike, getComments, addComment } = require('../controllers/communityController');

// Feed
router.get('/feed', auth, getFeed);

// Create post
router.post('/posts', auth, createPost);

// Likes
router.post('/posts/:id/like', auth, toggleLike);

// Comments
router.get('/posts/:id/comments', auth, getComments);
router.post('/posts/:id/comments', auth, addComment);

module.exports = router;
