import React, { useState, useEffect } from 'react';
import { Bell, UserPlus, Heart, MessageCircle, ChevronLeft, Check, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import axios from 'axios';

const Notifications = () => {
  const navigate = useNavigate();
  const { socket } = useChat();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/users/requests');
        setRequests(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchRequests();

    if (socket) {
        socket.on('follow_request', (newRequest) => {
            setRequests(prev => [newRequest, ...prev]);
        });
        return () => socket.off('follow_request');
    }
  }, [socket]);

  const handleRequest = async (id, action) => {
    try {
      await axios.post(`/api/users/requests/${action === 'add' ? 'accept' : 'decline'}/${id}`);
      setRequests(requests.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Placeholder notifications
  const notifications = [
    { id: 1, type: 'follow', user: 'Sarah Wilson', content: 'started following you', time: '2m ago' },
    // ... rest of placeholders
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 h-full flex flex-col">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="mr-4 p-2.5 bg-gray-100 dark:bg-dark-800 rounded-xl hover:bg-gray-200 transition-colors">
          <ChevronLeft className="dark:text-white" />
        </button>
        <h1 className="text-3xl font-outfit font-bold dark:text-white">Notifications</h1>
      </div>

      {/* Follow Requests Section */}
      {requests.length > 0 && (
        <div className="mb-10">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Pending Requests</h3>
           <div className="space-y-3">
              {requests.map((r) => (
                <div key={r._id} className="bg-white dark:bg-dark-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-700 flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.username}`} alt="" className="w-12 h-12 bg-gray-100 dark:bg-dark-900 rounded-2xl" />
                      <div>
                         <p className="dark:text-white font-bold">{r.displayName || r.username}</p>
                         <p className="text-xs text-gray-400">wants to follow you</p>
                      </div>
                   </div>
                   <div className="flex space-x-2">
                      <button 
                        onClick={() => handleRequest(r._id, 'accept')}
                        className="p-2.5 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-600 transition-all font-bold text-xs px-4"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleRequest(r._id, 'decline')}
                        className="p-2.5 bg-gray-100 dark:bg-dark-700 text-gray-500 rounded-xl hover:bg-gray-200 transition-all font-bold text-xs px-4"
                      >
                        Decline
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Rest of notifications */}
        {notifications.map((n) => {
          const getIcon = (type) => {
            switch(type) {
              case 'follow': return <UserPlus className="text-blue-500" size={20} />;
              case 'like': return <Heart className="text-red-500" size={20} fill="currentColor" />;
              case 'comment': return <MessageCircle className="text-primary-500" size={20} />;
              default: return <Bell className="text-gray-500" size={20} />;
            }
          };

          return (
            <div key={n.id} className="bg-white dark:bg-dark-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-700 transition-all cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-dark-900 rounded-2xl flex items-center justify-center">
                    {getIcon(n.type)}
                </div>
                <div>
                    <p className="dark:text-white font-medium">
                      <span className="font-bold">{n.user}</span> {n.content}
                    </p>
                    <span className="text-xs text-gray-400 font-medium">{n.time}</span>
                </div>
              </div>
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="bg-gray-100 dark:bg-dark-800 p-8 rounded-full mb-4">
                <Bell size={48} className="text-gray-400" />
             </div>
             <h3 className="text-xl font-bold dark:text-white">All caught up!</h3>
             <p className="text-gray-500 dark:text-dark-400">No new notifications for you.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
