
import React, { useState } from 'react';
import Header from '@/components/Layout/Header';
import { MapPin, Star, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VenueBookingForm from '@/components/Venues/VenueBookingForm';

const Venues = () => {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const venues = [
    {
      id: 1,
      name: 'City Hall Kathmandu',
      address: 'City Hall Road, Kathmandu',
      city: 'Kathmandu',
      location: 'Kathmandu, Nepal',
      capacity: 2000,
      rating: 4.8,
      image: 'photo-1493397212122-2b85dda8106b',
      category: 'Convention Center',
      description: 'A prestigious venue in the heart of Kathmandu, perfect for large events and conferences.'
    },
    {
      id: 2,
      name: 'Nepal Army Club',
      address: 'Sundhara, Kathmandu',
      city: 'Kathmandu',
      location: 'Sundhara, Kathmandu',
      capacity: 500,
      rating: 4.6,
      image: 'photo-1500673922987-e212871fec22',
      category: 'Event Hall',
      description: 'Elegant venue with military heritage, ideal for intimate gatherings and special events.'
    },
    {
      id: 3,
      name: 'Dashrath Stadium',
      address: 'Tripureshwor, Kathmandu',
      city: 'Kathmandu',
      location: 'Tripureshwor, Kathmandu',
      capacity: 25000,
      rating: 4.7,
      image: 'photo-1571019613454-1cb2f99b2d8b',
      category: 'Sports Stadium',
      description: 'Nepal\'s largest stadium, perfect for sports events, concerts, and large gatherings.'
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

                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setSelectedVenue(venue);
                    setShowBookingForm(true);
                  }}
                >
                  Book This Venue
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Book {selectedVenue.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBookingForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <VenueBookingForm
              venue={selectedVenue}
              onBookingSubmit={async (bookingData) => {
                // Handle venue booking submission
                console.log('Venue booking submitted:', bookingData);
                alert('Venue booking request submitted successfully! We will contact you soon.');
                setShowBookingForm(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Venues;
