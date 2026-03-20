const Post = require('../models/Post');
const User = require('../models/User');

// Create new post
exports.createPost = async (req, res) => {
  try {
    const { content, media } = req.body;
    const post = await Post.create({
      user: req.user._id,
      content,
      media: media || []
    });

    await post.populate('user', 'username avatar displayName');
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

// Get feed (posts from people the user follows + their own)
exports.getFeed = async (req, res) => {
  try {
    // Current user + their following list
    const following = req.user.following || [];
    const userIds = [req.user._id, ...following];

    const posts = await Post.find({ user: { $in: userIds } })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar displayName')
      .populate('comments.user', 'username avatar displayName');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feed', error: error.message });
  }
};

// Like/Unlike post
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const likeIndex = post.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
};

// Comment on post
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      user: req.user._id,
      content
    };

    post.comments.push(comment);
    await post.save();
    
    // Return populated post
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username avatar displayName')
      .populate('comments.user', 'username avatar displayName');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};

// Get user posts
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar displayName')
      .populate('comments.user', 'username avatar displayName');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user posts', error: error.message });
  }
};
