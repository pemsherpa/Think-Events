
import React, { useState, useEffect, useRef } from 'react';
import { User, Menu, X, Calendar, MapPin, Users, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CalendarModal from '@/components/Calendar/CalendarModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    { title: 'All Events', icon: Calendar, path: '/events' },
    { title: 'Venues', icon: MapPin, path: '/venues' },
    { title: 'Organizers', icon: Users, path: '/organizers' },
    { title: 'Artists', icon: Building, path: '/artists' }
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center space-x-4 cursor-pointer group" 
            onClick={handleLogoClick}
          >
            <div className="relative group-hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-3 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center">
                  <div className="w-7 h-7 relative">
                    <div className="absolute inset-0 bg-white rounded-full opacity-20"></div>
                    <div className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">T</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Think Events
              </span>
              <p className="text-xs text-gray-500 -mt-1">Discover Nepal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300 hover:scale-105 px-4 py-2"
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.title}</span>
              </Button>
            ))}
            <Button 
              size="sm" 
              className="ml-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
              onClick={() => handleNavigation('/events/create')}
            >
              Create Event
            </Button>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Calendar Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300"
              onClick={() => setIsCalendarOpen(true)}
              title="View your event calendar"
            >
              <Calendar className="h-5 w-5" />
            </Button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-sm text-gray-600">
                  <span className="font-medium">Welcome,</span>
                  <br />
                  <span className="text-purple-600">{user.first_name || user.username}</span>
                </div>
                <div className="relative" ref={menuRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden sm:inline font-medium">Profile</span>
                  </Button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.first_name || user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleNavigation('/profile')}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Profile
                      </button>
                      <button
                        onClick={() => handleNavigation('/events/create')}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                      >
                        <Calendar className="h-4 w-4 mr-3" />
                        Create Event
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <X className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleNavigation('/login')}
                  className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300"
                >
                  Login
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                  onClick={() => handleNavigation('/signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md shadow-lg absolute w-full left-0 z-50" ref={menuRef}>
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation */}
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.title}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </button>
                ))}
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                  onClick={() => handleNavigation('/events/create')}
                >
                  Create Event
                </Button>
              </div>

              {/* Mobile Auth Buttons */}
              {!user ? (
                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300" 
                    onClick={() => handleNavigation('/login')}
                  >
                    Login
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                    onClick={() => handleNavigation('/signup')}
                  >
                    Sign Up
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300" 
                    onClick={() => handleNavigation('/profile')}
                  >
                    Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Calendar Modal */}
      <CalendarModal 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
      />
    </header>
  );
};

export default Header;
