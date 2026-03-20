const Chat = require('../models/Chat');

exports.createChat = async (req, res) => {
  const { userId } = req.body;
  
  try {
    const existingChat = await Chat.findOne({
      chatType: 'direct',
      participants: { $all: [req.user.id, userId], $size: 2 }
    }).populate('participants', '-password').populate('lastMessage');

    if (existingChat) return res.json(existingChat);

    const newChat = await Chat.create({
      chatType: 'direct',
      participants: [req.user.id, userId]
    });
    
    const fullChat = await Chat.findById(newChat._id).populate('participants', '-password');
    res.status(201).json(fullChat);
  } catch (err) {
    res.status(500).json({ message: 'Error creating chat', error: err.message });
  }
};

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: { $in: [req.user.id] } })
      .populate('participants', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching chats', error: err.message });
  }
};

exports.createGroup = async (req, res) => {
  const { participants, groupName, groupDescription, groupAvatar } = req.body;
  if (!participants || participants.length < 2) {
    return res.status(400).json({ message: 'Group must have at least 2 other members' });
  }

  const allParticipants = [...participants, req.user.id];

  try {
    const newChat = await Chat.create({
      chatType: 'group',
      participants: allParticipants,
      groupName,
      groupDescription,
      groupAvatar,
      admins: [req.user.id],
      createdBy: req.user.id
    });
    
    const fullChat = await Chat.findById(newChat._id).populate('participants', '-password');
    res.status(201).json(fullChat);
  } catch (err) {
    res.status(500).json({ message: 'Error creating group', error: err.message });
  }
};
