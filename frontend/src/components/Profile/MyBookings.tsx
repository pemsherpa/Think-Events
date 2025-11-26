import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Ticket, Star, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bookingsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Booking {
  id: number;
  event_title: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  venue_city: string;
  seats: string[];
  total_amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  booking_date: string;
  payment_status: 'paid' | 'pending' | 'failed';
}

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getUserBookings();
      const apiBookings = response.data?.bookings || response.data || [];
      const normalized = apiBookings.map((b: any) => ({
        id: b.id,
        event_title: b.event_title,
        event_date: b.start_date,
        event_time: b.start_time,
        venue_name: b.venue_name,
        venue_city: b.venue_city,
        seats: b.seat_numbers || [],
        total_amount: b.total_amount,
        status: b.status,
        booking_date: b.booking_date,
        payment_status: b.payment_status === 'completed' ? 'paid' : (b.payment_status || 'pending'),
        event_id: b.event_id,
        event_organizer_id: b.event_organizer_id,
      }));
      setBookings(normalized);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      // Mock data for demonstration
      setBookings([
        {
          id: 1,
          event_title: 'Sajjan Raj Vaidya Live in Concert',
          event_date: '2024-12-15',
          event_time: '19:00',
          venue_name: 'Dashrath Stadium',
          venue_city: 'Kathmandu',
          seats: ['A1', 'A2', 'A3'],
          total_amount: 4500,
          status: 'confirmed',
          booking_date: '2024-11-20',
          payment_status: 'paid'
        },
        {
          id: 2,
          event_title: 'Nepal Music Festival 2024',
          event_date: '2024-12-19',
          event_time: '18:00',
          venue_name: 'Dashrath Stadium',
          venue_city: 'Kathmandu',
          seats: ['VIP Section-1', 'VIP Section-2'],
          total_amount: 3600,
          status: 'pending',
          booking_date: '2024-11-25',
          payment_status: 'pending'
        },
        {
          id: 3,
          event_title: 'Nepal Premier League 2024',
          event_date: '2024-09-30',
          event_time: '16:00',
          venue_name: 'Dashrath Stadium',
          venue_city: 'Kathmandu',
          seats: ['North Stand-1', 'North Stand-2', 'North Stand-3'],
          total_amount: 5400,
          status: 'confirmed',
          booking_date: '2024-09-15',
          payment_status: 'paid'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (_bookingId: number) => {
    // Disabled by business rules
  };

  const handleCompletePayment = async (bookingId: number) => {
    try {
      await bookingsAPI.updateStatus(bookingId, { payment_status: 'completed' });
      await fetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadTicket = (booking: any) => {
    const customerName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Guest';
    const seats = (booking.seats || []).join(', ');
    const bookingRef = String(booking.id).padStart(6, '0');
    const eventDate = formatDate(booking.event_date);
    const eventTime = formatTime(booking.event_time);
    const total = booking.total_amount;
    const qrPayload = encodeURIComponent(JSON.stringify({
      bookingId: booking.id,
      eventId: booking.event_id,
      title: booking.event_title,
      seats: booking.seats,
      date: booking.event_date,
      time: booking.event_time
    }));
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=${qrPayload}&chld=L|0`;

    const ticketHtml = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ticket - ${booking.event_title}</title>
    <style>
      body{margin:0;background:#f3f4f6;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif;color:#111827}
      .wrap{padding:24px}
      .ticket{max-width:840px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,.12);overflow:hidden;display:flex;border:1px solid #e5e7eb}
      .stub{background:linear-gradient(180deg,#7c3aed,#4f46e5);color:#fff;padding:24px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
      .stub .logo{width:42px;height:42px;border-radius:10px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-weight:700}
      .perforation{width:16px;position:relative;background:#fff}
      .perforation:before, .perforation:after{content:"";position:absolute;left:50%;transform:translateX(-50%);width:16px;height:16px;border-radius:50%;background:#f3f4f6;border:1px solid #e5e7eb}
      .perforation:before{top:-8px}
      .perforation:after{bottom:-8px}
      .perforation .dashes{position:absolute;top:0;bottom:0;left:50%;transform:translateX(-50%);border-left:2px dashed #e5e7eb}
      .content{flex:1;padding:24px 28px}
      h1{margin:0 0 6px;font-size:22px}
      .meta{display:flex;flex-wrap:wrap;gap:14px;color:#6b7280;font-size:12px;margin-bottom:14px}
      .row{display:flex;justify-content:space-between;gap:16px}
      .box{background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px;margin-top:12px}
      .label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.04em}
      .value{font-weight:600;margin-top:4px}
      .barcode{margin-top:18px;height:48px;background:repeating-linear-gradient(90deg,#111827 0,#111827 2px,transparent 2px,transparent 4px)}
      .footer{margin-top:18px;text-align:center;color:#6b7280;font-size:11px}
      @media print{.wrap{padding:0}.ticket{box-shadow:none;border:none}.perforation:before,.perforation:after{background:#fff;border-color:#fff}}
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="ticket">
        <div class="stub">
          <div class="logo">TE</div>
          <div style="font-size:12px;opacity:.95">Think Event</div>
          <div style="font-size:11px;opacity:.8">Ref #${bookingRef}</div>
        </div>
        <div class="perforation"><div class="dashes"></div></div>
        <div class="content">
          <h1>${booking.event_title}</h1>
          <div class="meta">${booking.venue_name}, ${booking.venue_city}</div>
          <div class="row">
            <div class="box" style="flex:1">
              <div class="label">Attendee</div>
              <div class="value">${customerName || '—'}</div>
            </div>
            <div class="box" style="width:180px">
              <div class="label">Date</div>
              <div class="value">${eventDate}</div>
            </div>
            <div class="box" style="width:120px">
              <div class="label">Time</div>
              <div class="value">${eventTime}</div>
            </div>
          </div>
          <div class="row">
            <div class="box" style="flex:1">
              <div class="label">Seats</div>
              <div class="value">${seats || 'General Admission'}</div>
            </div>
            <div class="box" style="width:160px">
              <div class="label">Amount</div>
              <div class="value">रु ${Number(total).toLocaleString()}</div>
            </div>
          </div>
          <div style="margin-top:18px; display:flex; align-items:center; gap:16px;">
            <div>
              <div class="label">Ticket QR</div>
              <img src="${qrUrl}" alt="Ticket QR" width="140" height="140" style="border:1px solid #e5e7eb;border-radius:8px;padding:6px;background:#fff" />
            </div>
            <div style="flex:1">
              <div class="barcode"></div>
              <div class="footer">Scan QR at entry for validation. Keep this ticket handy.</div>
            </div>
          </div>
          <div class="footer">Please bring a valid ID. This ticket is non-transferable. Powered by Think Event.</div>
        </div>
      </div>
    </div>
    <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
  </body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(ticketHtml);
      printWindow.document.close();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventExpired = (booking: Booking) => {
    const eventDateTime = new Date(`${booking.event_date}T${booking.event_time}`);
    return eventDateTime < new Date();
  };

  const filteredBookings = {
    all: bookings,
    confirmed: bookings.filter(b => b.status === 'confirmed'),
    pending: bookings.filter(b => b.status === 'pending'),
    cancelled: bookings.filter(b => b.status === 'cancelled'),
    expired: bookings.filter(b => b.status === 'confirmed' && isEventExpired(b))
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-2 text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchBookings} className="bg-purple-600 hover:bg-purple-700">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <Button onClick={fetchBookings} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-4">Start exploring events and make your first booking!</p>
          <Button onClick={() => navigate('/events')} className="bg-purple-600 hover:bg-purple-700">
            Browse Events
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({filteredBookings.all.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({filteredBookings.confirmed.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({filteredBookings.pending.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({filteredBookings.cancelled.length})</TabsTrigger>
            <TabsTrigger value="expired">Expired ({filteredBookings.expired.length})</TabsTrigger>
          </TabsList>

          {Object.entries(filteredBookings).map(([status, statusBookings]) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {statusBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className={`bg-white rounded-2xl shadow-lg border overflow-hidden ${
                    isEventExpired(booking) ? 'opacity-60 grayscale' : ''
                  }`}
                >
                  <div className="flex items-stretch">
                    <div className="hidden md:flex bg-gradient-to-b from-purple-600 to-indigo-600 text-white px-4 py-6 items-center justify-center">
                      <Ticket className="h-7 w-7" />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{booking.event_title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </Badge>
                          {isEventExpired(booking) && (
                            <Badge className="bg-gray-500 text-white">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              EXPIRED
                            </Badge>
                          )}
                          <Badge className={getPaymentStatusColor(booking.payment_status)}>
                            {booking.payment_status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                          <span>{formatDate(booking.event_date)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-purple-600" />
                          <span>{formatTime(booking.event_time)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                          <span>{booking.venue_name}, {booking.venue_city}</span>
                        </div>
                        <div className="flex items-center">
                          <Ticket className="h-4 w-4 mr-2 text-purple-600" />
                          <span>{booking.seats.length} seat{booking.seats.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Selected Seats:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {booking.seats.map((seat, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {seat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-lg font-semibold text-gray-900">रु {booking.total_amount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Booked on {formatDate(booking.booking_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 lg:ml-4">
                      {booking.status === 'pending' && !isEventExpired(booking) && (
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => handleCompletePayment(booking.id)}>
                          Complete Payment
                        </Button>
                      )}
                      {booking.status === 'confirmed' && !isEventExpired(booking) && (
                        <Button size="sm" variant="outline" onClick={() => handleDownloadTicket(booking)}>
                          Download Ticket
                        </Button>
                      )}
                      {/* Cancellation disabled by business rule */}
                      {isEventExpired(booking) && (
                        <Button size="sm" variant="outline" disabled className="text-gray-500">
                          Event Expired
                        </Button>
                      )}
                      {user && (user.id === (booking as any).event_organizer_id) && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate(`/events/edit/${(booking as any).event_id}`)}>
                          Edit Event
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-1"></div>
                </div>
              </div>
            </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default MyBookings;
