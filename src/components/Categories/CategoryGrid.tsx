
import React from 'react';
import { Music, Users, Mic, Calendar, Trophy, Theater, BookOpen, Heart } from 'lucide-react';

const CategoryGrid = () => {
  const categories = [
    { name: 'Concerts', icon: Music, color: 'bg-red-500', count: 156 },
    { name: 'Festivals', icon: Users, color: 'bg-blue-500', count: 89 },
    { name: 'Comedy Shows', icon: Mic, color: 'bg-yellow-500', count: 67 },
    { name: 'Conferences', icon: Calendar, color: 'bg-green-500', count: 45 },
    { name: 'Sports', icon: Trophy, color: 'bg-purple-500', count: 78 },
    { name: 'Theatre', icon: Theater, color: 'bg-pink-500', count: 34 },
    { name: 'Workshops', icon: BookOpen, color: 'bg-indigo-500', count: 92 },
    { name: 'Cultural', icon: Heart, color: 'bg-orange-500', count: 123 },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Explore Event Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover events that match your interests across various categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div 
                key={category.name}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1"
              >
                <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} events</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
