import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { decryptMessage } from '../utils/encryption';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, accessToken } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (user && accessToken) {
      // Connect to the absolute URL in production, or relative in dev proxy
      const socketUrl = import.meta.env.VITE_API_URL || '/';
      const newSocket = io(socketUrl, {
        withCredentials: true,
      });
      setSocket(newSocket);
      newSocket.emit('setup', user);
      
      newSocket.on('message_received', async (newMessage) => {
        // Update chat list dynamically (bring to top)
        setChats(prev => {
          const chatIndex = prev.findIndex(c => c._id === newMessage.chat._id);
          if (chatIndex === -1) {
            fetchChats();
            return prev;
          }
          const updatedChat = { ...prev[chatIndex], lastMessage: newMessage };
          const newList = [updatedChat, ...prev.filter(c => c._id !== newMessage.chat._id)];
          return newList;
        });

        if (!selectedChat || selectedChat._id !== newMessage.chat._id) {
           // Create notification
           if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`New message from ${newMessage.sender.username}`, {
                  body: newMessage.content,
                  icon: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMessage.sender.username}`
              });
           }
        } else {
          // Decrypt if necessary
          const privateKey = localStorage.getItem('privateKey');
          const decryptedMsg = {
             ...newMessage,
             content: newMessage.messageType === 'e2ee' ? await decryptMessage(newMessage.content, privateKey) : newMessage.content
          };
          setMessages((prev) => [...prev, decryptedMsg]);
        }
      });

      newSocket.on('follow_request', (requestData) => {
        if ("Notification" in window && Notification.permission === "granted") {
           new Notification(`New follow request from ${requestData.username}`, {
               body: `${requestData.displayName || requestData.username} wants to connect with you.`,
               icon: requestData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${requestData.username}`
           });
        }
      });

      newSocket.on('new_follower', (followerData) => {
        if ("Notification" in window && Notification.permission === "granted") {
           new Notification(`New follower!`, {
               body: `${followerData.displayName || followerData.username} started following you.`,
               icon: followerData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${followerData.username}`
           });
        }
      });

      return () => newSocket.disconnect();
    }
  }, [user, accessToken]);

  const fetchChats = async () => {
    try {
      const { data } = await axios.get('/api/chats');
      setChats(data);
    } catch (err) {
      console.error('Error fetching chats', err);
    }
  };

  return (
    <ChatContext.Provider value={{
      selectedChat, setSelectedChat,
      chats, setChats,
      messages, setMessages,
      socket, fetchChats,
      typing, setTyping,
      isTyping, setIsTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
