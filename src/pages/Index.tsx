
import React from 'react';
import Header from '@/components/Layout/Header';
import HeroSection from '@/components/Hero/HeroSection';
import CategoryGrid from '@/components/Categories/CategoryGrid';
import EventFilters from '@/components/Events/EventFilters';
import EventCard from '@/components/Events/EventCard';

const Index = () => {
  // Mock event data
  const featuredEvents = [
    {
      id: '1',
      title: 'Sajjan Raj Vaidya Live in Concert',
      date: 'Dec 15, 2024',
      time: '7:00 PM',
      venue: 'Dashrath Stadium',
      location: 'Kathmandu',
      price: 1500,
      image: 'photo-1605810230434-7631ac76ec81',
      category: 'Concert',
      organizer: 'Music Nepal',
      availableSeats: 1250,
      totalSeats: 2000
    },
    {
      id: '2',
      title: 'Nepal Food & Cultural Festival',
      date: 'Dec 20, 2024',
      time: '11:00 AM',
      venue: 'Bhrikutimandap',
      location: 'Kathmandu',
      price: 500,
      image: 'photo-1519389950473-47ba0277781c',
      category: 'Festival',
      organizer: 'Event Horizons',
      availableSeats: 45,
      totalSeats: 500
    },
    {
      id: '3',
      title: 'Tech Conference Nepal 2024',
      date: 'Jan 5, 2025',
      time: '9:00 AM',
      venue: 'Hotel Soaltee',
      location: 'Kathmandu',
      price: 2500,
      image: 'photo-1498050108023-c5249f4df085',
      category: 'Conference',
      organizer: 'TechHub Nepal',
      availableSeats: 180,
      totalSeats: 200
    },
    {
      id: '4',
      title: 'Pokhara Comedy Night',
      date: 'Dec 25, 2024',
      time: '8:00 PM',
      venue: 'Club Paradise',
      location: 'Pokhara',
      price: 800,
      image: 'photo-1581091226825-a6a2a5aee158',
      category: 'Comedy',
      organizer: 'Laugh Factory',
      availableSeats: 95,
      totalSeats: 150
    },
    {
      id: '5',
      title: 'Chitwan National Park Adventure Expo',
      date: 'Jan 10, 2025',
      time: '10:00 AM',
      venue: 'Community Hall',
      location: 'Chitwan',
      price: 300,
      image: 'photo-1472396961693-142e6e269027',
      category: 'Workshop',
      organizer: 'Adventure Nepal',
      availableSeats: 80,
      totalSeats: 100
    },
    {
      id: '6',
      title: 'Dashain Cultural Celebration',
      date: 'Dec 30, 2024',
      time: '6:00 PM',
      venue: 'Tundikhel',
      location: 'Kathmandu',
      price: 200,
      image: 'photo-1466721591366-2d5fba72006d',
      category: 'Cultural',
      organizer: 'Cultural Society',
      availableSeats: 2800,
      totalSeats: 5000
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <CategoryGrid />
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't miss out on these amazing events happening across Nepal
            </p>
          </div>

          <EventFilters />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              View All Events
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-lg">
                  <span className="font-bold text-xl">TE</span>
                </div>
                <span className="font-bold text-xl">Think Event</span>
              </div>
              <p className="text-gray-400">
                Nepal's premier event booking platform. Discover, book, and enjoy amazing events across the country.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Browse Events</a></li>
                <li><a href="#" className="hover:text-white">Categories</a></li>
                <li><a href="#" className="hover:text-white">Venues</a></li>
                <li><a href="#" className="hover:text-white">Organizers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Organizers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Create Event</a></li>
                <li><a href="#" className="hover:text-white">Organizer Dashboard</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Resources</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Think Event. All rights reserved. Made with ❤️ in Nepal</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
