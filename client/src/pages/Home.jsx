import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Sun, Moon, Search, MessageSquare, Compass, Bell, Settings, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchModal from '../components/SearchModal';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-dark-900 min-h-screen">
      <div className="text-center animate-fade-in px-4 max-w-2xl mx-auto">
        <h2 className="text-5xl font-outfit font-bold dark:text-white mb-6">Welcome, {user?.displayName}!</h2>
        <p className="text-gray-500 dark:text-dark-400 text-xl mb-12">Select a conversation or check out your feed to start.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div onClick={() => navigate('/messages', { state: { openSearch: true } })} className="p-8 bg-gray-50 dark:bg-dark-800 rounded-[32px] border-2 border-transparent hover:border-primary-500 transition-all cursor-pointer group shadow-sm">
            <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-2xl flex items-center justify-center text-primary-500 mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">New Message</h3>
            <p className="text-sm text-gray-500 dark:text-dark-400">Start a new private or encrypted chat</p>
          </div>
          
          <div onClick={() => navigate('/feed')} className="p-8 bg-gray-50 dark:bg-dark-800 rounded-[32px] border-2 border-transparent hover:border-primary-500 transition-all cursor-pointer group shadow-sm">
            <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-2xl flex items-center justify-center text-primary-500 mb-6 group-hover:scale-110 transition-transform">
              <Compass size={32} />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">Explore Feed</h3>
            <p className="text-sm text-gray-500 dark:text-dark-400">See what your friends are sharing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
