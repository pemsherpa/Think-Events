
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Users, Mic, Calendar, Trophy, Theater, BookOpen, Heart } from 'lucide-react';

const CategoryGrid = () => {
  const navigate = useNavigate();
  
  const categories = [
    { name: 'Concerts', icon: Music, color: 'bg-red-500', count: 156, slug: 'concerts' },
    { name: 'Festivals', icon: Users, color: 'bg-blue-500', count: 89, slug: 'festivals' },
    { name: 'Comedy Shows', icon: Mic, color: 'bg-yellow-500', count: 67, slug: 'comedy-shows' },
    { name: 'Conferences', icon: Calendar, color: 'bg-green-500', count: 45, slug: 'conferences' },
    { name: 'Sports', icon: Trophy, color: 'bg-purple-500', count: 78, slug: 'sports' },
    { name: 'Theatre', icon: Theater, color: 'bg-pink-500', count: 34, slug: 'theatre' },
    { name: 'Workshops', icon: BookOpen, color: 'bg-indigo-500', count: 92, slug: 'workshops' },
    { name: 'Cultural', icon: Heart, color: 'bg-orange-500', count: 123, slug: 'cultural' },
  ];

  const handleCategoryClick = (category) => {
    // Navigate to events page with category filter
    navigate(`/?category=${category.slug}`);
  };

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
                onClick={() => handleCategoryClick(category)}
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
