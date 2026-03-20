const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Validation rules
const validateRegistration = [
  body('username').isLength({ min: 3 }).withMessage('Username must be 3 characters or more'),
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6 characters or more'),
];

router.post('/register', validateRegistration, authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.get('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
