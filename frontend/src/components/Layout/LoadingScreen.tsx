
import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className="bg-white rounded-full p-6 shadow-2xl animate-pulse mx-auto w-20 h-20 flex items-center justify-center">
            <span className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              TE
            </span>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
          Think Event
        </h1>
        <p className="text-lg text-purple-100 mb-8 animate-fade-in">
          Nepal's Premier Event Booking Platform
        </p>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>

        <p className="text-purple-200 text-sm">
          Loading amazing events...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
