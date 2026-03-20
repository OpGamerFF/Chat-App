import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, UserPlus, X, Loader2, MessageCircle, Check } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setSelectedChat, fetchChats } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSearch = async () => {
      if (!query.trim()) return setResults([]);
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/users/search?query=${query}`);
        setResults(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    const timer = setTimeout(handleSearch, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const startChat = async (userId) => {
    try {
      const { data } = await axios.post('/api/chats', { userId });
      setSelectedChat(data);
      fetchChats();
      onClose();
      navigate('/messages');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFollow = async (userId) => {
    try {
      const { data } = await axios.post(`/api/users/follow/${userId}`);
      // status can be 'pending', 'following', 'unfollowed', 'canceled'
      setResults(results.map(u => {
          if (u._id === userId) {
            return { 
                ...u, 
                isFollowing: data.status === 'following',
                isPending: data.status === 'pending'
            };
          }
          return u;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-gray-100 dark:border-dark-700 flex justify-between items-center bg-gray-50/50 dark:bg-dark-900/50">
          <h2 className="text-xl font-outfit font-bold dark:text-white">Find People</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl text-gray-400">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username or name..." 
              className="w-full bg-gray-50 dark:bg-dark-900 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary-400 transition-all border border-transparent dark:border-dark-700 dark:text-white"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary-500" /></div>}
            
            {results.map((u) => (
              <div 
                key={u._id}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-dark-700 group transition-all border border-transparent hover:border-gray-100 dark:hover:border-dark-700"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-dark-600 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold dark:text-white">{u.displayName || u.username}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-400">@{u.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                   <button 
                    onClick={() => startChat(u._id)}
                    title="Start Chat"
                    className="p-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-xl hover:bg-primary-500 hover:text-white transition-all"
                   >
                     <MessageCircle size={18} />
                   </button>
                   <button 
                    onClick={() => toggleFollow(u._id)}
                    title={u.isFollowing ? "Unfollow" : u.isPending ? "Cancel Request" : "Add Friend"}
                    className={`p-2.5 rounded-xl transition-all flex items-center space-x-2 ${u.isFollowing ? 'bg-green-50 text-green-500 border border-green-100' : u.isPending ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-white hover:bg-primary-500 hover:text-white'}`}
                   >
                     {u.isFollowing ? (
                        <>
                          <Check size={18} />
                          <span className="text-xs font-bold">Following</span>
                        </>
                     ) : u.isPending ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span className="text-xs font-bold">Requested</span>
                        </>
                     ) : (
                        <UserPlus size={18} />
                     )}
                   </button>
                </div>
              </div>
            ))}

            {!loading && query && results.length === 0 && (
              <p className="text-center text-gray-500 p-8">No users found for "{query}"</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
