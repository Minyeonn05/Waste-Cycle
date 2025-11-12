import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';

export function ChatDialog({ post, currentUser, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      senderId: post.userId,
      text: 'สวัสดีครับ สนใจมูลสัตว์ของเราไหมครับ',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate response after 1 second
    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        senderId: post.userId,
        text: 'ขอบคุณที่สนใจครับ ยินดีให้คำปรึกษาครับ',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>แชทกับ {post.farmName}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{post.title}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    className={`text-xs mt-1 ${
                      isMe ? 'text-green-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
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
