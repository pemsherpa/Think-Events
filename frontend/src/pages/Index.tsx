
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import HeroSection from '@/components/Hero/HeroSection';
import CategoryGrid from '@/components/Categories/CategoryGrid';
import EventFilters from '@/components/Events/EventFilters';
import EventCard from '@/components/Events/EventCard';
import { eventsAPI } from '@/services/api';
import HomeCarousel from '@/components/Home/HomeCarousel';

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    // Get category from URL params
    const category = searchParams.get('category');
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
    
    // Listen for category filter events from CategoryGrid
    const handleCategoryFilter = (event: CustomEvent) => {
      const { category } = event.detail;
      setFilters(prev => ({ ...prev, category }));
    };
    
    window.addEventListener('categoryFilter', handleCategoryFilter);
    return () => window.removeEventListener('categoryFilter', handleCategoryFilter);
  }, [searchParams]);

  useEffect(() => {
    fetchEvents();
  }, [filters, sortBy]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const queryParams: any = { ...filters };
      
      // Add sorting parameters
      switch (sortBy) {
        case 'viewed':
          queryParams.sortBy = 'views';
          queryParams.sortOrder = 'DESC';
          break;
        case 'recent':
          queryParams.sortBy = 'created_at';
          queryParams.sortOrder = 'DESC';
          break;
        case 'soon':
          queryParams.sortBy = 'start_date';
          queryParams.sortOrder = 'ASC';
          break;
        default:
          queryParams.sortBy = 'created_at';
          queryParams.sortOrder = 'DESC';
      }
      
      const response = await eventsAPI.getAll({ ...queryParams, limit: 12 });
      setEvents(response.data.events || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, String(value));
      }
    });
    // Update URL without navigation
    window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams.toString()}`);
  };

  const handleViewAllEvents = () => {
    navigate('/events');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      <main>
        {/* Carousel Section with Gradient Background */}
        <div className="relative bg-gradient-to-b from-purple-900/10 to-transparent dark:from-purple-900/20 pt-8 pb-12">
          <div className="container mx-auto px-4">
            <HomeCarousel />
          </div>
        </div>

        {/* Hero Section */}
        <HeroSection />

        {/* Categories */}
        <CategoryGrid />
        
        {/* Featured Events Section */}
        <section className="py-20 relative overflow-hidden" data-section="events">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-900 z-0"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50 z-0"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-pink-100 dark:bg-pink-900/20 rounded-full blur-3xl opacity-50 z-0"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Events</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Discover and book the most happening events in Nepal. From concerts to workshops, we have it all.
              </p>
            </div>

            <EventFilters onFilterChange={handleFilterChange} />
            
            {/* Sorting Buttons */}
            <div className="mb-10">
              <div className="flex flex-wrap gap-4 justify-center">
                {[
                  { id: 'viewed', label: 'Most Viewed' },
                  { id: 'recent', label: 'Most Recent' },
                  { id: 'soon', label: 'Happening Soon' }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setSortBy(btn.id)}
                    className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                      sortBy === btn.id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Curating events for you...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-500 text-lg mb-4">{error}</p>
                <button 
                  onClick={fetchEvents}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
                <p className="text-gray-600 dark:text-gray-400 text-xl">No events found matching your criteria.</p>
                <button 
                  onClick={() => setFilters({})}
                  className="mt-4 text-purple-600 dark:text-purple-400 font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}

            <div className="text-center mt-16">
                <button 
                  onClick={handleViewAllEvents}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                View All Events
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
