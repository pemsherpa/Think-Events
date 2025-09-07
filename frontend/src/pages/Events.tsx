import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import EventFilters from '@/components/Events/EventFilters';
import EventCard from '@/components/Events/EventCard';
import { eventsAPI } from '@/services/api';

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const date = searchParams.get('date');
    const priceRange = searchParams.get('price_range');
    const search = searchParams.get('search');
    
    const urlFilters: any = {};
    if (category) urlFilters.category = category;
    if (location) urlFilters.location = location;
    if (date) urlFilters.date = date;
    if (priceRange) urlFilters.price_range = priceRange;
    if (search) urlFilters.search = search;
    
    setFilters(urlFilters);
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
      
      const response = await eventsAPI.getAll(queryParams);
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
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, String(value));
      }
    });
    setSearchParams(newSearchParams);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero banner similar feel */}
      <div className="bg-[#0E5AA7] text-white">
        <div className="container mx-auto px-4 py-10 lg:py-14 flex flex-col lg:flex-row gap-8 items-center">
          <div className="w-full max-w-xl rounded-xl overflow-hidden shadow-lg bg-white">
            <img src="/placeholder.svg" alt="Event poster" className="w-full h-64 object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl lg:text-5xl font-extrabold mb-4">Discover Events Near You</h1>
            <p className="text-white/90 text-lg mb-6">Find concerts, festivals, sports and more. Book now to secure your seat.</p>
            <div className="flex gap-3">
              <Link to="/events/create" className="bg-white text-[#0E5AA7] px-6 py-3 rounded-lg font-semibold">Create Event</Link>
              <Link to="/events" className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold">Book Now</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">All Events</h2>
          <p className="text-lg text-gray-600">Handpicked events across Nepal</p>
        </div>

        <EventFilters onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchEvents}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria.</p>
            <button 
              onClick={() => {
                setFilters({});
                setSearchParams({});
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Sorting Buttons */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={() => setSortBy('viewed')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
                    sortBy === 'viewed'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-purple-300'
                  }`}
                >
                  Most Viewed
                </button>
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
                    sortBy === 'recent'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-purple-300'
                  }`}
                >
                  Most Recent
                </button>
                <button
                  onClick={() => setSortBy('soon')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
                    sortBy === 'soon'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-purple-300'
                  }`}
                >
                  Happening Soon
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Showing {events.length} event{events.length !== 1 ? 's' : ''}
                </p>
                <Link
                  to="/events/create"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  Create Event
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
