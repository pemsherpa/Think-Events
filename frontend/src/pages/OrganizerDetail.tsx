import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { 
  Calendar, 
  Star, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Clock,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import EventCard from '@/components/Events/EventCard';

interface Organizer {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_verified: boolean;
  is_organizer: boolean;
  city?: string;
  state?: string;
  address?: string;
  date_of_birth?: string;
  created_at: string;
  events_count: number;
  average_rating: number;
  total_events: number;
}

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
}

const OrganizerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrganizerDetails();
    }
  }, [id]);

  const fetchOrganizerDetails = async () => {
    try {
      setLoading(true);
      const [organizerResponse, eventsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/organizers/${id}`),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/organizers/${id}/events`)
      ]);

      const organizerData = await organizerResponse.json();
      const eventsData = await eventsResponse.json();

      if (organizerData.success) {
        setOrganizer(organizerData.data);
      } else {
        setError('Organizer not found');
      }

      if (eventsData.success) {
        setEvents(eventsData.data);
      }
    } catch (err) {
      console.error('Error fetching organizer details:', err);
      setError('Failed to load organizer details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading organizer details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !organizer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">{error || 'Organizer not found'}</p>
            <Button onClick={() => navigate('/organizers')} className="mt-4">
              Back to Organizers
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
          onClick={() => navigate('/organizers')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Organizers
        </Button>

        {/* Organizer Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {organizer.first_name?.[0]}{organizer.last_name?.[0]}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {organizer.first_name} {organizer.last_name}
                  </h1>
                  {organizer.is_verified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Award className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 text-lg">@{organizer.username}</p>
                {(organizer.city || organizer.state) && (
                  <div className="flex items-center text-gray-600 mt-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{[organizer.city, organizer.state].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{organizer.total_events || 0}</div>
                  <div className="text-gray-600 text-sm">Events</div>
                </div>
                {organizer.average_rating > 0 && (
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{organizer.average_rating.toFixed(1)}</div>
                    <div className="text-gray-600 text-sm">Rating</div>
                  </div>
                )}
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {organizer.created_at ? formatDate(organizer.created_at).split(' ')[2] : '2024'}
                  </div>
                  <div className="text-gray-600 text-sm">Since</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Organizer Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {organizer.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{organizer.email}</p>
                    </div>
                  </div>
                )}
                
                {organizer.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{organizer.phone}</p>
                    </div>
                  </div>
                )}

                {organizer.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-gray-600">{organizer.address}</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium">
                      {organizer.created_at ? formatDate(organizer.created_at) : '2024'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total events</span>
                    <span className="font-medium">{organizer.total_events || 0}</span>
                  </div>
                  {organizer.average_rating > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Average rating</span>
                      <span className="font-medium flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        {organizer.average_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Events by {organizer.first_name}</h2>
              <p className="text-gray-600">Discover amazing events organized by this organizer</p>
            </div>

            {events.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                  <p className="text-gray-600">This organizer hasn't created any events yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDetail;
