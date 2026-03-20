const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, userController.getMe);
router.get('/search', protect, userController.searchUsers);
router.get('/:id', protect, userController.getUserProfile);
router.put('/update', protect, userController.updateProfile);
router.post('/follow/:id', protect, userController.toggleFollow);
router.get('/requests', protect, userController.getFollowRequests);
router.post('/requests/accept/:id', protect, userController.acceptFollow);
router.post('/requests/decline/:id', protect, userController.declineFollow);
router.post('/gift', protect, userController.giftPoints);

module.exports = router;
