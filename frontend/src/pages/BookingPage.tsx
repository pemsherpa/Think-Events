
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Star, ArrowLeft, Ticket, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Layout/Header';
import SeatSelection from '@/components/Booking/SeatSelection';
import PaymentMethods from '@/components/Payment/PaymentMethods';
import { bookingsAPI } from '@/services/api';
import BookingForm, { BookingFormRef } from '@/components/Booking/BookingForm';
import OrderSummary from '@/components/Booking/OrderSummary';
import { usePromoCode } from '@/contexts/PromoCodeContext';

interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_time: string;
  price: number;
  currency: string;
  total_seats: number;
  available_seats: number;
  status: string;
  images: string[];
  category_name: string;
  venue_name: string;
  venue_city: string;
  organizer_name: string;
  rating: number;
  review_count: number;
}

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFinalPrice, activePromoCode } = usePromoCode();
  const [activeTab, setActiveTab] = useState('details');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const bookingFormRef = useRef<BookingFormRef>(null);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/events/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setEvent(data.data);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (data: any, isValid: boolean) => {
    setFormData(data);
    setIsFormValid(isValid);
  };

  const handleContinueToPayment = () => {
    // Trigger validation in the booking form
    if (bookingFormRef.current) {
      bookingFormRef.current.triggerValidation();
    }
    
    // Check if form is valid after validation
    if (isFormValid) {
      setActiveTab('payment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">{error || 'Event not found'}</p>
            <Button onClick={() => navigate('/events')} className="mt-4">
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              src={event.images?.[0] || `https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=300&h=200&fit=crop`}
              alt={event.title}
              className="w-full md:w-64 h-48 object-cover rounded-lg"
            />
            <div className="flex-1">
              <Badge className="mb-2 bg-purple-100 text-purple-700">{event.category_name}</Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-purple-600" />
                  <span>{formatDate(event.start_date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-purple-600" />
                  <span>{formatTime(event.start_time)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-purple-600" />
                  <span>{event.venue_name}, {event.venue_city}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-3 text-purple-600" />
                  <span>by {event.organizer_name}</span>
                </div>
              </div>

              <div className="flex items-center mt-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{event.rating || 0}</span>
                <span className="text-gray-500 ml-1">({event.review_count || 0} reviews)</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <SeatSelection 
                    onSeatsSelected={setSelectedSeats}
                    onTotalPriceChange={setTotalPrice}
                    eventId={id as any}
                  />
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={() => setActiveTab('info')}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={selectedSeats.length === 0}
                    >
                      Continue to Information
                    </Button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <OrderSummary 
                  selectedSeats={selectedSeats}
                  totalPrice={totalPrice}
                  eventTitle={event.title}
                  eventDate={formatDate(event.start_date)}
                  eventTime={formatTime(event.start_time)}
                  eventVenue={event.venue_name}
                  promoCode={activePromoCode}
                  discountAmount={activePromoCode ? (totalPrice * 1.18) - getFinalPrice(totalPrice * 1.18, id || '') : 0}
                  finalPrice={getFinalPrice(totalPrice * 1.18, id || '')}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h2>
                  <BookingForm onFormChange={handleFormChange} ref={bookingFormRef} />
                  <div className="mt-6 flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('details')}
                    >
                      Back to Seat Selection
                    </Button>
                    <Button 
                      onClick={handleContinueToPayment}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={!isFormValid}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <OrderSummary 
                  selectedSeats={selectedSeats}
                  totalPrice={totalPrice}
                  eventTitle={event.title}
                  eventDate={formatDate(event.start_date)}
                  eventTime={formatTime(event.start_time)}
                  eventVenue={event.venue_name}
                  promoCode={activePromoCode}
                  discountAmount={activePromoCode ? (totalPrice * 1.18) - getFinalPrice(totalPrice * 1.18, id || '') : 0}
                  finalPrice={getFinalPrice(totalPrice * 1.18, id || '')}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h2>
                  <PaymentMethods 
                    totalAmount={Math.round(totalPrice * 1.18)}
                    eventId={id || ''}
                    onPaymentComplete={async () => {
                      try {
                        // Create booking with selected seats
                        const seat_numbers = selectedSeats.map((s: any) => s.id);
                        const quantity = seat_numbers.length;
                        const total_amount = Math.round(totalPrice * 1.18);
                        const res = await bookingsAPI.create({
                          event_id: event?.id,
                          seat_numbers,
                          quantity,
                          total_amount,
                          payment_method: 'wallet'
                        });
                        // Mark payment completed
                        await bookingsAPI.updateStatus(res.data.id || res.data?.data?.id || res.id, { payment_status: 'completed' });
                        alert('Payment completed successfully!');
                      } catch (e) {
                        console.error(e);
                        alert('Failed to complete payment');
                      }
                    }}
                  />
                  <div className="mt-6 flex justify-start">
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('info')}
                    >
                      Back to Information
                    </Button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <OrderSummary 
                  selectedSeats={selectedSeats}
                  totalPrice={totalPrice}
                  eventTitle={event.title}
                  eventDate={formatDate(event.start_date)}
                  eventTime={formatTime(event.start_time)}
                  eventVenue={event.venue_name}
                  promoCode={activePromoCode}
                  discountAmount={activePromoCode ? (totalPrice * 1.18) - getFinalPrice(totalPrice * 1.18, id || '') : 0}
                  finalPrice={getFinalPrice(totalPrice * 1.18, id || '')}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BookingPage;
