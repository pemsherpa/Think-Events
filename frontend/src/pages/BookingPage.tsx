
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Star, ArrowLeft, Ticket, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Layout/Header';
import SeatSelection from '@/components/Booking/SeatSelection';
import PaymentMethods from '@/components/Payment/PaymentMethods';
import { apiGet, apiPost } from '@/lib/api';

const BookingPage = () => {
  const { id } = useParams();
  const eventId = id as string;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const bookAndPayKhalti = async () => {
    try {
      if (!selectedSeatIds.length) return;
      const booking = await apiPost<any>('/bookings/', {
        event_id: Number(eventId),
        quantity: selectedSeatIds.length,
        seats: selectedSeatIds.map((sid) => ({ seat_id: sid })),
      });
      const pay = await apiPost<any>(`/bookings/${booking.id}/pay_khalti/`, {});
      const url = pay?.khalti?.payment_url;
      if (url) window.location.href = url;
    } catch (e) {
      // no-op; add toast in future
    }
  };

  // Mock event card data for header
  const event = {
    id: eventId,
    title: 'Event',
    date: '',
    time: '',
    venue: '',
    location: '',
    price: 0,
    image: 'photo-1605810230434-7631ac76ec81',
    category: 'Event',
    organizer: '',
    rating: 4.8,
    reviews: 324,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 hover:bg-purple-50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Event Details
        </Button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <img src={`https://images.unsplash.com/${event.image}?w=300&h=200&fit=crop`} alt={event.title} className="w-full md:w-64 h-48 object-cover rounded-lg" />
            <div className="flex-1">
              <Badge className="mb-2 bg-purple-100 text-purple-700">{event.category}</Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                <div className="flex items-center"><Calendar className="h-5 w-5 mr-3 text-purple-600" /><span>{event.date}</span></div>
                <div className="flex items-center"><Clock className="h-5 w-5 mr-3 text-purple-600" /><span>{event.time}</span></div>
                <div className="flex items-center"><MapPin className="h-5 w-5 mr-3 text-purple-600" /><span>{event.venue} {event.location}</span></div>
                <div className="flex items-center"><User className="h-5 w-5 mr-3 text-purple-600" /><span>{event.organizer}</span></div>
              </div>
              <div className="flex items-center mt-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{event.rating}</span>
                <span className="text-gray-500 ml-1">({event.reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg rounded-lg p-1">
            <TabsTrigger value="details" className="flex items-center space-x-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Select Seats</span>
              <span className="sm:hidden">Seats</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center space-x-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Your Info</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center space-x-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payment</span>
              <span className="sm:hidden">Pay</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Seats</h2>
              <SeatSelection eventId={eventId} onChange={(ids, total) => { setSelectedSeatIds(ids); setTotalPrice(total); }} />
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setActiveTab('payment')} className="bg-purple-600 hover:bg-purple-700">
                  Continue to Payment
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h2>
              <PaymentMethods />
              <div className="mt-6 flex justify-between items-center">
                <div className="text-gray-700">Selected seats: {selectedSeatIds.length} | Total: रु {totalPrice.toLocaleString()}</div>
                <Button onClick={bookAndPayKhalti} className="bg-purple-600 hover:bg-purple-700">
                  Book and Pay with Khalti
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
