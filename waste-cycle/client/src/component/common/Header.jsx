import { Recycle, LogOut, Menu, X } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { useState } from 'react';




export function Header({ user, onLogout, onNavigate, currentPage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const menuItems = user.role === 'admin' 
    ? [
        { id: 'dashboard', label: 'แดชบอร์ด' },
        { id: 'admin', label: 'จัดการระบบ' },
      ]
    : [
        { id: 'dashboard', label: 'แดชบอร์ด' },
        { id: 'marketplace', label: 'ตลาดกลาง' },
        { id: 'create-post', label: 'ลงประกาศขาย' },
        { id: 'bookings', label: 'การจอง' },
        { id: 'fertilizer-advisor', label: 'คำนวณปุ๋ย' },
        { id: 'npk-calculator', label: 'วิเคราะห์ NPK' },
        { id: 'circular-view', label: 'วงจรหมุนเวียน' },
      ];

  const handleNavigate = (page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-green-700 text-white z-50 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('dashboard')}>
              <Recycle className="w-8 h-8" />
              <span className="text-xl">เสกสรรค์ ฟาร์ม</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`px-4 py-2 rounded transition-colors ${
                    currentPage === item.id 
                      ? 'bg-green-800 text-white' 
                      : 'text-white hover:bg-green-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm">{user.name}</p>
                <p className="text-xs opacity-90">
                  {user.role === 'admin' ? 'ผู้ดูแลระบบ' : user.farmName}
                </p>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onLogout}
                className="text-white hover:bg-green-600"
              >
                <LogOut className="w-5 h-5" />
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-white hover:bg-green-600"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="fixed top-16 right-0 bottom-0 w-64 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col p-4">
              <div className="mb-4 pb-4 border-b">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-600">
                  {user.role === 'admin' ? 'ผู้ดูแลระบบ' : user.farmName}
                </p>
              </div>
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                    currentPage === item.id 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}