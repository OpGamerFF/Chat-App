import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Grid, Clock, Loader2, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const Archive = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        // We'll Fetch all stories for current user (active or archived)
        const { data } = await axios.get('/api/stories/me');
        setStories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArchive();
  }, []);

  return (
    <div className="flex-1 bg-white dark:bg-dark-900 min-h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto py-8 px-6">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition text-black dark:text-white">
              <ChevronLeft size={28} />
            </button>
            <h1 className="text-xl font-bold dark:text-white font-outfit">Archive</h1>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-dark-800 px-4 py-2 rounded-xl">
             <Clock size={18} className="text-gray-500" />
             <span className="text-sm font-semibold dark:text-white">Stories Archive</span>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary-500 mb-4" size={40} />
            <p className="text-gray-500 animate-pulse">Loading your memories...</p>
          </div>
        ) : stories.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
            {stories.map((story) => (
              <div key={story._id} className="relative aspect-[9/16] rounded-xl overflow-hidden group cursor-pointer border border-gray-100 dark:border-dark-800 shadow-sm transition hover:shadow-md">
                <img src={story.mediaUrl} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                   <p className="text-[10px] text-white font-bold uppercase tracking-wider mb-1">
                     {format(new Date(story.createdAt), 'MMM d, yyyy')}
                   </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-gray-50 dark:bg-dark-800 p-8 rounded-full mb-6">
               <ImageIcon size={64} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold dark:text-white mb-2 font-outfit">No Archived Stories</h3>
            <p className="text-gray-500 dark:text-dark-400 max-w-sm">Your stories will automatically be saved to your archive after 24 hours.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
