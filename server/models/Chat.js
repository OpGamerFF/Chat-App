const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  chatType: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct',
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  groupName: {
    type: String,
    trim: true,
  },
  groupAvatar: {
    type: String,
    default: '',
  },
  groupDescription: {
    type: String,
    maxlength: 500,
    default: '',
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  }],
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
}, {
  timestamps: true,
});

chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
