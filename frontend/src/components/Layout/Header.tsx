
import React, { useState } from 'react';
import { Search, User, Menu, X, Calendar, MapPin, Users, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { title: 'Events', icon: Calendar, path: '/' },
    { title: 'Venues', icon: MapPin, path: '/venues' },
    { title: 'Organizers', icon: Users, path: '/organizers' },
    { title: 'Categories', icon: Building, path: '/categories' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={handleLogoClick}
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 relative">
                    <div className="absolute inset-0 bg-white rounded-full opacity-20"></div>
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-xs">T</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl text-gray-800">Think Event</span>
              <p className="text-xs text-gray-500 -mt-1">Nepal's Event Hub</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all"
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Button>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center relative flex-1 max-w-md mx-6">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search events..."
              className="pl-10 border-gray-200 focus:border-purple-300 focus:ring-purple-300"
            />
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Button variant="ghost" size="sm">Login</Button>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
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
          <div className="lg:hidden border-t bg-white shadow-lg">
            <div className="px-4 py-4 space-y-3">
              {/* Mobile Search */}
              <div className="md:hidden">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search events..."
                    className="pl-10 w-full"
                  />
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.title}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-left text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>

              {/* Mobile Auth Buttons */}
              {!isLoggedIn && (
                <div className="flex space-x-2 pt-3 border-t">
                  <Button variant="ghost" size="sm" className="flex-1">
                    Login
                  </Button>
                  <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
