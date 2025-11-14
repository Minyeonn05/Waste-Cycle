import { useState, useEffect, useRef } from 'react';
import { Send, Search, ArrowLeft, Check, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// Removed: import type { User, ChatRoom as AppChatRoom, Post } from '../App';
// Removed: interface ChatPageProps { ... }
// Removed: interface ChatRoom { ... }
// Removed: interface Message { ... }

export function ChatPage({ user, chatRooms, posts, confirmedRoomIds, chatMessages, setChatMessages, onBack, onConfirmSale, onCancelChat }) {
  const [selectedRoomId, setSelectedRoomId] = useState(chatRooms.length > 0 ? chatRooms[chatRooms.length - 1].id : null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showChatView, setShowChatView] = useState(false); // สำหรับ mobile view
  const [activeTab, setActiveTab] = useState('chat'); // Tab สำหรับ แชท/คนที่มาติดต่อ
  const messagesEndRef = useRef(null);

  const selectedRoom = chatRooms.find(room => room.id === selectedRoomId);
  const selectedPost = selectedRoom ? posts.find(p => p.id === selectedRoom.postId) : null;
  const messages = selectedRoomId ? (chatMessages[selectedRoomId] || []) : [];
  const isConfirmed = selectedRoomId ? confirmedRoomIds.has(selectedRoomId) : false;
  
  // แบ่งห้องแชทตาม: แชท (ที่เรากำลังซื้อ) และ คนที่มาติดต่อ (ที่เรากำลังขาย)
  const myChats = chatRooms.filter(room => room.buyerId === user.id); // ห้องที่เราเป็นผู้ซื้อ
  const contactRequests = chatRooms.filter(room => room.sellerId === user.id); // ห้องที่เราเป็นผู้ขาย
  
  const filteredMyChats = myChats.filter(room =>
    room.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.farmName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredContactRequests = contactRequests.filter(room =>
    room.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.farmName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const displayRooms = activeTab === 'chat' ? filteredMyChats : filteredContactRequests;

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedRoomId) return;

    const message = { // Removed : Message
      id: Date.now().toString(),
      senderId: user.id,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedRoomId]: [...(prev[selectedRoomId] || []), message],
    }));
    setNewMessage('');

    // Simulate response after 1 second
    setTimeout(() => {
      const response = { // Removed : Message
        id: (Date.now() + 1).toString(),
        senderId: selectedRoomId,
        text: 'ได้เลยครับ ยินดีให้บริการครับ',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => ({
        ...prev,
        [selectedRoomId]: [...(prev[selectedRoomId] || []), response],
      }));
    }, 1000);
  };

  const handleRoomClick = (roomId) => { // Removed : string
    setSelectedRoomId(roomId);
    setShowChatView(true); // แสดงหน้าแชทบน mobile
  };

  const handleBackToList = () => {
    setShowChatView(false);
    setSelectedRoomId(null);
  };

  const handleCancelChat = () => {
    if (!selectedRoomId) return;
    if (onCancelChat) {
      onCancelChat(selectedRoomId);
    }
    setSelectedRoomId(null);
    setShowChatView(false); // กลับไปหน้า list
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50">
      <div className="h-full">
        {/* Desktop Header - แสดงเฉพาะบน desktop */}
        <div className="hidden lg:block container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
            </Button>
            <h1 className="text-2xl">ข้อความ</h1>
          </div>
        </div>

        {/* Desktop View - แสดง 2 คอลัมน์ */}
        <div className="hidden lg:block container mx-auto px-4 h-[calc(100%-5rem)]">
          <div className="grid grid-cols-3 gap-4 h-full">
            {/* Chat List */}
            <Card className="col-span-1 overflow-hidden">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Search */}
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
                    <TabsTrigger value="chat" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-600">
                      แชท
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-600">
                      คนที่มาติดต่อ
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="flex-1 overflow-y-auto m-0">
                    {filteredMyChats.map(room => {
                      const displayName = room.sellerId === user.id ? room.buyerName : room.sellerName;
                      return (
                        <div
                          key={room.id}
                          onClick={() => handleRoomClick(room.id)}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedRoomId === room.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">{displayName[0]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium truncate">{displayName}</p>
                                <span className="text-xs text-gray-500">{room.timestamp}</span>
                              </div>
                              <p className="text-sm text-gray-600 truncate">{room.farmName}</p>
                              <p className="text-sm text-gray-500 truncate">{room.lastMessage}</p>
                            </div>
                            {room.unread > 0 && (
                              <Badge className="bg-red-500 text-white">{room.unread}</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {filteredMyChats.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        <p>ไม่มีการสนทนาวันนี้</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="contact" className="flex-1 overflow-y-auto m-0">
                    {filteredContactRequests.map(room => {
                      const displayName = room.sellerId === user.id ? room.buyerName : room.sellerName;
                      return (
                        <div
                          key={room.id}
                          onClick={() => handleRoomClick(room.id)}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedRoomId === room.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">{displayName[0]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium truncate">{displayName}</p>
                                <span className="text-xs text-gray-500">{room.timestamp}</span>
                              </div>
                              <p className="text-sm text-gray-600 truncate">{room.farmName}</p>
                              <p className="text-sm text-gray-500 truncate">{room.lastMessage}</p>
                            </div>
                            {room.unread > 0 && (
                              <Badge className="bg-red-500 text-white">{room.unread}</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {filteredContactRequests.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        <p>ไม่มีประวัติการสนทนา</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Chat Messages */}
            <Card className="col-span-2 overflow-hidden">
              {selectedRoom ? (
                <CardContent className="p-0 h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span>{(selectedRoom.sellerId === user.id ? selectedRoom.buyerName : selectedRoom.sellerName)[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium">{selectedRoom.sellerId === user.id ? selectedRoom.buyerName : selectedRoom.sellerName}</p>
                          <p className="text-sm text-gray-600">{selectedRoom.farmName}</p>
                        </div>
                      </div>
                      
                      {/* Action Buttons or Confirmed Badge */}
                      {isConfirmed ? (
                        <Badge className="bg-green-100 text-green-800 px-3 py-2">
                          ✓ คุณได้กดยืนยันแล้ว
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (!selectedRoom) return;
                              if (onConfirmSale) {
                                onConfirmSale(selectedRoom.postId, selectedRoom.id);
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            ยืนยัน
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelChat}
                            className="border-red-500 text-red-500 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            ยกเลิก
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map(message => {
                      const isMe = message.senderId === user.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isMe
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-900 border'
                            }`}
                          >
                            <p>{message.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isMe ? 'text-green-100' : 'text-gray-500'
                              }`}
                            >
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t bg-white">
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
                </CardContent>
              ) : (
                <CardContent className="h-full flex items-center justify-center">
                  <p className="text-gray-500">เลือกการสนทนาเพื่อเริ่มแชท</p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>

        {/* Mobile View - แสดงหน้าเดียวเต็มจอ */}
        <div className="lg:hidden h-full">
          {/* หน้า List - แสดงเมื่อยังไม่เลือกแชท */}
          {!showChatView ? (
            <div className="h-full flex flex-col bg-white">
              {/* Header */}
              <div className="p-4 border-b bg-white flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl">ข้อความ</h1>
              </div>

              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="ค้นหาการสนทนา..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Chat Rooms List */}
              <div className="flex-1 overflow-y-auto">
                {displayRooms.map(room => {
                  const displayName = room.sellerId === user.id ? room.buyerName : room.sellerName;
                  return (
                    <div
                      key={room.id}
                      onClick={() => handleRoomClick(room.id)}
                      className="p-4 border-b cursor-pointer active:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">{displayName[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium truncate">{displayName}</p>
                            <span className="text-xs text-gray-500">{room.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{room.farmName}</p>
                          <p className="text-sm text-gray-500 truncate">{room.lastMessage}</p>
                        </div>
                        {room.unread > 0 && (
                          <Badge className="bg-red-500 text-white">{room.unread}</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* หน้าแชท - แสดงเต็มจอเหมือน Messenger */
            selectedRoom && (
              <div className="h-full flex flex-col bg-white">
                {/* Chat Header */}
                <div className="p-4 border-b bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Button variant="ghost" size="sm" onClick={handleBackToList} className="p-2 flex-shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span>{(selectedRoom.sellerId === user.id ? selectedRoom.buyerName : selectedRoom.sellerName)[0]}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{selectedRoom.sellerId === user.id ? selectedRoom.buyerName : selectedRoom.sellerName}</p>
                        <p className="text-xs text-gray-600 truncate">{selectedRoom.farmName}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-3">
                    {isConfirmed ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <span className="text-sm text-green-800">✓ คุณได้กดยืนยันแล้ว</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (!selectedRoom) return;
                            if (onConfirmSale) {
                              onConfirmSale(selectedRoom.postId, selectedRoom.id);
                            }
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          ยืนยัน
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={handleCancelChat}
                          className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          ยกเลิก
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map(message => {
                    const isMe = message.senderId === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-2 ${
                            isMe
                              ? 'bg-green-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 border rounded-bl-none'
                          }`}
                        >
                          <p>{message.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isMe ? 'text-green-100' : 'text-gray-500'
                            }`}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="พิมพ์ข้อความ..."
                      className="flex-1"
                    />
                    <Button onClick={handleSend} className="bg-green-700 hover:bg-green-800 flex-shrink-0">
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}