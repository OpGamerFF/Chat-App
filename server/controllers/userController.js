const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { displayName, bio, avatar, username, isPrivate } = req.body;
    
    // If username is changing, check for uniqueness
    if (username) {
        const existing = await User.findOne({ username, _id: { $ne: req.user.id } });
        if (existing) return res.status(400).json({ message: 'Username is already taken' });
    }

    const updates = { displayName, bio, avatar };
    if (username) updates.username = username;
    if (typeof isPrivate === 'boolean') updates.isPrivate = isPrivate;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user.id }
    }).limit(10);
    
    // Add isFollowing and isPending status
    const currentUser = await User.findById(req.user.id);
    const enrichedUsers = users.map(u => ({
        ...u.toObject(),
        isFollowing: currentUser.following.some(id => id.toString() === u._id.toString()),
        isPending: u.followRequests.some(id => id.toString() === currentUser._id.toString())
    }));

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username displayName avatar')
      .populate('following', 'username displayName avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

exports.toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    if (targetUserId === req.user.id) {
        return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const isFollowing = currentUser.following.includes(targetUserId);
    const isPending = targetUser.followRequests.includes(req.user.id);

    if (isFollowing) {
        // Unfollow
        currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user.id);
        await currentUser.save();
        await targetUser.save();
        return res.json({ status: 'unfollowed' });
    } 

    if (isPending) {
        // Cancel request
        targetUser.followRequests = targetUser.followRequests.filter(id => id.toString() !== req.user.id);
        await targetUser.save();
        return res.json({ status: 'canceled' });
    }

    if (targetUser.isPrivate) {
        // Send request
        targetUser.followRequests.push(req.user.id);
        await targetUser.save();
        
        // --- NEW: Socket Notification ---
        const io = req.app.get('socketio');
        if (io) {
            io.to(targetUserId.toString()).emit('follow_request', {
                _id: req.user.id,
                username: req.user.username,
                displayName: req.user.displayName,
                avatar: req.user.avatar
            });
        }
        
        return res.json({ status: 'pending' });
    } else {
        // Follow immediately
        currentUser.following.push(targetUserId);
        targetUser.followers.push(req.user.id);
        await currentUser.save();
        await targetUser.save();
        
        // --- NEW: Socket Notification for Follow ---
        const io = req.app.get('socketio');
        if (io) {
            io.to(targetUserId.toString()).emit('new_follower', {
                _id: req.user.id,
                username: req.user.username,
                displayName: req.user.displayName,
                avatar: req.user.avatar,
                createdAt: new Date(),
            });
        }
        
        return res.json({ status: 'following' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Follow toggle failed', error: error.message });
  }
};

exports.getFollowRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('followRequests', 'username displayName avatar');
    res.json(user.followRequests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
  }
};

exports.acceptFollow = async (req, res) => {
  try {
    const requesterId = req.params.id;
    const me = await User.findById(req.user.id);
    const requester = await User.findById(requesterId);

    if (!me.followRequests.includes(requesterId)) {
        return res.status(400).json({ message: 'No request from this user' });
    }

    // Add to each other
    me.followRequests = me.followRequests.filter(id => id.toString() !== requesterId);
    me.followers.push(requesterId);
    requester.following.push(me._id);

    await me.save();
    await requester.save();

    res.json({ message: 'Follow request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to accept', error: error.message });
  }
};

exports.declineFollow = async (req, res) => {
  try {
    const requesterId = req.params.id;
    const me = await User.findById(req.user.id);

    me.followRequests = me.followRequests.filter(id => id.toString() !== requesterId);
    await me.save();

    res.json({ message: 'Follow request declined' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to decline', error: error.message });
  }
};

exports.giftPoints = async (req, res) => {
  try {
    const { targetUserId, points } = req.body;
    
    // Permission check: Only admin can gift
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can gift points' });
    }

    if (!points || points <= 0) return res.status(400).json({ message: 'Invalid point amount' });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    targetUser.points += parseInt(points);
    await targetUser.save();

    res.json({ message: `Successfully gifted ${points} points to ${targetUser.username}`, points: targetUser.points });
  } catch (error) {
    res.status(500).json({ message: 'Gifting failed', error: error.message });
  }
};
