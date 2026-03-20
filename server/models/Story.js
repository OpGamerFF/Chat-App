const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image',
  },
  caption: {
    type: String,
    maxlength: 200,
  },
  seenBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    seenAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isArchived: {
    type: Boolean,
    default: false,
  },
  // We'll keep the TTL but stories will only be "archived" if moved before deletion
  // Or we just remove TTL and handle 24h visibility in queries.
  // Removal of TTL is better for "Archive" feature.
}, {
  timestamps: true,
});

module.exports = mongoose.model('Story', storySchema);
