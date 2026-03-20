const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, chatController.createChat);
router.get('/', protect, chatController.getChats);
router.post('/group', protect, chatController.createGroup);

module.exports = router;
