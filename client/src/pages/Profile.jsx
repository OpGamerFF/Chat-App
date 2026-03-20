import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Grid, Bookmark, User as UserIcon, Loader2, Camera, Heart, MessageCircle } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user: currentUser, setUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const targetId = id || (currentUser?._id || currentUser?.id);
      
      // Fixed the 404 error: Path should be /api/users/:id
      const { data } = await axios.get(`/api/users/${targetId}`);
      setProfileUser(data);

      // Fetch user's posts
      const postsRes = await axios.get(`/api/posts/user/${targetId}`);
      setPosts(postsRes.data);
      
    } catch (err) {
      console.error('Profile Load Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, currentUser]);

  const handleUpdate = (updatedUser) => {
    setUser(updatedUser);
    setProfileUser(updatedUser);
  };

  const handleFollow = async () => {
    try {
      const { data } = await axios.post(`/api/users/follow/${profileUser._id}`);
      
      setProfileUser(prev => {
        const newProfile = { ...prev };
        const myId = currentUser._id || currentUser.id;
        
        if (data.status === 'following') {
           newProfile.followers = [...(newProfile.followers || []), { _id: myId }];
           newProfile.isFollowing = true;
           newProfile.isPending = false;
        } else if (data.status === 'unfollowed') {
           newProfile.followers = (newProfile.followers || []).filter(f => (f._id || f).toString() !== myId.toString());
           newProfile.isFollowing = false;
        } else if (data.status === 'pending') {
           newProfile.isPending = true;
        } else if (data.status === 'canceled') {
           newProfile.isPending = false;
        }
        return newProfile;
      });
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center dark:bg-dark-900">
      <Loader2 className="animate-spin text-primary-500" size={48} />
    </div>
  );

  const isMe = (profileUser?._id || profileUser?.id) === (currentUser?._id || currentUser?.id);
  const myIdStr = (currentUser?._id || currentUser?.id)?.toString();
  
  let isFollowing = profileUser?.isFollowing;
  if (isFollowing === undefined && profileUser?.followers) {
    isFollowing = profileUser.followers.some(f => (f._id || f).toString() === myIdStr);
  }
  
  let isPending = profileUser?.isPending;
  if (isPending === undefined && profileUser?.followRequests) {
    isPending = profileUser.followRequests.some(f => (f._id || f).toString() === myIdStr);
  }

  return (
    <div className="flex-1 bg-white dark:bg-dark-900 min-h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-20 mb-16">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-gray-100 dark:border-dark-700 p-1 bg-white">
             <img 
               src={profileUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser?.username}`} 
               className="w-full h-full rounded-full object-cover" 
               alt={profileUser?.username}
             />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <h2 className="text-xl font-normal dark:text-white">{profileUser?.username}</h2>
              <div className="flex space-x-2">
                {isMe ? (
                  <>
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-4 py-1.5 bg-gray-100 dark:bg-dark-800 rounded-lg text-sm font-semibold dark:text-white hover:bg-gray-200 dark:hover:bg-dark-700 transition"
                    >
                      Edit profile
                    </button>
                    <button 
                      onClick={() => navigate('/archive')}
                      className="px-4 py-1.5 bg-gray-100 dark:bg-dark-800 rounded-lg text-sm font-semibold dark:text-white hover:bg-gray-200 dark:hover:bg-dark-700 transition"
                    >
                      View archive
                    </button>
                    <Settings className="dark:text-white cursor-pointer ml-2" size={24} />
                  </>
                ) : (
                  <button 
                    onClick={handleFollow}
                    className={`px-8 py-1.5 rounded-lg text-sm font-semibold transition ${isFollowing ? 'bg-gray-100 dark:bg-dark-800 dark:text-white text-black hover:bg-red-50 hover:text-red-500 hover:border-red-100' : isPending ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-primary-500 text-white hover:bg-primary-600'}`}
                  >
                    {isFollowing ? 'Following' : isPending ? 'Requested' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center md:justify-start space-x-8 mb-6 text-sm">
              <span className="dark:text-white font-medium"><strong className="font-bold">{posts.length}</strong> posts</span>
              <span className="dark:text-white font-medium"><strong className="font-bold">{profileUser?.followers?.length || 0}</strong> followers</span>
              <span className="dark:text-white font-medium"><strong className="font-bold">{profileUser?.following?.length || 0}</strong> following</span>
            </div>
            
            <div className="dark:text-white">
              <h3 className="font-bold text-sm mb-1">{profileUser?.displayName || profileUser?.username}</h3>
              <p className="text-sm font-normal whitespace-pre-wrap">{profileUser?.bio || 'No bio yet.'}</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-t border-gray-100 dark:border-dark-800 flex justify-center space-x-12">
           <div className="flex items-center space-x-2 py-4 border-t-2 border-black dark:border-white -mt-[1px] cursor-pointer">
              <Grid size={12} className="dark:text-white" />
              <span className="text-[12px] font-bold uppercase tracking-widest dark:text-white">Posts</span>
           </div>
           <div className="flex items-center space-x-2 py-4 text-gray-400 cursor-pointer hover:text-gray-600 transition">
              <Bookmark size={12} />
              <span className="text-[12px] font-bold uppercase tracking-widest">Saved</span>
           </div>
           <div className="flex items-center space-x-2 py-4 text-gray-400 cursor-pointer hover:text-gray-600 transition">
              <UserIcon size={12} />
              <span className="text-[12px] font-bold uppercase tracking-widest">Tagged</span>
           </div>
        </div>
        
        {/* Grid Area */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-8 mt-4">
             {posts.map(post => (
               <div key={post._id} className="aspect-square bg-gray-100 dark:bg-dark-800 rounded-lg overflow-hidden relative group cursor-pointer transition-transform hover:scale-[1.02]">
                  {post.media && post.media.length > 0 ? (
                    <img src={post.media[0]} className="w-full h-full object-cover" alt="post" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 text-[10px] italic dark:text-dark-400 overflow-hidden line-clamp-4">
                       {post.content}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white space-x-6 transition-opacity duration-200">
                     <div className="flex items-center space-x-1.5">
                       <Heart size={20} fill="white" />
                       <span className="font-bold">{post.likes?.length || 0}</span>
                     </div>
                     <div className="flex items-center space-x-1.5">
                       <MessageCircle size={20} fill="white" />
                       <span className="font-bold">{post.comments?.length || 0}</span>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-16 h-16 border-2 border-black dark:border-white rounded-full flex items-center justify-center mb-4">
               <Camera size={32} className="dark:text-white" />
             </div>
             <h3 className="text-3xl font-extrabold dark:text-white mb-2 font-outfit">No Posts Yet</h3>
             <p className="text-sm dark:text-dark-400 max-w-xs mx-auto">When they share photos or notes, they will appear on their profile.</p>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <EditProfileModal 
          user={profileUser} 
          onClose={() => setIsEditModalOpen(false)} 
          onUpdate={handleUpdate} 
        />
      )}
    </div>
  );
};

export default Profile;

