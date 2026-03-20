const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 60,
  },
  // TTL Index: Note expires after 24 hours
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000),
    index: { expires: 0 },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Note', noteSchema);
