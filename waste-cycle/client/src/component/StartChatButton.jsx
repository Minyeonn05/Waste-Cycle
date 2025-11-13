// components/StartChatButton.jsx
// ปุ่มสำหรับเริ่มแชทกับผู้ขายจากหน้าสินค้า

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';

export default function StartChatButton({ product, className = '' }) {
  const { user, isAuthenticated } = useAuth();
  const { createOrGetChat } = useChat();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    // ต้อง login ก่อน
    if (!isAuthenticated) {
      alert('Please login to chat with seller');
      navigate('/login', { state: { from: `/products/${product.id}` } });
      return;
    }

    // ห้ามแชทกับตัวเอง
    if (user.uid === product.userId) {
      alert('You cannot chat with yourself');
      return;
    }

    setLoading(true);

    try {
      // สร้างหรือดึง chat room
      const chat = await createOrGetChat(product.id, product.userId);

      // ไปหน้าแชท
      navigate(`/chats/${chat.id}`);
    } catch (err) {
      console.error('Start chat error:', err);
      alert('Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ถ้าเป็นเจ้าของสินค้า ไม่แสดงปุ่ม
  if (user?.uid === product.userId) {
    return null;
  }

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className={`flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Starting...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat with Seller
        </>
      )}
    </button>
  );
}

// ===================================
// ตัวอย่างการใช้งานในหน้าสินค้า
// ===================================

/*
// ProductDetailPage.jsx
import StartChatButton from './StartChatButton';

function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  // ... fetch product data

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images *\/}
        <div>
          <img src={product.images[0]} alt={product.name} />
        </div>

        {/* Product Info *\/}
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl text-green-600 mt-4">
            ฿{product.price.toLocaleString()}
          </p>
          <p className="mt-4">{product.description}</p>

          {/* Action Buttons *\/}
          <div className="mt-8 space-y-4">
            <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg">
              Add to Booking
            </button>
            
            {/* Chat Button *\/}
            <StartChatButton 
              product={product}
              className="w-full"
            />
          </div>

          {/* Seller Info *\/}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Seller</h3>
            <div className="flex items-center">
              <img 
                src={product.seller.photoURL} 
                alt={product.seller.displayName}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-3">
                <p className="font-medium">{product.seller.displayName}</p>
                <p className="text-sm text-gray-600">{product.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
*/

// ===================================
// Mini Chat Button (Floating)
// ===================================

export function FloatingChatButton({ unreadCount = 0 }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/chats')}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center z-50"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}

/*
// Usage in App.js
import { FloatingChatButton } from './components/StartChatButton';
import { useChat } from './hooks/useChat';

function App() {
  const { totalUnread } = useChat();

  return (
    <div>
      <Routes>
        {/* ... routes *\/}
      </Routes>
      
      {/* Floating Chat Button *\/}
      <FloatingChatButton unreadCount={totalUnread} />
    </div>
  );
}
*/