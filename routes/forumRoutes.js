const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const verifyToken = require('../middleware/authMiddleware');

// Thread Routes
router.post('/add-thread', verifyToken, forumController.addForumThread);
router.get('/threads/:eventId', verifyToken, forumController.getForumThreads);
router.delete('/threads/:threadId/:userId', verifyToken, forumController.deleteForumThread);

// Post Routes
router.get('/thread/:threadId', verifyToken, forumController.getForumPosts);
router.post('/add-post', verifyToken, forumController.addForumPost);
router.delete('/posts/:postId/:userId', verifyToken, forumController.deleteForumPost);

// Voting Routes
// Change POST to PATCH since you are updating existing posts, not creating new ones.
router.patch('/posts/upvote/:postId/:userId', verifyToken, forumController.upvotePost);
router.patch('/posts/downvote/:postId/:userId', verifyToken, forumController.downvotePost);

module.exports = router;
