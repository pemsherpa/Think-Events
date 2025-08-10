
import React from 'react';
import Header from '@/components/Layout/Header';
import { Users, Calendar, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Organizers = () => {
  const organizers = [
    {
      id: 1,
      name: 'Event Masters Nepal',
      eventsCount: 45,
      rating: 4.9,
      image: 'photo-1581090464777-f3220bbe1b8b',
      category: 'Concert Organizer',
      verified: true
    },
    {
      id: 2,
      name: 'Festival Hub',
      eventsCount: 23,
      rating: 4.7,
      image: 'photo-1487887235947-a955ef187fcc',
      category: 'Festival Organizer',
      verified: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Organizers</h1>
          <p className="text-gray-600">Meet the best event organizers in Nepal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizers.map((organizer) => (
            <div key={organizer.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
              <img 
                src={`https://images.unsplash.com/${organizer.image}?w=400&h=200&fit=crop`}
                alt={organizer.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{organizer.name}</h3>
                  {organizer.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Award className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <Badge variant="secondary" className="mb-3">{organizer.category}</Badge>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{organizer.eventsCount} events organized</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                    <span>{organizer.rating} rating</span>
                  </div>
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  View Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Organizers;
