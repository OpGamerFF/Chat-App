import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageCircle, Share2, MoreHorizontal, Plus, Image as ImageIcon, Video, Send, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CreateStoryModal from '../components/CreateStoryModal';
import StoryViewerModal from '../components/StoryViewerModal';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [postMedia, setPostMedia] = useState(null); // { url, type }
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, storiesRes] = await Promise.all([
          axios.get('/api/posts/feed'),
          axios.get('/api/stories/active')
        ]);
        setPosts(postsRes.data);
        setStories(storiesRes.data);
      } catch (err) {
        console.error('Error fetching feed data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && !postMedia) return;

    try {
      const { data } = await axios.post('/api/posts/create', {
        content: newPostContent,
        media: postMedia ? [postMedia] : []
      });
      setPosts([data, ...posts]);
      setNewPostContent('');
      setPostMedia(null);
    } catch (err) {
      console.error('Error creating post', err);
    }
  };

  const handlePostMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostMedia({
          url: reader.result,
          type: file.type.startsWith('video') ? 'video' : 'image'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const { data } = await axios.post(`/api/posts/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? data : p));
    } catch (err) {
      console.error('Error liking post', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Stories Section */}
      <div className="flex space-x-4 overflow-x-auto pb-6 scrollbar-hide mb-8">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div
            onClick={() => setIsStoryModalOpen(true)}
            className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-dark-700 flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors bg-gray-50 dark:bg-dark-800 group"
          >
            <Plus className="text-gray-400 group-hover:text-primary-500 transition-colors" />
          </div>
          <span className="text-xs mt-2 dark:text-dark-400">Add Story</span>
        </div>

        {stories.map((group) => (
          <div key={group.user._id} className="flex-shrink-0 flex flex-col items-center cursor-pointer" onClick={() => setActiveStoryGroup(group)}>
            <div className="w-16 h-16 p-0.5 rounded-full border-2 border-primary-500 overflow-hidden">
              <img src={group.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${group.user.username}`} alt="" className="w-full h-full rounded-full bg-gray-200 object-cover" />
            </div>
            <span className="text-xs mt-2 truncate max-w-[64px] dark:text-dark-400">{group.user.username}</span>
          </div>
        ))}
      </div>

      {/* Create Post Card */}
      <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-dark-700 mb-8">
        <div className="flex items-start space-x-4">
          <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} className="w-12 h-12 rounded-2xl object-cover" alt="" />
          <div className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full bg-transparent border-none outline-none resize-none text-lg py-2 dark:text-white"
              rows="3"
            />

            {postMedia && (
              <div className="relative mt-2 mb-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-700 aspect-video bg-gray-50 dark:bg-dark-900">
                {postMedia.type === 'image' ? (
                  <img src={postMedia.url} alt="Post media" className="w-full h-full object-cover" />
                ) : (
                  <video src={postMedia.url} className="w-full h-full object-cover" controls />
                )}
                <button
                  onClick={() => setPostMedia(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-dark-700 mt-2">
              <div className="flex space-x-2">
                <label className="p-2.5 text-primary-500 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 transition-colors cursor-pointer">
                  <ImageIcon size={20} />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePostMediaChange} />
                </label>
                <label className="p-2.5 text-primary-500 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 transition-colors cursor-pointer">
                  <Video size={20} />
                  <input type="file" className="hidden" accept="video/*" onChange={handlePostMediaChange} />
                </label>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() && !postMedia}
                className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-600 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-primary-100"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex flex-col space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 dark:bg-dark-800 rounded-3xl animate-pulse" />)}
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden group">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <img src={post.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.username}`} alt="" className="w-11 h-11 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-bold dark:text-white leading-none mb-1">{post.user.displayName || post.user.username}</h4>
                      <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-200 transition-colors"><MoreHorizontal size={20} /></button>
                </div>
                <p className="text-gray-700 dark:text-dark-300 mb-6 whitespace-pre-wrap">{post.content}</p>

                {post.media && post.media.length > 0 && (
                  <div className="rounded-2xl overflow-hidden mb-6 bg-gray-100 dark:bg-dark-900 border border-gray-50 dark:border-dark-700">
                    <img src={post.media[0].url} alt="" className="w-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-6">
                    <button onClick={() => handleToggleLike(post._id)} className={`flex items-center space-x-2 transition-colors ${post.likes?.includes(user?._id) ? 'text-red-500' : 'text-gray-500 dark:text-dark-400 hover:text-red-500'}`}>
                      <Heart size={22} fill={post.likes?.includes(user?._id) ? 'currentColor' : 'none'} />
                      <span className="text-sm font-bold">{post.likes?.length || 0}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 dark:text-dark-400 hover:text-primary-500 transition-colors">
                      <MessageCircle size={22} />
                      <span className="text-sm font-bold">{post.comments?.length || 0}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 dark:text-dark-400 hover:text-primary-500 transition-colors">
                      <Share2 size={22} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        onStoryCreated={(newStory) => {
          // Add the new story to existing stories list (logic would need grouping actually)
          window.location.reload(); // Quickest way to refresh everything
        }}
      />

      <StoryViewerModal 
        isOpen={!!activeStoryGroup} 
        onClose={() => setActiveStoryGroup(null)} 
        storyGroup={activeStoryGroup} 
      />
    </div>
  );
};

export default Feed;
