
import React from 'react';
import { Search, Calendar, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Discover Amazing Events in{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Nepal
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            From vibrant festivals to electrifying concerts, find and book tickets for the best events across Nepal. Join the crowd and create memories!
          </p>

          {/* Search Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    placeholder="Search events, artists, venues..."
                    className="pl-10 bg-white text-gray-900 border-0 h-12"
                  />
                </div>
              </div>
              
              <div>
                <Input 
                  type="date"
                  className="bg-white text-gray-900 border-0 h-12"
                />
              </div>
              
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 h-12">
                <Ticket className="h-5 w-5 mr-2" />
                Find Events
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">50K+</div>
              <div className="text-purple-200">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">1K+</div>
              <div className="text-purple-200">Events Hosted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">200+</div>
              <div className="text-purple-200">Event Organizers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">15+</div>
              <div className="text-purple-200">Cities Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default HeroSection;
