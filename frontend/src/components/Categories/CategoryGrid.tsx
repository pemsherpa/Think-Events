
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Users, Mic, Calendar, Trophy, Theater, BookOpen, Heart } from 'lucide-react';
import { eventsAPI } from '@/services/api';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  count: number;
  slug: string;
}

const CategoryGrid = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Icon mapping for categories
  const iconMap = {
    'Music': Music,
    'Concert': Music,
    'Festival': Users,
    'Comedy': Mic,
    'Conference': Calendar,
    'Sports': Trophy,
    'Theatre': Theater,
    'Workshop': BookOpen,
    'Cultural': Heart,
    'Technology': BookOpen,
    'Business': Calendar,
    'Education': BookOpen,
    'Arts': Heart,
    'Food': Heart,
  };
  
  // Color mapping for categories
  const colorMap = {
    'Music': 'bg-red-500',
    'Concert': 'bg-red-500',
    'Festival': 'bg-blue-500',
    'Comedy': 'bg-yellow-500',
    'Conference': 'bg-green-500',
    'Sports': 'bg-purple-500',
    'Theatre': 'bg-pink-500',
    'Workshop': 'bg-indigo-500',
    'Cultural': 'bg-orange-500',
    'Technology': 'bg-blue-600',
    'Business': 'bg-green-600',
    'Education': 'bg-purple-600',
    'Arts': 'bg-pink-600',
    'Food': 'bg-orange-600',
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getCategories();
        const categoriesData = response.data || [];
        
        // Get event counts for each category
        const categoriesWithCounts = await Promise.all(
          categoriesData.map(async (category) => {
            try {
              const eventsResponse = await eventsAPI.getAll({ category: category.name });
              const eventCount = eventsResponse.data?.events?.length || eventsResponse.data?.data?.length || 0;
              
              return {
                ...category,
                count: eventCount,
                slug: category.name.toLowerCase().replace(/\s+/g, '-'),
                icon: iconMap[category.name] || BookOpen,
                color: colorMap[category.name] || 'bg-gray-500'
              };
            } catch (error) {
              console.error(`Error fetching events for category ${category.name}:`, error);
              return {
                ...category,
                count: 0,
                slug: category.name.toLowerCase().replace(/\s+/g, '-'),
                icon: iconMap[category.name] || BookOpen,
                color: colorMap[category.name] || 'bg-gray-500'
              };
            }
          })
        );
        
        setCategories(categoriesWithCounts);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to static categories if API fails
        setCategories([
          { id: 1, name: 'Concerts', description: 'Live music events', icon: Music, color: 'bg-red-500', count: 0, slug: 'concerts' },
          { id: 2, name: 'Festivals', description: 'Cultural festivals', icon: Users, color: 'bg-blue-500', count: 0, slug: 'festivals' },
          { id: 3, name: 'Comedy Shows', description: 'Stand-up comedy', icon: Mic, color: 'bg-yellow-500', count: 0, slug: 'comedy-shows' },
          { id: 4, name: 'Conferences', description: 'Business conferences', icon: Calendar, color: 'bg-green-500', count: 0, slug: 'conferences' },
          { id: 5, name: 'Sports', description: 'Sports events', icon: Trophy, color: 'bg-purple-500', count: 0, slug: 'sports' },
          { id: 6, name: 'Theatre', description: 'Theatrical performances', icon: Theater, color: 'bg-pink-500', count: 0, slug: 'theatre' },
          { id: 7, name: 'Workshops', description: 'Educational workshops', icon: BookOpen, color: 'bg-indigo-500', count: 0, slug: 'workshops' },
          { id: 8, name: 'Cultural', description: 'Cultural events', icon: Heart, color: 'bg-orange-500', count: 0, slug: 'cultural' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    // Update URL with category filter and scroll to events section
    const url = new URL(window.location);
    url.searchParams.set('category', category.slug);
    window.history.pushState({}, '', url);
    
    // Scroll to events section
    setTimeout(() => {
      const eventsSection = document.querySelector('[data-section="events"]');
      if (eventsSection) {
        eventsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    // Trigger a custom event to update filters
    window.dispatchEvent(new CustomEvent('categoryFilter', { detail: { category: category.slug } }));
  };

  return (
    <section className="py-16 bg-gray-50" data-section="categories">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Explore Event Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover events that match your interests across various categories
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div 
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="bg-white rounded-xl p-6 hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:-translate-y-2 hover:scale-105"
                >
                  <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-6`}>
                    <IconComponent className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} events</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;
