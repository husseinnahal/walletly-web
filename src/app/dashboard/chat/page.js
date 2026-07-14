'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { toast } from 'sonner';
import { 
  Send, 
  Search, 
  MessageSquare, 
  ArrowLeft,
  Circle,
  Clock,
  Trash2,
  Check,
  CheckCheck
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

function ChatContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // States
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const [recipientLastSeen, setRecipientLastSeen] = useState(null);

  // References
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchContacts();
    }
  }, [user]);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('accessToken');
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to chat socket');
    });

    // Listen for new messages
    socket.on('message_received', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
      
      // Update conversations list last message snippet
      setConversations((prev) => 
        prev.map((c) => 
          c._id === msg.conversationId 
            ? { ...c, lastMessage: msg, updatedAt: new Date().toISOString() } 
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    });

    // Listen for typing indicators
    socket.on('user_typing', (data) => {
      if (activeConversation) {
        const recipient = getRecipient(activeConversation);
        if (data.userId === recipient._id) {
          setPeerTyping(data.isTyping);
        }
      }
    });

    // Listen for dynamic active/offline status updates
    socket.on('user_status_change', (data) => {
      if (activeConversation) {
        const recipient = getRecipient(activeConversation);
        if (data.userId === recipient._id) {
          setIsRecipientOnline(data.isOnline);
          if (!data.isOnline && data.lastSeen) {
            setRecipientLastSeen(data.lastSeen);
          }
        }
      }
    });

    // Handle online status check responses
    socket.on('status_response', (data) => {
      if (activeConversation) {
        const recipient = getRecipient(activeConversation);
        if (data.userId === recipient._id) {
          setIsRecipientOnline(data.isOnline);
          setRecipientLastSeen(data.lastSeen);
        }
      }
    });

    // Handle background notification triggers
    socket.on('new_message_notification', (data) => {
      // Refresh conversations list to show unread message badges or snippets
      fetchConversations();

      // Show toast if not viewing this active chat
      if (!activeConversation || activeConversation._id !== data.conversationId) {
        toast(`New message from ${data.message.sender.username}`, {
          description: data.message.text,
          action: {
            label: 'View',
            onClick: () => {
              // Open this conversation
              const found = conversations.find(c => c._id === data.conversationId);
              if (found) {
                setActiveConversation(found);
              } else {
                fetchConversations().then((res) => {
                  const refreshed = res?.find(c => c._id === data.conversationId);
                  if (refreshed) setActiveConversation(refreshed);
                });
              }
            }
          }
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, activeConversation, conversations]);

  // Fetch past message log when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
      
      // Join socket room
      if (socketRef.current) {
        socketRef.current.emit('join_room', activeConversation._id);
        
        // Query online/last seen status
        const recipient = getRecipient(activeConversation);
        if (recipient._id) {
          socketRef.current.emit('check_status', recipient._id);
        }
      }
    }

    return () => {
      if (activeConversation && socketRef.current) {
        socketRef.current.emit('leave_room', activeConversation._id);
      }
      setPeerTyping(false);
      setIsRecipientOnline(false);
      setRecipientLastSeen(null);
    };
  }, [activeConversation]);

  // Handle direct redirection from Investment profiles
  useEffect(() => {
    const targetUserId = searchParams.get('userId');
    if (targetUserId && contacts.length > 0) {
      initiateConversation(targetUserId);
    }
  }, [searchParams, contacts]);

  // Scroll to latest message
  useEffect(() => {
    scrollToBottom();
  }, [messages, peerTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await apiFetch('/chats');
      if (res.success) {
        setConversations(res.conversations || []);
        return res.conversations;
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await apiFetch('/chats/contacts');
      if (res.success) {
        setContacts(res.contacts || []);
      }
    } catch (err) {
      console.error('Failed to load contacts', err);
    }
  };

  const fetchMessages = async (conversationId) => {
    setLoadingMessages(true);
    try {
      const res = await apiFetch(`/chats/${conversationId}/messages`);
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Initiate or fetch conversation ID with recipient user
  const initiateConversation = async (recipientId) => {
    try {
      const res = await apiFetch('/chats/initiate', {
        method: 'POST',
        body: JSON.stringify({ recipientId })
      });
      if (res.success) {
        const conv = res.conversation;
        // Add to list if not already there
        setConversations((prev) => {
          if (prev.some((c) => c._id === conv._id)) return prev;
          return [conv, ...prev];
        });
        setActiveConversation(conv);
        setSearchTerm(''); // Clear contact search bar
      }
    } catch (err) {
      console.error('Failed to initiate conversation', err);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!confirm('Are you sure you want to delete this chat? This will remove it from your chat history.')) return;
    try {
      const res = await apiFetch(`/chats/${conversationId}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setConversations((prev) => prev.filter((c) => c._id !== conversationId));
        setActiveConversation(null);
        toast.success('Chat deleted from your list');
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
      toast.error('Could not delete conversation');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation || !socketRef.current) return;

    // Send via socket
    socketRef.current.emit('send_message', {
      conversationId: activeConversation._id,
      text: messageText.trim()
    });

    setMessageText('');
    
    // Trigger typing stop immediately
    socketRef.current.emit('typing', {
      conversationId: activeConversation._id,
      isTyping: false
    });
    setIsTyping(false);
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    if (!activeConversation || !socketRef.current) return;

    // Send typing status
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing', {
        conversationId: activeConversation._id,
        isTyping: true
      });
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing', {
        conversationId: activeConversation._id,
        isTyping: false
      });
      setIsTyping(false);
    }, 2000);
  };

  // Extract recipient details for active conversation
  const getRecipient = (conv) => {
    if (!conv || !user) return {};
    return conv.participants.find((p) => p._id !== user._id) || {};
  };

  // Filter contacts by username
  const filteredContacts = contacts.filter((contact) => 
    contact.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format last seen timestamp into a human-readable string
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Offline';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Online';
      if (diffMins < 60) return `Last seen ${diffMins}m ago`;
      if (diffHours < 24) return `Last seen ${diffHours}h ago`;
      return `Last seen on ${date.toLocaleDateString()}`;
    } catch (e) {
      return 'Offline';
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden rounded-3xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl">
      
      {/* LEFT PANEL: CONVERSATION LIST / SEARCH */}
      <div className={`w-full md:w-80 flex flex-col border-r border-gray-100 dark:border-neutral-800 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Search header */}
        <div className="p-4 border-b border-gray-50 dark:border-neutral-800/40">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users to start new chat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-neutral-950/40 text-sm border-none outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-white font-bold"
            />
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {searchTerm ? (
            // Contacts directory view (Only visible when user actively searches)
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-indigo-500 tracking-wider px-3 mb-2">Search Contacts</p>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <button
                    key={contact._id}
                    onClick={() => initiateConversation(contact._id)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-neutral-800/30 transition text-left font-bold"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden border border-indigo-100/50 dark:border-indigo-900/30">
                      {contact.avatar ? (
                        <img src={contact.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        contact.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{contact.username}</h4>
                      <p className="text-[11px] text-gray-400 truncate">{contact.email}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-xs text-gray-400 p-4 text-center">No contacts match "{searchTerm}"</p>
              )}
            </div>
          ) : (
            // Active chats view (Default view: Only users you have actually chatted with)
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider px-3 mb-2">My Chat History</p>
              {conversations.length > 0 ? (
                conversations.map((conv) => {
                  const recipient = getRecipient(conv);
                  const isSelected = activeConversation?._id === conv._id;
                  const lastMsg = conv.lastMessage;
                  
                  return (
                    <button
                      key={conv._id}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-left ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/10' : 'hover:bg-gray-50/80 dark:hover:bg-neutral-800/20'}`}
                    >
                      <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-gray-700 dark:text-neutral-300 overflow-hidden shrink-0 border border-gray-200/50 dark:border-neutral-700/30">
                        {recipient.avatar ? (
                          <img src={recipient.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          recipient.username?.charAt(0).toUpperCase() || '?'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className={`text-sm truncate leading-tight ${isSelected ? 'font-black text-indigo-600 dark:text-indigo-400' : 'font-bold text-gray-800 dark:text-neutral-200'}`}>
                            {recipient.username || 'Anonymous'}
                          </h4>
                          {conv.updatedAt && (
                            <span className="text-[10px] text-gray-400 font-medium">
                              {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate leading-snug">
                          {lastMsg ? lastMsg.text : 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <MessageSquare className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-xs font-bold">No active chats yet</p>
                  <p className="text-[11px] text-gray-400 mt-1">Start chats directly from investments, or use the search bar above to find a contact.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CHAT WINDOW */}
      <div className={`flex-1 flex flex-col bg-gray-50/30 dark:bg-neutral-950/10 ${!activeConversation ? 'hidden md:flex justify-center items-center p-8' : 'flex'}`}>
        
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="h-16 px-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900 shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveConversation(null)} 
                  className="md:hidden p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden border border-indigo-100/50 dark:border-indigo-900/30 animate-scale-up">
                  {getRecipient(activeConversation).avatar ? (
                    <img src={getRecipient(activeConversation).avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getRecipient(activeConversation).username?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                    {getRecipient(activeConversation).username || 'Anonymous'}
                  </h3>
                  {isRecipientOnline ? (
                    <span className="text-[10px] font-bold text-green-500 flex items-center gap-1.5">
                      <Circle className="h-1.5 w-1.5 fill-current animate-ping" /> Active Now
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {formatLastSeen(recipientLastSeen)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action menu buttons (e.g. Delete conversation) */}
              <div className="flex items-center">
                <button 
                  onClick={() => handleDeleteConversation(activeConversation._id)}
                  title="Delete Chat for me"
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Body (Message log list) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isOwn = msg.sender._id === user._id || msg.sender === user._id;
                    return (
                      <div 
                        key={msg._id} 
                        className={`flex flex-col max-w-[80%] ${isOwn ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className={`p-3 rounded-2xl text-sm ${isOwn ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/10 animate-scale-up' : 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100 border border-gray-100 dark:border-neutral-800 rounded-bl-none animate-scale-up'}`}>
                          <p className="leading-relaxed font-bold break-words">{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[9px] text-gray-400 font-medium">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && (
                            msg.isRead ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-500" title="Read" />
                            ) : (
                              <CheckCheck className="w-3.5 h-3.5 text-gray-300 dark:text-neutral-600" title="Sent (Unread)" />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Typing Indicator Bubble */}
                  {peerTyping && (
                    <div className="flex flex-col items-start mr-auto max-w-[80%] animate-pulse">
                      <div className="p-3 bg-white dark:bg-neutral-900 text-gray-400 rounded-2xl rounded-bl-none border border-gray-100 dark:border-neutral-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input Footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex gap-2 shrink-0 animate-slide-up">
              <input
                type="text"
                placeholder="Type your message here..."
                value={messageText}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-neutral-950/40 border-none outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-white font-bold"
              />
              <button 
                type="submit" 
                disabled={!messageText.trim()}
                className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center shrink-0 disabled:bg-gray-100 dark:disabled:bg-neutral-800 disabled:text-gray-400 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-3xl mx-auto mb-4 text-indigo-500 border border-indigo-100/50 dark:border-indigo-900/30">
              💬
            </div>
            <h3 className="text-base font-black text-gray-800 dark:text-white mb-1">Your Walletly Chatroom</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">Select a chat on the left sidebar to read messages, or click 'Chat' on investment cards to initiate new conversations.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-140px)] w-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
