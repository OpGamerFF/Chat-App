import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Music, Zap, MoreHorizontal, X } from 'lucide-react';

const NotesSection = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const { data } = await axios.get('/api/notes');
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSaveNote = async () => {
    try {
      await axios.post('/api/notes', { text: noteText });
      setIsModalOpen(false);
      setNoteText('');
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const myNote = notes.find(n => (n.user._id || n.user) === (user._id || user.id));
  const otherNotes = notes.filter(n => (n.user._id || n.user) !== (user._id || user.id));

const NoteCard = ({ note, isMe }) => (
    <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group active:scale-95 transition-all duration-300">
      <div className="relative mb-3">
        {/* Note Bubble */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-[20px] shadow-xl min-w-[80px] max-w-[130px] animate-in zoom-in duration-500 z-20 ${
          isMe ? 'bg-white dark:bg-slate-800' : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm'
        } border border-slate-100/50 dark:border-slate-700/50 shadow-primary-500/10`}>
           {isMe && !note && (
             <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-wider">Pulse status</p>
           )}
           {note && (
             <>
               <p className="text-xs text-slate-900 dark:text-slate-100 font-bold text-center line-clamp-2 leading-tight">
                 {note.text}
               </p>
               {/* Bubble pointer */}
               <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${
                 isMe ? 'bg-white dark:bg-slate-800' : 'bg-white/90 dark:bg-slate-800/90'
               } border-r border-b border-slate-100/50 dark:border-slate-700/50`}></div>
             </>
           )}
        </div>

        {/* User Avatar with Pulse Gradient */}
        <div className={`relative p-0.5 rounded-full transition-all duration-500 group-hover:scale-105 ${
          isMe ? 'bg-gradient-to-tr from-primary-600 to-indigo-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800'
        }`}>
          <div className="bg-white dark:bg-slate-900 rounded-full p-1">
             <img 
               src={note?.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${isMe ? user.username : (note?.user?.username || 'default')}`} 
               alt="" 
               className="w-16 h-16 rounded-full object-cover shadow-inner" 
             />
          </div>
          {isMe && (
            <div className="absolute bottom-0 right-0 bg-primary-600 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-900 shadow-lg">
              <Plus size={14} strokeWidth={3} />
            </div>
          )}
        </div>
      </div>
      <p className={`text-[11px] font-bold truncate w-20 text-center uppercase tracking-tighter ${
        isMe ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'
      }`}>
        {isMe ? 'You' : (note?.user?.displayName || note?.user?.username)}
      </p>
    </div>
  );

  return (
    <div className="w-full py-4 border-b border-gray-100 dark:border-dark-800">
      <div className="flex items-center space-x-6 overflow-x-auto px-6 no-scrollbar pb-2">
        {/* My Note */}
        <div onClick={() => setIsModalOpen(true)}>
          <NoteCard isMe={true} note={myNote} />
        </div>

        {/* Others */}
        {otherNotes.map((note) => (
          <NoteCard key={note._id} note={note} />
        ))}
      </div>

      {/* Modal for setting note */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="relative p-6 pt-12 text-center">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="relative inline-block mb-6">
                 {/* Preview Bubble */}
                 <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-dark-700 px-4 py-2 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-600 min-w-[100px] z-10">
                    <p className="text-sm font-medium dark:text-white opacity-50">
                      {noteText || 'What\'s on your mind?'}
                    </p>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white dark:bg-dark-700 border-r border-b border-gray-100 dark:border-dark-600 rotate-45"></div>
                 </div>
                 <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="" className="w-20 h-20 rounded-full border-4 border-primary-50 shadow-sm" />
              </div>

              <h3 className="text-xl font-bold dark:text-white mb-2 font-outfit">Leave a note</h3>
              <p className="text-sm text-gray-500 mb-8 px-4">See what others are up to. Your note will be visible for 24 hours.</p>

              <div className="relative mb-8">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value.slice(0, 60))}
                  placeholder="Share a thought..."
                  className="w-full bg-gray-50 dark:bg-dark-900 border-none rounded-2xl p-5 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white resize-none h-24"
                />
                <span className="absolute bottom-3 right-4 text-[11px] text-gray-400 font-medium">
                  {noteText.length}/60
                </span>
              </div>

              <button
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
                className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl hover:bg-primary-600 disabled:opacity-50 transition-all shadow-lg shadow-primary-200"
              >
                Share note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesSection;
