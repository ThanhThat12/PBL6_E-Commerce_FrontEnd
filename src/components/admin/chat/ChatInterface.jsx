import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Search as SearchIcon } from 'lucide-react';
import './ChatInterface.css';

const ChatInterface = () => {
  // Hide parent scroll when component mounts
  useEffect(() => {
    // Save original overflow values
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    // Find and hide overflow on multiple possible containers
    const containers = [
      document.body,
      document.documentElement,
      document.querySelector('.admin-layout'),
      document.querySelector('.admin-content'),
      document.querySelector('[class*="content"]'),
      document.querySelector('main'),
      document.querySelector('[class*="main"]')
    ].filter(Boolean);
    
    const originalOverflows = containers.map(el => ({
      element: el,
      overflow: el.style.overflow
    }));
    
    // Hide overflow on all containers
    containers.forEach(el => {
      el.style.overflow = 'hidden';
    });
    
    // Restore original overflow when component unmounts
    return () => {
      originalOverflows.forEach(({ element, overflow }) => {
        element.style.overflow = overflow;
      });
    };
  }, []);

  // Mock data for users
  const mockUsers = [
    {
      id: 1,
      name: 'Roberto',
      avatar: 'https://i.pravatar.cc/150?img=12',
      lastMessage: 'Last week, do you remember?',
      time: '02:46 AM',
      isOnline: true,
      unread: false
    },
    {
      id: 2,
      name: 'Lisa Blekcurent',
      avatar: 'https://i.pravatar.cc/150?img=45',
      lastMessage: 'My boss give me that task last...',
      time: '2 min ago',
      isOnline: true,
      unread: true
    },
    {
      id: 3,
      name: 'Olivia Braun',
      avatar: 'https://i.pravatar.cc/150?img=47',
      lastMessage: 'Hei, you forget to upload submi...',
      time: 'Yesterday',
      isOnline: false,
      unread: false
    },
    {
      id: 4,
      name: 'James Sudayat',
      avatar: 'https://i.pravatar.cc/150?img=33',
      lastMessage: 'Hi David, can you send your...',
      time: 'Yesterday',
      isOnline: true,
      unread: false
    },
    {
      id: 5,
      name: 'Eren Yeager',
      avatar: 'https://i.pravatar.cc/150?img=15',
      lastMessage: 'Uhm, can I reschedule meeting?',
      time: '3 days ago',
      isOnline: true,
      unread: false
    },
    {
      id: 6,
      name: 'Eren Yeager',
      avatar: 'https://i.pravatar.cc/150?img=15',
      lastMessage: 'Uhm, can I reschedule meeting?',
      time: '3 days ago',
      isOnline: true,
      unread: false
    },
    {
      id: 7,
      name: 'Eren Yeager',
      avatar: 'https://i.pravatar.cc/150?img=15',
      lastMessage: 'Uhm, can I reschedule meeting?',
      time: '3 days ago',
      isOnline: true,
      unread: false
    },
    {
      id: 8,
      name: 'Eren Yeager',
      avatar: 'https://i.pravatar.cc/150?img=15',
      lastMessage: 'Uhm, can I reschedule meeting?',
      time: '3 days ago',
      isOnline: true,
      unread: false
    },
    {
      id: 9,
      name: 'Eren Yeager',
      avatar: 'https://i.pravatar.cc/150?img=15',
      lastMessage: 'Uhm, can I reschedule meeting?',
      time: '3 days ago',
      isOnline: true,
      unread: false
    },
    {
      id: 10,
      name: 'Eren Yeager',
      avatar: 'https://i.pravatar.cc/150?img=15',
      lastMessage: 'Uhm, can I reschedule meeting?',
      time: '3 days ago',
      isOnline: true,
      unread: false
    },
    {
      id: 11,
      name: 'Eren Yeager',
      avatar: 'https://i.pravatar.cc/150?img=15',
      lastMessage: 'Uhm, can I reschedule meeting?',
      time: '3 days ago',
      isOnline: true,
      unread: false
    },
    {
      id: 12,
      name: 'Eren Yeager',
      avatar: 'https://i.pravatar.cc/150?img=15',
      lastMessage: 'Uhm, can I reschedule meeting?',
      time: '3 days ago',
      isOnline: true,
      unread: false
    }
  ];

  // Mock messages for different users
  const mockMessagesData = {
    1: [
      { id: 1, sender: 'other', text: "Hi everyone! Let's start our discussion now about kick off meeting next week.", time: '10:25 AM' },
      { id: 2, sender: 'other', text: 'Is everyone ok about that schedule?', time: '10:26 AM' },
      { id: 3, sender: 'me', text: 'Uhm, can I reschedule meeting?', time: '10:28 AM' },
      { id: 4, sender: 'me', text: 'I still have 2 task left at that day. I worried can\'t attend that meeting', time: '10:28 AM' }
    ],
    2: [
      { id: 1, sender: 'other', text: 'My boss give me that task last week', time: '9:15 AM' },
      { id: 2, sender: 'me', text: 'What task are you working on?', time: '9:20 AM' }
    ],
    3: [
      { id: 1, sender: 'other', text: 'Hei, you forget to upload submission', time: 'Yesterday' },
      { id: 2, sender: 'me', text: 'Oh sorry, I will upload it soon', time: 'Yesterday' }
    ],
    4: [
      { id: 1, sender: 'other', text: 'Hi David, can you send your report?', time: 'Yesterday' },
      { id: 2, sender: 'me', text: 'Sure, let me check it first', time: 'Yesterday' }
    ],
    5: [
      { id: 1, sender: 'other', text: 'Uhm, can I reschedule meeting?', time: '3 days ago' }
    ]
  };

  // State
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
  const [messages, setMessages] = useState(mockMessagesData[1]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle user selection
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setMessages(mockMessagesData[user.id] || []);
  };

  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  // Filter users based on search
  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-chat-interface">
      {/* Left Sidebar - Chat List */}
      <div className="admin-chat-sidebar">
        <div className="admin-chat-sidebar-header">
          <h2>Chats</h2>
        </div>

        <div className="admin-chat-search-box">
          <input
            type="text"
            className="admin-chat-search-input"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-chat-list">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`admin-chat-item ${selectedUser?.id === user.id ? 'active' : ''}`}
              onClick={() => handleSelectUser(user)}
            >
              <div className="admin-chat-avatar-container">
                <img src={user.avatar} alt={user.name} className="admin-chat-avatar" />
                {user.isOnline && <span className="admin-chat-online-status"></span>}
              </div>
              <div className="admin-chat-info">
                <div className="admin-chat-header">
                  <h4 className="admin-chat-name">{user.name}</h4>
                  <span className="admin-chat-time">{user.time}</span>
                </div>
                <p className={`admin-chat-preview ${user.unread ? 'unread' : ''}`}>
                  {user.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Window */}
      <div className="admin-chat-window">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="admin-chat-window-header">
              <div className="admin-chat-header-user-info">
                <img src={selectedUser.avatar} alt={selectedUser.name} className="admin-chat-header-avatar" />
                <div className="admin-chat-header-details">
                  <h3>{selectedUser.name}</h3>
                  <span className="admin-chat-header-status">
                    {selectedUser.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="admin-chat-header-actions">
                <button className="admin-chat-action-btn">
                  <SearchIcon size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="admin-chat-messages-container">
              {messages.map((message) => (
                <div key={message.id} className={`admin-chat-message ${message.sender === 'other' ? 'received' : 'sent'}`}>
                  {message.sender === 'other' && (
                    <img src={selectedUser.avatar} alt="" className="admin-chat-message-avatar" />
                  )}
                  <div>
                    <div className="admin-chat-message-bubble">
                      {message.text}
                    </div>
                    <div className="admin-chat-message-timestamp">{message.time}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="admin-chat-message-input-area" onSubmit={handleSendMessage}>
              <div className="admin-chat-input-wrapper">
                <input
                  type="text"
                  className="admin-chat-message-input"
                  placeholder="Write your message here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="admin-chat-send-btn"
                disabled={inputText.trim() === ''}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="admin-chat-empty-state">
            <MessageSquare size={64} color="#65676b" />
            <h3>Select a chat</h3>
            <p>Choose a conversation from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
