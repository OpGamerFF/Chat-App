import React, { useState } from 'react';
import axios from 'axios';
import { X, Camera, Loader2 } from 'lucide-react';

const EditProfileModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    displayName: user.displayName || '',
    bio: user.bio || '',
    avatar: user.avatar || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.put('/api/users/profile', formData);
      onUpdate(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-700 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white font-outfit">Edit Profile</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <p className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</p>}
          
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img 
                src={formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`} 
                alt="Avatar Preview" 
                className="w-24 h-24 rounded-full object-cover border-4 border-primary-50 dark:border-primary-900/30 shadow-sm"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <Camera className="text-white" size={24} />
              </div>
            </div>
            <input 
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="Paste Avatar URL"
              className="mt-4 w-full bg-gray-50 dark:bg-dark-900 border-none rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Username</label>
              <input 
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-dark-900 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Display Name</label>
              <input 
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-dark-900 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Bio</label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-dark-900 border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white resize-none h-24"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl hover:bg-primary-600 disabled:opacity-50 transition-all shadow-lg shadow-primary-200 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
