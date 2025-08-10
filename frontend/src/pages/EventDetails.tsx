
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Star, Share2, Heart, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Layout/Header';

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const event = {
    id: id || '1',
    title: 'Sajjan Raj Vaidya Live in Concert',
    date: 'December 15, 2024',
    time: '7:00 PM',
    venue: 'Dashrath Stadium',
    location: 'Kathmandu, Nepal',
    price: 1500,
    image: 'photo-1605810230434-7631ac76ec81',
    category: 'Concert',
    organizer: 'Music Nepal',
    rating: 4.8,
    reviews: 324,
    availableSeats: 1250,
    totalSeats: 2000,
    description: `Join us for an unforgettable evening with Sajjan Raj Vaidya, one of Nepal's most beloved musicians. Experience his soulful melodies and captivating performances in this exclusive live concert at Dashrath Stadium.

    This concert promises to be a magical night filled with music, emotions, and memories that will last a lifetime. Don't miss this opportunity to see Sajjan Raj Vaidya perform his greatest hits along with some exciting new material.`,
    highlights: [
      'Live performance by Sajjan Raj Vaidya',
      'Special guest appearances',
      'Professional sound and lighting',
      'Food and beverage stalls available',
      'Free parking available'
    ],
    schedule: [
      { time: '6:00 PM', activity: 'Gates Open' },
      { time: '6:30 PM', activity: 'Opening Act' },
      { time: '7:30 PM', activity: 'Sajjan Raj Vaidya Performance' },
      { time: '10:00 PM', activity: 'Event Ends' }
    ]
  };

  const handleBookTickets = () => {
    navigate(`/book/${event.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative">
            <img 
              src={`https://images.unsplash.com/${event.image}?w=1200&h=400&fit=crop`}
              alt={event.title}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <Badge className="mb-2 bg-purple-600">{event.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                  <span>{event.rating}</span>
                  <span className="ml-1">({event.reviews} reviews)</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>by {event.organizer}</span>
                </div>
              </div>
            </div>
            <div className="absolute top-6 right-6 flex space-x-2">
              <Button size="sm" variant="secondary">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Event Description</h2>
                <div className="prose max-w-none">
                  {event.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Event Highlights</h3>
                <ul className="space-y-2">
                  {event.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="schedule" className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Event Schedule</h2>
                <div className="space-y-4">
                  {event.schedule.map((item, index) => (
                    <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                      <div className="w-20 text-purple-600 font-semibold">{item.time}</div>
                      <div className="flex-1 text-gray-900">{item.activity}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>
                <div className="text-center text-gray-500 py-12">
                  <p>Reviews will be available after the event.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>{event.venue}, {event.location}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="text-center mb-4">
                  <span className="text-sm text-gray-500">Starting from</span>
                  <div className="text-3xl font-bold text-purple-600">
                    रु {event.price.toLocaleString()}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Seats Available</span>
                    <span>{event.availableSeats} of {event.totalSeats}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg"
                  onClick={handleBookTickets}
                >
                  <Ticket className="h-5 w-5 mr-2" />
                  Book Tickets
                </Button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  🔒 Secure booking with instant confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
