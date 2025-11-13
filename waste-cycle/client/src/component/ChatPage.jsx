// components/ChatPage.jsx
// หน้าแชทแบบเต็มรูปแบบ (เหมือน WhatsApp/LINE)

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat, useChatRoom } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { chats, loading: chatsLoading, createOrGetChat } = useChat();
  const [selectedChatId, setSelectedChatId] = useState(chatId || null);

  // เลือกแชทแรกถ้าไม่มี chatId
  useEffect(() => {
    if (!selectedChatId && chats.length > 0) {
      setSelectedChatId(chats[0].id);
      navigate(`/chats/${chats[0].id}`, { replace: true });
    }
  }, [chats, selectedChatId]);

  if (chatsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-white border-r flex flex-col">
        <ChatListSidebar 
          chats={chats} 
          selectedChatId={selectedChatId}
          onSelectChat={(id) => {
            setSelectedChatId(id);
            navigate(`/chats/${id}`);
          }}
        />
      </div>

      {/* Main - Chat Room */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <ChatRoomMain chatId={selectedChatId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Chat List Sidebar Component
function ChatListSidebar({ chats, selectedChatId, onSelectChat }) {
  const { user } = useAuth();
  const { deleteChat } = useChat();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.otherUser.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (e, chatId) => {
    e.stopPropagation();
    if (confirm('Delete this chat?')) {
      await deleteChat(chatId);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Messages</h1>
        <input
          type="text"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                selectedChatId === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {chat.otherUser.photoURL ? (
                      <img
                        src={chat.otherUser.photoURL}
                        alt={chat.otherUser.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                        {chat.otherUser.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {chat.otherUser.displayName}
                      </p>
                      {chat.lastMessageAt && (
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-1">
                      {chat.product.name}
                    </p>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                </div>

                {/* Unread Badge & Delete */}
                <div className="flex flex-col items-end ml-2 space-y-1">
                  {chat.unreadCount > 0 && (
                    <span className="px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// Chat Room Main Component
function ChatRoomMain({ chatId }) {
  const { user } = useAuth();
  const { messages, chatInfo, sendMessage, markAsRead } = useChatRoom(chatId);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom เมื่อมีข้อความใหม่
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read เมื่อเปิดแชท
  useEffect(() => {
    if (chatId) {
      markAsRead();
    }
  }, [chatId]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(inputText.trim());
      setInputText('');
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chatInfo) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const otherUser = user.uid === chatInfo.buyerId ? chatInfo.seller : chatInfo.buyer;

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          {otherUser.photoURL ? (
            <img
              src={otherUser.photoURL}
              alt={otherUser.displayName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
              {otherUser.displayName?.charAt(0) || 'U'}
            </div>
          )}
          <div className="ml-3">
            <p className="font-semibold text-gray-900">{otherUser.displayName}</p>
            <p className="text-sm text-gray-600">{chatInfo.product.name}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === user.uid}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows="1"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </>
  );
}

// Message Bubble Component
function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white text-gray-900 rounded-bl-none'
        }`}
      >
        {message.type === 'image' && message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Sent image"
            className="rounded-lg mb-2 max-w-full"
          />
        )}
        {message.text && (
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        )}
        <div className="flex items-center justify-end mt-1 space-x-1">
          <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(message.createdAt)}
          </span>
          {isOwn && (
            <span className="text-xs text-blue-100">
              {message.status === 'read' ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper: Format time
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay && date.getDate() === now.getDate()) {
    // Today - show time
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diff < oneDay * 7) {
    // This week - show day
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    // Older - show date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
}