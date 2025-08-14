
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Star, ArrowLeft, Ticket, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Layout/Header';
import SeatSelection from '@/components/Booking/SeatSelection';
import PaymentMethods from '@/components/Payment/PaymentMethods';
import BookingForm from '@/components/Booking/BookingForm';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  
  // Mock event data - in real app, this would come from API
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
    description: 'Join us for an unforgettable evening with Sajjan Raj Vaidya, one of Nepal\'s most beloved musicians.'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-purple-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Event Details
        </Button>

        {/* Event Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <img 
              src={`https://images.unsplash.com/${event.image}?w=300&h=200&fit=crop`}
              alt={event.title}
              className="w-full md:w-64 h-48 object-cover rounded-lg"
            />
            <div className="flex-1">
              <Badge className="mb-2 bg-purple-100 text-purple-700">{event.category}</Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-purple-600" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-purple-600" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-purple-600" />
                  <span>{event.venue}, {event.location}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-3 text-purple-600" />
                  <span>by {event.organizer}</span>
                </div>
              </div>

              <div className="flex items-center mt-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{event.rating}</span>
                <span className="text-gray-500 ml-1">({event.reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Process Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg rounded-lg p-1">
            <TabsTrigger 
              value="details" 
              className="flex items-center space-x-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Select Seats</span>
              <span className="sm:hidden">Seats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="info"
              className="flex items-center space-x-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Your Info</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger 
              value="payment"
              className="flex items-center space-x-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payment</span>
              <span className="sm:hidden">Pay</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Seats</h2>
              <SeatSelection />
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => setActiveTab('info')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue to Information
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h2>
              <BookingForm />
              <div className="mt-6 flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('details')}
                >
                  Back to Seat Selection
                </Button>
                <Button 
                  onClick={() => setActiveTab('payment')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h2>
              <PaymentMethods />
              <div className="mt-6 flex justify-start">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('info')}
                >
                  Back to Information
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BookingPage;
