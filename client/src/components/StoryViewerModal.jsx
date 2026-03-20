import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StoryViewerModal = ({ isOpen, storyGroup, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
    }
  }, [isOpen, storyGroup]);

  useEffect(() => {
    if (!isOpen || !storyGroup) return;

    const timer = setTimeout(() => {
      if (activeIndex < storyGroup.stories.length - 1) {
        setActiveIndex(activeIndex + 1);
      } else {
        onClose();
      }
    }, 5000); // 5 seconds per story

    return () => clearTimeout(timer);
  }, [activeIndex, isOpen, storyGroup, onClose]);

  if (!isOpen || !storyGroup) return null;

  const currentStory = storyGroup.stories[activeIndex];

  const nextStory = () => {
    if (activeIndex < storyGroup.stories.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-fade-in shadow-2xl">
      <div className="relative w-full max-w-lg aspect-[9/16] bg-dark-900 overflow-hidden md:rounded-3xl shadow-2xl flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-20 flex space-x-1.5 px-2">
          {storyGroup.stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
               <div 
                className={`h-full bg-white transition-all duration-[5000ms] ease-linear rounded-full ${i < activeIndex ? 'w-full !duration-0' : i === activeIndex ? 'w-full' : 'w-0 !duration-0'}`}
               />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-20 flex justify-between items-center px-2">
          <div className="flex items-center space-x-3">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${storyGroup.user.username}`} alt="" className="w-10 h-10 rounded-xl border-2 border-white/20" />
            <div>
              <p className="text-white font-bold text-sm drop-shadow-md">{storyGroup.user.displayName || storyGroup.user.username}</p>
              <p className="text-white/70 text-[10px] drop-shadow-md">{formatDistanceToNow(new Date(currentStory.createdAt))} ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"><MoreHorizontal size={20} /></button>
             <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
               <X size={24} />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          {currentStory.mediaType === 'image' ? (
            <img src={currentStory.mediaUrl} alt="" className="w-full h-full object-contain" />
          ) : (
            <video src={currentStory.mediaUrl} className="w-full h-full object-contain" autoPlay muted playsInline onEnded={nextStory} />
          )}

          {/* Navigation Overlay */}
          <div className="absolute inset-0 z-10 flex">
             <div onClick={prevStory} className="flex-1 cursor-pointer" />
             <div onClick={nextStory} className="flex-1 cursor-pointer" />
          </div>

          <div className="absolute inset-y-0 left-4 z-20 flex items-center md:hidden group">
            <button onClick={prevStory} className="p-2 bg-black/20 text-white rounded-full hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={32} />
            </button>
          </div>
          <div className="absolute inset-y-0 right-4 z-20 flex items-center md:hidden group">
            <button onClick={nextStory} className="p-2 bg-black/20 text-white rounded-full hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={32} />
            </button>
          </div>
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-12 left-0 right-0 p-8 text-center bg-gradient-to-t from-black/80 to-transparent z-20">
            <p className="text-white text-sm font-medium drop-shadow-md">{currentStory.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewerModal;
