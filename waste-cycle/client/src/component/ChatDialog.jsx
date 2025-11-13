// client/src/component/ChatDialog.jsx
import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card.jsx';

// 1. 👈 [Import] สิ่งที่ต้องใช้จาก Firebase
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';

// 2. 👈 [Import] db จากไฟล์ Config ที่คุณมี
import { db } from '../firebaseClientConfig.js'; 

export function ChatDialog({ roomId, post, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // ฟังก์ชันเลื่อนลงล่างสุด
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 3. 👈 [หัวใจ Realtime] ใช้ useEffect + onSnapshot เพื่อ "ดักฟัง"
  useEffect(() => {
    if (!roomId) return; // ถ้ายังไม่มี roomId (เช่น App.jsx ยังโหลดไม่เสร็จ) ก็ไม่ต้องทำอะไร

    setLoading(true);
    
    // สร้าง query ไปยัง sub-collection 'messages' ภายในห้องแชต
    const messagesCol = collection(db, 'chat_rooms', roomId, 'messages');
    const q = query(messagesCol, orderBy('timestamp', 'asc')); // เรียงตามเวลา

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

    // 4. 👈 คืนค่าฟังก์ชัน unsubscribe เมื่อ component ถูกปิด (สำคัญมาก!)
    return () => unsubscribe();

  }, [roomId]); // 👈 ให้ Effect นี้ทำงานใหม่ทุกครั้งที่ roomId (ห้องแชต) เปลี่ยน

  // เลื่อนลงล่างสุดเมื่อมีข้อความใหม่
  useEffect(scrollToBottom, [messages]);

  // 5. 👈 [หัวใจการส่ง] ฟังก์ชันส่งข้อความ (Write)
  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      // สร้าง query ไปยัง sub-collection 'messages'
      const messagesCol = collection(db, 'chat_rooms', roomId, 'messages');
      
      // เพิ่มเอกสารใหม่ (ข้อความใหม่)
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

  // 6. 👈 [UI] ผมแก้ไข UI เล็กน้อยให้เป็น Dialog ลอย (Modal)
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

          {/* 7. 👈 [UI] แสดงผลข้อความจริง */}
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
                    {/* 8. 👈 [UI] แปลง Timestamp ของ Firebase */}
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