const Message = require('../models/Message');
const Chat = require('../models/Chat');

exports.sendMessage = async (req, res) => {
  const { chatId, content, messageType, media } = req.body;

  try {
    const message = await Message.create({
      chat: chatId,
      sender: req.user.id,
      content,
      messageType,
      media,
      deliveredTo: [{ user: req.user.id }]
    });

    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });
    
    const fullMessage = await Message.findById(message._id)
      .populate('sender', 'username displayName avatar status')
      .populate('chat');
      
    res.status(201).json(fullMessage);
  } catch (err) {
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'username displayName avatar')
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: { user: req.user.id } } },
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Error marking read', error: err.message });
  }
};
