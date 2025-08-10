
import React from 'react';
import Header from '@/components/Layout/Header';
import { Music, Mic, Users, Briefcase, Heart, Gamepad2 } from 'lucide-react';

const Categories = () => {
  const categories = [
    { id: 1, name: 'Concerts', icon: Music, count: 45, color: 'bg-purple-500' },
    { id: 2, name: 'Comedy Shows', icon: Mic, count: 23, color: 'bg-yellow-500' },
    { id: 3, name: 'Festivals', icon: Users, count: 34, color: 'bg-green-500' },
    { id: 4, name: 'Conferences', icon: Briefcase, count: 19, color: 'bg-blue-500' },
    { id: 5, name: 'Weddings', icon: Heart, count: 67, color: 'bg-pink-500' },
    { id: 6, name: 'Gaming', icon: Gamepad2, count: 12, color: 'bg-indigo-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Categories</h1>
          <p className="text-gray-600">Browse events by category</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className={`${category.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <category.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">{category.name}</h3>
              <p className="text-gray-600 text-sm">{category.count} events</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
