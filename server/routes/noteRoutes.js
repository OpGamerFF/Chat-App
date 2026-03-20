const express = require('express');
const router = express.Router();
const { createNote, getNotes, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes are protected

router.route('/')
  .post(createNote)
  .get(getNotes)
  .delete(deleteNote);

module.exports = router;
