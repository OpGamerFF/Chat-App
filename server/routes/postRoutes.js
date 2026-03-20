const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, postController.createPost);
router.get('/feed', protect, postController.getFeed);
router.get('/user/:id', protect, postController.getUserPosts);
router.post('/:id/like', protect, postController.toggleLike);
router.post('/:id/comment', protect, postController.addComment);
router.delete('/:id', protect, postController.deletePost);

module.exports = router;
