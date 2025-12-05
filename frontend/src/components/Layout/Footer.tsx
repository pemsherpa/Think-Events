import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Browse Events', path: '/events' },
    { name: 'Categories', path: '/categories' },
    { name: 'Venues', path: '/venues' },
    { name: 'Organizers', path: '/organizers' },
  ];

  const supportLinks = [
    { name: 'Help Center', href: '#' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
  ];

  const organizerLinks = [
    { name: 'Create Event', path: '/events/create' },
    { name: 'Organizer Dashboard', href: '#' },
    { name: 'Pricing', href: '#' },
    { name: 'Resources', href: '#' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-xl">
                <span className="font-bold text-2xl">TE</span>
              </div>
              <div>
                <span className="font-bold text-2xl">Think Event</span>
                <p className="text-sm text-gray-400">Nepal's Premier Event Platform</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Discover, book, and enjoy amazing events across Nepal. From concerts and festivals to conferences and workshops, we connect you with unforgettable experiences.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-3 text-purple-400" />
                <span>info@thinkevent.com.np</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-3 text-purple-400" />
                <span>+977-1-2345678</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-3 text-purple-400" />
                <span>Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button 
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  {link.path ? (
                    <button 
                      onClick={() => navigate(link.path)}
                      className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* For Organizers */}
          <div>
            <h3 className="font-semibold text-lg mb-6">For Organizers</h3>
            <ul className="space-y-3">
              {organizerLinks.map((link) => (
                <li key={link.name}>
                  {link.path ? (
                    <button 
                      onClick={() => navigate(link.path)}
                      className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-semibold text-lg mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-6">Get the latest event updates and exclusive offers delivered to your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 transform hover:scale-110"
                    aria-label={social.name}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
            <div className="text-gray-400 text-sm">
              <p>&copy; {currentYear} Think Event. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p className="mb-2 md:mb-0">
              Made with <Heart className="inline h-4 w-4 text-red-500 mx-1" /> in Nepal
            </p>
            <div className="flex space-x-6">
              <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} className="hover:text-white transition-colors">Terms</a>
              <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
