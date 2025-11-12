// client/src/component/ChatDialog.jsx
import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card.jsx';

// 1. 👈 IMPORT DB จากที่เราสร้างไว้
import { db } from '../firebaseClientConfig.js'; 
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';


export function ChatDialog({ roomId, post, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 2. 👈 [หัวใจ] Effect นี้จะ "ดักฟัง" ข้อความใหม่จาก Firestore
  useEffect(() => {
    if (!roomId) return; // ถ้ายังไม่มี roomId ก็ไม่ต้องทำอะไร

    setLoading(true);
    // สร้าง query ไปยัง sub-collection 'messages' ภายในห้องแชต
    const messagesCol = collection(db, 'chat_rooms', roomId, 'messages');
    const q = query(messagesCol, orderBy('timestamp', 'asc'));

    // onSnapshot คือการเชื่อมต่อแบบ Real-time
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to messages: ", error);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener

  }, [roomId]); // ทำงานใหม่เมื่อ roomId เปลี่ยน

  useEffect(scrollToBottom, [messages]);

  // 3. 👈 [หัวใจ] ฟังก์ชันส่งข้อความ
  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const messagesCol = collection(db, 'chat_rooms', roomId, 'messages');
      
      await addDoc(messagesCol, {
        text: newMessage,
        senderId: currentUser.id,
        senderName: currentUser.displayName,
        timestamp: serverTimestamp() // 👈 ใช้เวลาของ Server
      });

      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>แชทกับ {post.farmName}</CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">{post.title}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <p className="text-center text-gray-500">กำลังโหลดแชต...</p>}
          
          {!loading && messages.length === 0 && (
            <p className="text-center text-gray-500">เริ่มการสนทนา</p>
          )}

          {/* 4. 👈 แสดงผลข้อความจริง */}
          {messages.map((message) => {
            const isMe = message.senderId === currentUser.id;
            return (
              <div
                key={message.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isMe
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p>{message.text}</p>
                  <p
                    className={`text-xs mt-1 text-right ${
                      isMe ? 'text-green-100' : 'text-gray-500'
                    }`}
                  >
                    {/* 5. 👈 แปลง Timestamp ของ Firebase */}
                    {message.timestamp?.toDate ?
                      message.timestamp.toDate().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) :
                      '...'
                    }
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="พิมพ์ข้อความ..."
              className="flex-1"
            />
            <Button onClick={handleSend} className="bg-green-700 hover:bg-green-800">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}