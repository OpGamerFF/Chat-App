const Story = require('../models/Story');

// Create new story
exports.createStory = async (req, res) => {
  try {
    const { mediaUrl, mediaType, caption } = req.body;
    const story = await Story.create({
      user: req.user._id,
      mediaUrl,
      mediaType,
      caption,
    });

    await story.populate('user', 'username avatar displayName');
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error creating story', error: error.message });
  }
};

// Get current stories from followed users (only active ones)
exports.getStories = async (req, res) => {
  try {
    const following = req.user.following || [];
    const userIds = [req.user._id, ...following];

    const stories = await Story.find({
      user: { $in: userIds },
      expiresAt: { $gt: new Date() } // Should only get unexpired stories
    })
    .sort({ createdAt: -1 })
    .populate('user', 'username avatar displayName');

    // Group stories by user (like Instagram/WhatsApp)
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.user._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: []
        };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {});

    res.json(Object.values(groupedStories));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stories', error: error.message });
  }
};

// Mark story as seen
exports.markAsSeen = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    // Check if the current user already saw this story
    const hasSeen = story.seenBy.some(s => s.user.toString() === req.user._id.toString());
    if (!hasSeen) {
        story.seenBy.push({ user: req.user._id });
        await story.save();
    }
    
    res.json({ message: 'Story marked as seen' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking story as seen', error: error.message });
  }
};

// Delete story manually
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this story' });
    }

    await story.deleteOne();
    res.json({ message: 'Story removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting story', error: error.message });
  }
};
