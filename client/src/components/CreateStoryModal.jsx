import React, { useState } from 'react';
import axios from 'axios';
import { X, Image as ImageIcon, Video, Send, Loader2 } from 'lucide-react';

const CreateStoryModal = ({ isOpen, onClose, onStoryCreated }) => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return;

    setLoading(true);
    try {
      const { data } = await axios.post('/api/stories/create', {
        mediaUrl,
        mediaType,
        caption
      });
      onStoryCreated(data);
      onClose();
      // Reset form
      setMediaUrl('');
      setCaption('');
    } catch (err) {
      console.error('Error creating story', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result);
        setMediaType(file.type.startsWith('video') ? 'video' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-gray-100 dark:border-dark-700 flex justify-between items-center bg-gray-50/50 dark:bg-dark-900/50">
          <h2 className="text-xl font-outfit font-bold dark:text-white">Add New Story</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl text-gray-400">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="relative group">
            {mediaUrl ? (
              <div className="relative aspect-[9/16] bg-gray-100 dark:bg-dark-900 rounded-3xl overflow-hidden border-2 border-primary-500 shadow-xl">
                 {mediaType === 'image' ? (
                   <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <video src={mediaUrl} className="w-full h-full object-cover" controls />
                 )}
                 <button 
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                 >
                   <X size={20} />
                 </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[9/16] border-2 border-dashed border-gray-200 dark:border-dark-700 rounded-3xl cursor-pointer hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-dark-900/50 transition-all group">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-full group-hover:scale-110 transition-transform mb-4">
                  <ImageIcon size={48} className="text-primary-500" />
                </div>
                <span className="text-gray-500 dark:text-dark-400 font-bold">Select Photo or Video</span>
                <span className="text-xs text-gray-400 mt-2">Stories last for 24 hours</span>
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
              </label>
            )}
          </div>

          <div>
            <input 
              type="text" 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..." 
              className="w-full bg-gray-50 dark:bg-dark-900 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary-400 transition-all border border-transparent dark:border-dark-700 dark:text-white"
            />
          </div>

          <button 
            type="submit" 
            disabled={!mediaUrl || loading}
            className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-200 hover:bg-primary-600 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <span>Share Story</span>
                <Send size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStoryModal;
