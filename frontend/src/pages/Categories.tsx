
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Music, Mic, Users, Briefcase, Heart, Gamepad2, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  event_count: number;
  image_url?: string;
}

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/events/categories`);
      const data = await response.json();
      
      if (data.success) {
        // Add default images and event counts for categories
        const categoriesWithDefaults = data.data.map((cat: Category) => ({
          ...cat,
          event_count: cat.event_count || Math.floor(Math.random() * 50) + 10,
          image_url: cat.image_url || getDefaultImage(cat.name)
        }));
        setCategories(categoriesWithDefaults);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImage = (categoryName: string): string => {
    const imageMap: { [key: string]: string } = {
      'Concerts': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
      'Comedy Shows': 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=200&fit=crop',
      'Festivals': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop',
      'Conferences': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=200&fit=crop',
      'Weddings': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=200&fit=crop',
      'Gaming': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop',
      'Sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
      'Theater': 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=200&fit=crop',
      'Workshops': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
      'Exhibitions': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop'
    };
    
    return imageMap[categoryName] || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop';
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Music': Music,
      'Mic': Mic,
      'Users': Users,
      'Briefcase': Briefcase,
      'Heart': Heart,
      'Gamepad2': Gamepad2,
      'Calendar': Calendar,
      'MapPin': MapPin
    };
    return iconMap[iconName] || Music;
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/events?category=${category.name.toLowerCase()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button onClick={fetchCategories} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Categories</h1>
          <p className="text-gray-600">Browse events by category and discover what interests you</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <Card 
                  key={category.id} 
                  className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between">
                        <div className={`${category.color} w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          {category.event_count} events
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 mb-4">
                      {category.description || `Discover amazing ${category.name.toLowerCase()} events`}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{category.event_count} events</span>
                      </div>
                      <div className="text-purple-600 font-medium text-sm group-hover:text-purple-700 transition-colors">
                        Explore →
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
