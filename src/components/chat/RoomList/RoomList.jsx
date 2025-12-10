import React, { useState } from 'react';
import './RoomList.css';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Store, HelpCircle, Search } from 'lucide-react';

/**
 * RoomList - Danh sách các conversation
 */
const RoomList = ({ conversations = [], selectedConversationId, onSelectConversation, onCreateSupportChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  console.log('🏠 RoomList render - conversations:', conversations);
  
  const getConversationIcon = (type) => {
    switch (type) {
      case 'SHOP':
        return <Store size={20} />;
      case 'SUPPORT':
        return <HelpCircle size={20} />;
      default:
        return null;
    }
  };

  const getConversationTitle = (conversation) => {
    if (conversation.type === 'SHOP') {
      return conversation.shopName || 'Shop';
    } else if (conversation.type === 'SUPPORT') {
      // For admin, show user name; for user, show "Hỗ trợ khách hàng"
      return conversation.otherParticipantName || 'Hỗ trợ khách hàng';
    }
    return 'Conversation';
  };

  const getConversationSubtitle = (conversation) => {
    if (conversation.lastMessage) {
      const content = conversation.lastMessage.content;
      return content.length > 30 ? content.substring(0, 30) + '...' : content;
    }
    return 'Chưa có tin nhắn';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true,
        locale: vi 
      });
    } catch (error) {
      return '';
    }
  };

  // Check if there's already a SUPPORT conversation
  const hasSupportConversation = conversations.some(conv => conv.type === 'SUPPORT');

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const title = getConversationTitle(conversation).toLowerCase();
    const subtitle = getConversationSubtitle(conversation).toLowerCase();
    const participantName = (conversation.otherParticipantName || '').toLowerCase();
    
    return title.includes(query) || 
           subtitle.includes(query) || 
           participantName.includes(query);
  });

  return (
    <div className="room-list">
      {/* Search Input */}
      <div className="room-search">
        <Search size={18} className="room-search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm cuộc trò chuyện..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="room-search-input"
        />
      </div>

      {/* Fixed Support Chat Button */}
      <div
        className={`room-item support-item ${!hasSupportConversation ? 'highlighted' : ''}`}
        onClick={onCreateSupportChat}
      >
        <div className="room-icon support-icon">
          <HelpCircle size={20} />
        </div>
        <div className="room-info">
          <div className="room-header">
            <h4 className="room-title">Hỗ trợ khách hàng</h4>
          </div>
          <p className="room-subtitle">Chat với đội ngũ hỗ trợ</p>
        </div>
      </div>

      {/* Separator */}
      {filteredConversations.length > 0 && (
        <div className="room-list-separator">
          <span>Cuộc trò chuyện của bạn</span>
        </div>
      )}

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="room-list-empty">
          <p>{searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}</p>
        </div>
      ) : (
        filteredConversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`room-item ${selectedConversationId === conversation.id ? 'active' : ''} ${conversation.unreadCount > 0 ? 'unread' : ''}`}
          onClick={() => onSelectConversation(conversation.id)}
        >
          <div className="room-icon">
            {getConversationIcon(conversation.type)}
          </div>
          <div className="room-info">
            <div className="room-header">
              <h4 className="room-title">{getConversationTitle(conversation)}</h4>
              <span className="room-time">
                {formatTime(conversation.lastActivityAt || conversation.createdAt)}
              </span>
            </div>
            <p className="room-last-message">{getConversationSubtitle(conversation)}</p>
          </div>
          {conversation.unreadCount > 0 && (
            <span className="room-unread-badge">{conversation.unreadCount}</span>
          )}
        </div>
      )))}
    </div>
  );
};

export default RoomList;
