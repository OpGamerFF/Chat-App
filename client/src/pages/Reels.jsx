import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Music } from 'lucide-react';

const REELS_DATA = [
  {
    id: 1,
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    user: 'chillvibes',
    description: 'Beautiful sunset vibes today 🌅 #nature #aesthetic',
    song: 'Original Audio - chillvibes',
    likes: 1240,
    comments: 84
  },
  {
    id: 2,
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    user: 'traveler_diary',
    description: 'Lost in the mountains 🏔️ #explore #mountains',
    song: 'Mountain Sound - Of Monsters',
    likes: 8900,
    comments: 215
  },
  {
    id: 3,
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    user: 'aesthetic_cars',
    description: 'Late night drives 🚘🌃 #cars #nightdrive',
    song: 'Nightcall - Kavinsky',
    likes: 4500,
    comments: 63
  }
];

const Reel = ({ reel, isActive }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(e => console.log('Autoplay prevented', e));
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full h-full snap-start flex justify-center bg-black">
      {/* Video element */}
      <video
        ref={videoRef}
        src={reel.url}
        className="h-full w-full object-cover lg:max-w-md cursor-pointer"
        loop
        playsInline
        onClick={togglePlay}
      />

      {/* Play Pause Overlay */}
      {!isPlaying && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="bg-black/40 rounded-full p-4 p-8 backdrop-blur-md">
             <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
           </div>
         </div>
      )}

      {/* User Info Overlay */}
      <div className="absolute bottom-4 left-4 right-16 lg:left-1/2 lg:-translate-x-[calc(224px-16px)] text-white z-10 w-full max-w-[calc(100%-80px)] lg:max-w-xs">
        <h3 className="font-bold text-lg mb-2 flex items-center space-x-2 drop-shadow-md">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.user}`} className="w-8 h-8 rounded-full bg-white/20" alt="" />
          <span>@{reel.user}</span>
        </h3>
        <p className="text-sm mb-3 drop-shadow-md line-clamp-2">{reel.description}</p>
        <div className="flex items-center space-x-2 text-sm bg-black/40 px-3 py-1.5 rounded-full w-max backdrop-blur-sm border border-white/10">
          <Music size={14} className="animate-spin-slow" />
          <span className="truncate max-w-[150px]">{reel.song}</span>
        </div>
      </div>

      {/* Action Buttons Overlay */}
      <div className="absolute bottom-8 right-4 lg:right-1/2 lg:translate-x-[calc(224px-16px)] flex flex-col items-center space-y-6 z-10">
        <button onClick={() => setIsLiked(!isLiked)} className="flex flex-col items-center group">
          <div className="bg-black/40 p-3 rounded-full backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition">
             <Heart size={28} className={isLiked ? "text-red-500 fill-red-500" : "text-white"} />
          </div>
          <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{isLiked ? reel.likes + 1 : reel.likes}</span>
        </button>

        <button className="flex flex-col items-center group">
          <div className="bg-black/40 p-3 rounded-full backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition">
            <MessageCircle size={28} className="text-white" />
          </div>
          <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{reel.comments}</span>
        </button>

        <button className="flex flex-col items-center group">
          <div className="bg-black/40 p-3 rounded-full backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition">
            <Share2 size={28} className="text-white" />
          </div>
          <span className="text-white text-xs font-bold mt-1 drop-shadow-md">Share</span>
        </button>

        <button className="flex flex-col items-center group">
          <div className="bg-black/40 p-3 rounded-full backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition">
             <MoreHorizontal size={28} className="text-white" />
          </div>
        </button>
      </div>
    </div>
  );
};

const Reels = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollPosition = containerRef.current.scrollTop;
    const blockHeight = containerRef.current.clientHeight;
    const currentIndex = Math.round(scrollPosition / blockHeight);
    
    if (currentIndex !== activeIndex) {
      setActiveIndex(currentIndex);
    }
  };

  return (
    <div className="flex-1 bg-black h-[100dvh] overflow-hidden -mt-16 sm:mt-0 relative">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide pb-16 sm:pb-0"
        style={{ scrollBehavior: 'smooth' }}
      >
        {REELS_DATA.map((reel, index) => (
          <Reel key={reel.id} reel={reel} isActive={index === activeIndex} />
        ))}
      </div>
    </div>
  );
};

export default Reels;
