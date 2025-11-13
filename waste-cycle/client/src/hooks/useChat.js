// hooks/useChat.js
// React Hook สำหรับ Chat System พร้อม Realtime Updates

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  limit,
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase-config'; // Firebase Firestore instance

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export function useChat() {
  const { user, makeRequest } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);

  // ดึงรายการ chats และ listen realtime
  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query chats ที่เป็น buyer หรือ seller
    const buyerQuery = query(
      collection(db, 'chats'),
      where('buyerId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const sellerQuery = query(
      collection(db, 'chats'),
      where('sellerId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    // Listen to both queries
    const unsubscribe1 = onSnapshot(buyerQuery, (snapshot) => {
      updateChats(snapshot, 'buyer');
    }, (err) => {
      console.error('Chat listener error:', err);
      setError(err.message);
      setLoading(false);
    });

    const unsubscribe2 = onSnapshot(sellerQuery, (snapshot) => {
      updateChats(snapshot, 'seller');
    }, (err) => {
      console.error('Chat listener error:', err);
      setError(err.message);
      setLoading(false);
    });

    setLoading(false);

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [user]);

  // รวมและอัปเดต chats
  const updateChats = useCallback((snapshot, type) => {
    setChats(prevChats => {
      const newChats = new Map();

      // เก็บ chats เดิม
      prevChats.forEach(chat => {
        newChats.set(chat.id, chat);
      });

      // อัปเดตจาก snapshot
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        newChats.set(doc.id, {
          id: doc.id,
          ...data,
          unreadCount: data.unreadCount?.[user.uid] || 0,
          otherUser: user.uid === data.buyerId ? data.seller : data.buyer
        });
      });

      // แปลงเป็น array และเรียง
      const chatArray = Array.from(newChats.values());
      chatArray.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      return chatArray;
    });
  }, [user]);

  // คำนวณ total unread
  useEffect(() => {
    const total = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
    setTotalUnread(total);
  }, [chats]);

  // สร้างหรือดึง chat room
  const createOrGetChat = async (productId, sellerId) => {
    try {
      const result = await makeRequest('/chats', {
        method: 'POST',
        body: JSON.stringify({ productId, sellerId })
      });

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Create chat error:', err);
      throw err;
    }
  };

  // ส่งข้อความ
  const sendMessage = async (chatId, text, imageUrl = null) => {
    try {
      const result = await makeRequest(`/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ 
          text, 
          imageUrl,
          type: imageUrl ? 'image' : 'text'
        })
      });

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Send message error:', err);
      throw err;
    }
  };

  // ทำเครื่องหมายว่าอ่านแล้ว
  const markAsRead = async (chatId) => {
    try {
      await makeRequest(`/chats/${chatId}/read`, {
        method: 'PUT'
      });
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  // ลบแชท
  const deleteChat = async (chatId) => {
    try {
      const result = await makeRequest(`/chats/${chatId}`, {
        method: 'DELETE'
      });

      if (result.success) {
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      }
      
      return result;
    } catch (err) {
      console.error('Delete chat error:', err);
      throw err;
    }
  };

  return {
    chats,
    loading,
    error,
    totalUnread,
    createOrGetChat,
    sendMessage,
    markAsRead,
    deleteChat
  };
}

// Hook สำหรับแชทเดี่ยว
export function useChatRoom(chatId) {
  const { user, makeRequest } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatInfo, setChatInfo] = useState(null);

  // ดึงข้อมูล chat room
  useEffect(() => {
    if (!chatId || !user) return;

    const fetchChatInfo = async () => {
      try {
        const result = await makeRequest(`/chats/${chatId}`);
        if (result.success) {
          setChatInfo(result.data);
        }
      } catch (err) {
        console.error('Fetch chat info error:', err);
      }
    };

    fetchChatInfo();
  }, [chatId, user]);

  // Listen to messages realtime
  useEffect(() => {
    if (!chatId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = [];
      snapshot.docs.forEach(doc => {
        newMessages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setMessages(newMessages);
      setLoading(false);
    }, (err) => {
      console.error('Messages listener error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId, user]);

  // ส่งข้อความ
  const sendMessage = async (text, imageUrl = null) => {
    try {
      const result = await makeRequest(`/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ 
          text, 
          imageUrl,
          type: imageUrl ? 'image' : 'text'
        })
      });

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Send message error:', err);
      throw err;
    }
  };

  // ทำเครื่องหมายว่าอ่านแล้ว
  const markAsRead = async () => {
    try {
      await makeRequest(`/chats/${chatId}/read`, {
        method: 'PUT'
      });
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  return {
    messages,
    chatInfo,
    loading,
    error,
    sendMessage,
    markAsRead
  };
}

// ตัวอย่างการใช้งาน
/*
// ChatList.jsx
function ChatList() {
  const { chats, loading, totalUnread, deleteChat } = useChat();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Messages {totalUnread > 0 && `(${totalUnread})`}</h1>
      {chats.map(chat => (
        <ChatListItem key={chat.id} chat={chat} onDelete={deleteChat} />
      ))}
    </div>
  );
}

// ChatRoom.jsx
function ChatRoom({ chatId }) {
  const { messages, chatInfo, sendMessage, markAsRead } = useChatRoom(chatId);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    markAsRead();
  }, [chatId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await sendMessage(inputText);
    setInputText('');
  };

  return (
    <div>
      <h2>{chatInfo?.product.name}</h2>
      <div className="messages">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
      </div>
      <input 
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
*/