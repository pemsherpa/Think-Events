
import React from 'react';
import Header from '@/components/Layout/Header';
import { MapPin, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Venues = () => {
  const venues = [
    {
      id: 1,
      name: 'City Hall Kathmandu',
      location: 'Kathmandu, Nepal',
      capacity: 2000,
      rating: 4.8,
      image: 'photo-1493397212122-2b85dda8106b',
      category: 'Convention Center'
    },
    {
      id: 2,
      name: 'Nepal Army Club',
      location: 'Sundhara, Kathmandu',
      capacity: 500,
      rating: 4.6,
      image: 'photo-1500673922987-e212871fec22',
      category: 'Event Hall'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Venues</h1>
          <p className="text-gray-600">Discover amazing venues across Nepal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div key={venue.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
              <img 
                src={`https://images.unsplash.com/${venue.image}?w=400&h=200&fit=crop`}
                alt={venue.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{venue.name}</h3>
                  <Badge variant="secondary">{venue.category}</Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{venue.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Capacity: {venue.capacity.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                    <span>{venue.rating} rating</span>
                  </div>
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Venues;
