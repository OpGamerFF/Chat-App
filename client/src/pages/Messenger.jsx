import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Send, Image, Paperclip, MoreVertical, Phone, Video, Search, ChevronLeft, Plus, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import SearchModal from '../components/SearchModal';
import { encryptMessage, decryptMessage } from '../utils/encryption';
import NotesSection from '../components/NotesSection';

const Messenger = () => {
  const { user } = useAuth();
  const { 
    selectedChat, setSelectedChat, 
    chats, fetchChats, 
    messages, setMessages, 
    socket, isTyping 
  } = useChat();
  
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const scrollRef = useRef();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openSearch) {
      setIsSearchOpen(true);
      // Clear the state so it doesn't re-open on every re-render
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const load = async () => {
        setChatsLoading(true);
        await fetchChats();
        setChatsLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const { data } = await axios.get(`/api/messages/${selectedChat._id}`);
          
          // --- NEW: Decrypt old messages if possible ---
          const privateKey = localStorage.getItem('privateKey');
          const decrypted = await Promise.all(data.map(async (msg) => ({
             ...msg,
             content: msg.messageType === 'e2ee' ? await decryptMessage(msg.content, privateKey) : msg.content
          })));

          setMessages(decrypted);
          socket?.emit('join_chat', selectedChat._id);
        } catch (err) {
          console.error(err);
        }
        setLoading(false);
      };
      fetchMessages();
    }
  }, [selectedChat, socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      // --- NEW: E2EE Logic ---
      const otherUser = selectedChat.participants.find(p => p._id !== user._id);
      let contentToSend = newMessage;
      let messageType = 'text';

      if (otherUser?.publicKey) {
        contentToSend = await encryptMessage(newMessage, otherUser.publicKey);
        messageType = 'e2ee';
      }
      // -------------------------

      const { data } = await axios.post('/api/messages', {
        content: contentToSend,
        chatId: selectedChat._id,
        messageType: messageType
      });

      // Show decrypted locally
      const localMsg = { ...data, content: newMessage };
      socket?.emit('new_message', localMsg);
      setMessages([...messages, localMsg]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const getChatName = (chat) => {
    if (chat.chatType === 'group') return chat.groupName;
    const myId = user._id || user.id;
    const otherUser = chat.participants.find(p => (p._id || p).toString() !== myId.toString());
    return typeof otherUser === 'string' ? 'User' : (otherUser?.displayName || otherUser?.username || 'User');
  };

  const getChatAvatar = (chat) => {
    if (chat.chatType === 'group' && chat.groupAvatar) return chat.groupAvatar;
    const myId = user._id || user.id;
    const otherUser = chat.participants.find(p => (p._id || p).toString() !== myId.toString());
    const customAvatar = typeof otherUser === 'object' ? otherUser?.avatar : null;
    if (customAvatar) return customAvatar;
    const seed = typeof otherUser === 'string' ? otherUser : (otherUser?.username || 'default');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };


  return (
    <div className="flex h-screen bg-white dark:bg-dark-900 transition-colors">
      {/* Chats Sidebar */}
      <div className={`w-full md:w-96 border-r border-gray-100 dark:border-dark-800 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 pb-2">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-outfit font-bold dark:text-white">Messages</h1>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 bg-primary-100 dark:bg-primary-900/30 text-primary-500 rounded-xl hover:bg-primary-200 transition-colors shadow-sm active:scale-95"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* --- NEW: Notes Feature --- */}
        <NotesSection />
        {/* ------------------------- */}

        <div className="p-6 pt-4">
          <div className="relative mb-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-gray-50 dark:bg-dark-800 pl-12 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary-400 transition-all border border-transparent dark:border-dark-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 px-3">
          {chatsLoading ? (
            [1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center p-4 rounded-2xl animate-pulse">
                 <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-dark-800" />
                 <div className="ml-4 flex-1">
                    <div className="h-4 w-24 bg-gray-100 dark:bg-dark-800 rounded-lg mb-2" />
                    <div className="h-3 w-full bg-gray-50 dark:bg-dark-900 rounded-lg" />
                 </div>
              </div>
            ))
          ) : chats.map((chat) => (
            <div 
              key={chat._id} 
              onClick={() => setSelectedChat(chat)}
              className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-dark-800 group ${selectedChat?._id === chat._id ? 'bg-primary-50 dark:bg-primary-900/20 shadow-sm' : ''}`}
            >
              <div className="relative">
                <img src={getChatAvatar(chat)} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-dark-700" />
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-dark-800 ${chat.participants.some(p => (p._id || p).toString() !== (user._id || user.id).toString() && p.status === 'online') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              <div className="ml-4 flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-bold truncate ${selectedChat?._id === chat._id ? 'text-primary-600 dark:text-primary-400' : 'dark:text-white'}`}>{getChatName(chat)}</h3>
                  <span className="text-xs text-gray-400">{chat.lastMessage ? format(new Date(chat.lastMessage.createdAt), 'HH:mm') : ''}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-dark-400 truncate">
                   {chat.lastMessage?.content || 'Started a conversation'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Area */}
      <div className={`flex-1 flex flex-col h-full bg-gray-50/50 dark:bg-dark-900/50 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            {/* Header */}
            <header className="px-6 py-4 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-700 flex items-center justify-between">
              <div className="flex items-center">
                <button onClick={() => setSelectedChat(null)} className="mr-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 md:hidden">
                  <ChevronLeft className="dark:text-white" />
                </button>
                <div className="relative">
                  <img src={getChatAvatar(selectedChat)} alt="" className="w-11 h-11 rounded-xl object-cover" />
                </div>
                <div className="ml-4">
                  <h2 className="font-bold dark:text-white">{getChatName(selectedChat)}</h2>
                  <p className="text-xs text-green-500 font-medium">{isTyping ? 'typing...' : 'Online'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"><Phone size={22} /></button>
                <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"><Video size={22} /></button>
                <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"><MoreVertical size={22} /></button>
              </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => {
                const senderId = msg.sender._id || msg.sender;
                const isMine = senderId.toString() === (user._id || user.id).toString();
                const senderUsername = typeof msg.sender === 'string' ? 'User' : msg.sender.username;
                const senderAvatar = typeof msg.sender === 'object' ? msg.sender.avatar : null;
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                   {!isMine && <img src={senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderUsername}`} alt="" className="w-8 h-8 rounded-lg self-end mr-3 mb-1 object-cover" />}
                    <div className={`group relative max-w-[75%] px-5 py-3 rounded-3xl text-sm font-medium shadow-sm ${isMine ? 'bg-primary-500 text-white rounded-br-none' : 'bg-white dark:bg-dark-800 dark:text-white rounded-bl-none'}`}>
                      {msg.content}
                      <span className={`block text-[10px] mt-1 ${isMine ? 'text-primary-100 text-right' : 'text-gray-400'}`}>
                        {format(new Date(msg.createdAt), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </main>

            {/* Input */}
            <footer className="p-6 bg-white dark:bg-dark-800 border-t border-gray-100 dark:border-dark-700">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-4 bg-gray-50 dark:bg-dark-900 p-2 rounded-2xl border border-gray-100 dark:border-dark-700">
                <button type="button" className="p-3 text-gray-400 hover:text-primary-500 transition-colors"><Paperclip size={22} /></button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..." 
                  className="flex-1 bg-transparent py-3 outline-none text-sm dark:text-white"
                />
                <button type="button" className="p-3 text-gray-400 hover:text-primary-500 transition-colors"><Image size={22} /></button>
                <button type="submit" className="bg-primary-500 text-white p-3 rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-600 active:scale-95 transition-all">
                  <Send size={22} />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="bg-primary-50 dark:bg-primary-900/20 p-8 rounded-full mb-6">
              <MessageSquare size={64} className="text-primary-500" />
            </div>
            <h2 className="text-2xl font-outfit font-bold dark:text-white mb-2">Select a chat to start messaging</h2>
            <p className="text-gray-500 dark:text-dark-400 max-w-sm">Choose from your existing conversations or start a new one from the sidebar.</p>
          </div>
        )}
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default Messenger;
