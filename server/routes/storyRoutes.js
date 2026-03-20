const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, storyController.createStory);
router.get('/active', protect, storyController.getStories);
router.post('/:id/seen', protect, storyController.markAsSeen);
router.delete('/:id', protect, storyController.deleteStory);

module.exports = router;
