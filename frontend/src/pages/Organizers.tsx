
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Users, Calendar, Star, Award, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Organizer {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_verified: boolean;
  total_events: string | number; // API returns this as string
  average_rating: string | number; // API returns this as string
  city?: string;
  state?: string;
}

const Organizers = () => {
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching organizers from:', `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/organizers`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/organizers`);
      const data = await response.json();
      
      console.log('Organizers API response:', data);
      
      if (data.success) {
        const organizersData = data.data || [];
        console.log('Setting organizers data:', organizersData);
        setOrganizers(organizersData);
      } else {
        setError(data.message || 'Failed to load organizers');
      }
    } catch (err) {
      console.error('Error fetching organizers:', err);
      setError('Failed to load organizers. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizerClick = (organizerId: number) => {
    navigate(`/organizer/${organizerId}`);
  };

  // Convert string numbers to actual numbers for display
  const formatNumber = (value: string | number) => {
    if (typeof value === 'string') {
      return parseInt(value) || 0;
    }
    return value || 0;
  };

  const formatRating = (value: string | number) => {
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    return value || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading organizers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchOrganizers} className="mt-4">
              Try Again
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Organizers</h1>
          <p className="text-gray-600">Meet the best event organizers in Nepal</p>
        </div>

        {organizers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No organizers found.</p>
            <Button onClick={fetchOrganizers} className="mt-4">
              Refresh
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizers.map((organizer) => (
              <Card 
                key={organizer.id} 
                className="hover:shadow-xl transition-all cursor-pointer"
                onClick={() => handleOrganizerClick(organizer.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {organizer.first_name} {organizer.last_name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        @{organizer.username}
                      </CardDescription>
                    </div>
                    {organizer.is_verified && (
                      <Badge className="bg-green-100 text-green-800">
                        <Award className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatNumber(organizer.total_events)} events organized</span>
                    </div>
                    {formatRating(organizer.average_rating) > 0 && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                        <span>{formatRating(organizer.average_rating).toFixed(1)} rating</span>
                      </div>
                    )}
                    {organizer.email && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="truncate">{organizer.email}</span>
                      </div>
                    )}
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Organizers;
