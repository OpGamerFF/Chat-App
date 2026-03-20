const Note = require('../models/Note');
const User = require('../models/User');

// @desc    Create or update note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      // If empty, delete existing note
      await Note.findOneAndDelete({ user: req.user._id });
      return res.status(200).json({ message: 'Note cleared' });
    }

    if (text.length > 60) {
      return res.status(400).json({ message: 'Note must be less than 60 characters' });
    }

    // Upsert note (one note per user)
    const note = await Note.findOneAndUpdate(
      { user: req.user._id },
      { 
        text, 
        expiresAt: new Date(+new Date() + 24 * 60 * 60 * 1000) // Reset expiration on update
      },
      { new: true, upsert: true }
    ).populate('user', 'username displayName avatar');

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active notes from followed users (or all for demo)
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res) => {
  try {
    // For now, let's get all notes or notes from followed users
    // Instagram shows notes from people you follow who follow you back, or close friends
    // Let's just get notes from users the current user follows for now
    const currentUser = await User.findById(req.user._id);
    
    const notes = await Note.find({
      user: { $in: [...currentUser.following, req.user._id] }
    })
    .populate('user', 'username displayName avatar')
    .sort({ createdAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    await Note.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
