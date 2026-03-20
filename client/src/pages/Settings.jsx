import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, AtSign, AlignLeft, Save, ChevronLeft, Loader2, CheckCircle, AlertCircle, Camera, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    isPrivate: user?.isPrivate || false,
    avatar: user?.avatar || ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return setMessage({ type: 'error', text: 'Image too large (max 5MB)' });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data } = await axios.put('/api/users/update', formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // We should ideally reload user in context, but for demo we stay here
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-6 pb-24">
      <div className="flex items-center mb-10">
        <button onClick={() => navigate(-1)} className="mr-6 p-3 bg-gray-100 dark:bg-dark-800 rounded-2xl hover:bg-gray-200 transition-all">
          <ChevronLeft className="dark:text-white" />
        </button>
        <h1 className="text-4xl font-outfit font-bold dark:text-white tracking-tight">Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {message.text && (
          <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-slide-up ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="font-bold text-sm tracking-wide uppercase">{message.text}</p>
          </div>
        )}

        {/* Profile Avatar Upload */}
        <div className="flex flex-col items-center mb-10 group">
            <div className="relative">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gray-100 dark:bg-dark-900 flex items-center justify-center overflow-hidden ring-4 ring-primary-500/20 shadow-2xl border-2 border-white dark:border-dark-700">
                    <img 
                      src={formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                    />
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-2 -right-2 p-3 bg-primary-500 text-white rounded-2xl shadow-xl hover:bg-primary-600 transition-all active:scale-90 ring-4 ring-white dark:ring-dark-800"
                >
                    <Camera size={20} />
                </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-6">Upload Custom PFP</p>
        </div>

        {/* Stats / Gifting (Coming soon?) */}
        {user?.role === 'admin' && (
            <div className="bg-primary-500 rounded-3xl p-6 text-white shadow-xl shadow-primary-500/20 mb-8 relative overflow-hidden group">
                <Gift className="absolute -right-4 -bottom-4 opacity-10 w-24 h-24 group-hover:scale-125 transition-all" />
                <h3 className="font-bold flex items-center"><Gift size={18} className="mr-2" /> Admin Perks</h3>
                <p className="text-xs opacity-80 mt-1">You have permissions to gift points to any user!</p>
            </div>
        )}

        <div className="space-y-6 bg-white dark:bg-dark-800 p-8 rounded-[2rem] border border-gray-100 dark:border-dark-700 shadow-sm">
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    <AtSign size={14} className="mr-2" /> Username
                </label>
                <input 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-dark-900 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-400/20 transition-all border border-transparent dark:border-dark-700 dark:text-white font-medium"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    <User size={14} className="mr-2" /> Display Name
                </label>
                <input 
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-dark-900 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-400/20 transition-all border border-transparent dark:border-dark-700 dark:text-white font-medium"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    <AlignLeft size={14} className="mr-2" /> Bio
                </label>
                <textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-gray-100 dark:bg-dark-900 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-400/20 transition-all border border-transparent dark:border-dark-700 dark:text-white font-medium resize-none"
                />
            </div>

            <div className="flex items-center justify-between pt-4">
                <div>
                    <h4 className="font-bold dark:text-white text-sm">Private Account</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Approve follow requests before they see posts.</p>
                </div>
                <div 
                    onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                    className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${formData.isPrivate ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-700'}`}
                >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${formData.isPrivate ? 'left-6.5' : 'left-0.5'}`} />
                </div>
            </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary-500 text-white font-bold py-5 rounded-3xl shadow-2xl shadow-primary-500/30 hover:bg-primary-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3"
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <>
              <Save size={20} />
              <span className="uppercase tracking-widest">Save Settings</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Settings;
