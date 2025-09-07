
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { eventsAPI } from '@/services/api';

interface EventFiltersProps {
  onFilterChange: (filters: any) => void;
}

const EventFilters: React.FC<EventFiltersProps> = ({ onFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await eventsAPI.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to hardcoded categories
        setCategories([
          { id: 1, name: 'Concerts' },
          { id: 2, name: 'Festivals' },
          { id: 3, name: 'Conferences' },
          { id: 4, name: 'Sports' },
          { id: 5, name: 'Theatre' },
          { id: 6, name: 'Comedy' },
          { id: 7, name: 'Workshops' },
          { id: 8, name: 'Cultural' }
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  const locations = [
    'Kathmandu', 'Pokhara', 'Chitwan', 'Butwal', 'Biratnagar', 'Dharan', 'Hetauda', 'Nepalgunj'
  ];

  const toggleCategory = (categoryName: string) => {
    const newCategories = selectedCategories.includes(categoryName) 
      ? selectedCategories.filter(c => c !== categoryName)
      : [...selectedCategories, categoryName];
    setSelectedCategories(newCategories);
    updateFilters(newCategories, selectedLocation, selectedDate, priceRange, searchQuery);
  };

  const updateFilters = (categories: string[], location: string, date: string, price: string, search: string) => {
    const filters: any = {};
    
    if (categories.length > 0) {
      filters.category = categories.join(',');
    }
    if (location) {
      filters.location = location;
    }
    if (date) {
      filters.date = date;
    }
    if (price) {
      filters.price_range = price;
    }
    if (search) {
      filters.search = search;
    }
    
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedLocation('');
    setSelectedDate('');
    setPriceRange('');
    setSearchQuery('');
    onFilterChange({});
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
            <Filter className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Discover Events</h2>
            <p className="text-gray-600 text-sm">Find your perfect event experience</p>
          </div>
        </div>
        {(selectedCategories.length > 0 || selectedLocation || selectedDate || priceRange) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-8">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input 
            placeholder="Search events, artists, venues..."
            className="pl-12 h-14 text-lg border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-0 bg-white/50"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              updateFilters(selectedCategories, selectedLocation, selectedDate, priceRange, e.target.value);
            }}
          />
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              Date
            </label>
            <Input 
              type="date" 
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                updateFilters(selectedCategories, selectedLocation, e.target.value, priceRange, searchQuery);
              }}
              className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              Location
            </label>
            <Select value={selectedLocation} onValueChange={(value) => {
              setSelectedLocation(value);
              updateFilters(selectedCategories, value, selectedDate, priceRange, searchQuery);
            }}>
              <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0">
                <SelectValue placeholder="Any location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Price Range</label>
            <Select value={priceRange} onValueChange={(value) => {
              setPriceRange(value);
              updateFilters(selectedCategories, selectedLocation, selectedDate, value, searchQuery);
            }}>
              <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0">
                <SelectValue placeholder="Any price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free Events</SelectItem>
                <SelectItem value="0-500">रु 0 - 500</SelectItem>
                <SelectItem value="500-1000">रु 500 - 1,000</SelectItem>
                <SelectItem value="1000-2500">रु 1,000 - 2,500</SelectItem>
                <SelectItem value="2500+">रु 2,500+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
          <div className="flex flex-wrap gap-3">
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                Loading categories...
              </div>
            ) : (
              categories.map(category => (
                <button
                  key={category.id || category.name}
                  onClick={() => toggleCategory(category.name)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategories.includes(category.name)
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:scale-105'
                  }`}
                >
                  {category.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategories.length > 0 || selectedLocation || selectedDate || priceRange) && (
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Active Filters:</h3>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="flex flex-wrap gap-3">
              {selectedCategories.map(category => (
                <div key={category} className="flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">{category}</span>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="hover:text-purple-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              {selectedLocation && (
                <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                  <MapPin className="h-3 w-3" />
                  <span className="text-sm font-medium">{selectedLocation}</span>
                  <button
                    onClick={() => setSelectedLocation('')}
                    className="hover:text-blue-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
              {selectedDate && (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <Calendar className="h-3 w-3" />
                  <span className="text-sm font-medium">{selectedDate}</span>
                  <button
                    onClick={() => setSelectedDate('')}
                    className="hover:text-green-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
              {priceRange && (
                <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">{priceRange}</span>
                  <button
                    onClick={() => setPriceRange('')}
                    className="hover:text-orange-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventFilters;
