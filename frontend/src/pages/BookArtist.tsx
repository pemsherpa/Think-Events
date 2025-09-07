import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Star, 
  ArrowLeft,
  Music,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Artist {
  id: number;
  name: string;
  bio: string;
  genre: string;
  image_url: string;
  rating: number;
  social_links: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
}

const BookArtist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    event_time: '',
    venue: '',
    city: '',
    event_type: '',
    expected_audience: '',
    budget: '',
    duration: '',
    special_requirements: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    message: ''
  });

  // Sample artist data
  const sampleArtists: Artist[] = [
    {
      id: 1,
      name: "The Himalayan Beats",
      bio: "Nepal's premier folk fusion band, blending traditional instruments with modern sounds.",
      genre: "Folk Fusion",
      image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      rating: 4.8,
      social_links: {
        instagram: "https://instagram.com/himalayanbeats",
        youtube: "https://youtube.com/himalayanbeats"
      }
    },
    {
      id: 2,
      name: "Kathmandu Jazz Collective",
      bio: "Contemporary jazz ensemble pushing the boundaries of Nepali music.",
      genre: "Jazz",
      image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
      rating: 4.6,
      social_links: {
        instagram: "https://instagram.com/kathmandujazz",
        facebook: "https://facebook.com/kathmandujazz"
      }
    }
  ];

  useEffect(() => {
    const loadArtist = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from API
        const foundArtist = sampleArtists.find(a => a.id === parseInt(id || '0'));
        if (foundArtist) {
          setArtist(foundArtist);
        } else {
          navigate('/artists');
        }
      } catch (err) {
        navigate('/artists');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadArtist();
    }
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['event_name', 'event_date', 'event_time', 'venue', 'city', 'contact_name', 'contact_email', 'contact_phone'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // In a real app, you would send this to the backend
      console.log('Booking request:', { artist_id: id, ...formData });
      
      toast({
        title: "Booking request sent!",
        description: "We'll get back to you within 24 hours with a quote.",
      });
      
      // Reset form
      setFormData({
        event_name: '',
        event_date: '',
        event_time: '',
        venue: '',
        city: '',
        event_type: '',
        expected_audience: '',
        budget: '',
        duration: '',
        special_requirements: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        message: ''
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">Artist not found</p>
            <Button onClick={() => navigate('/artists')} className="mt-4">
              Back to Artists
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
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/artists')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Artists
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Book {artist.name}</h1>
          <p className="text-gray-600 mt-2">Fill out the form below to request a booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Artist Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <img
                    src={artist.image_url}
                    alt={artist.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <CardTitle className="text-lg">{artist.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      {artist.rating}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Genre</Label>
                    <p className="text-sm text-gray-600">{artist.genre}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">About</Label>
                    <p className="text-sm text-gray-600">{artist.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>
                  Provide information about your event to get a quote
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Event Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Event Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="event_name">Event Name *</Label>
                        <Input
                          id="event_name"
                          name="event_name"
                          value={formData.event_name}
                          onChange={handleInputChange}
                          placeholder="e.g. Corporate Gala"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="event_type">Event Type</Label>
                        <select
                          id="event_type"
                          name="event_type"
                          value={formData.event_type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select event type</option>
                          <option value="corporate">Corporate Event</option>
                          <option value="wedding">Wedding</option>
                          <option value="birthday">Birthday Party</option>
                          <option value="festival">Festival</option>
                          <option value="concert">Concert</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="event_date">Event Date *</Label>
                        <Input
                          id="event_date"
                          name="event_date"
                          type="date"
                          value={formData.event_date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="event_time">Event Time *</Label>
                        <Input
                          id="event_time"
                          name="event_time"
                          type="time"
                          value={formData.event_time}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="venue">Venue *</Label>
                        <Input
                          id="venue"
                          name="venue"
                          value={formData.venue}
                          onChange={handleInputChange}
                          placeholder="e.g. Hotel Yak & Yeti"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="e.g. Kathmandu"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expected_audience">Expected Audience</Label>
                        <Input
                          id="expected_audience"
                          name="expected_audience"
                          type="number"
                          value={formData.expected_audience}
                          onChange={handleInputChange}
                          placeholder="e.g. 100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (hours)</Label>
                        <Input
                          id="duration"
                          name="duration"
                          type="number"
                          value={formData.duration}
                          onChange={handleInputChange}
                          placeholder="e.g. 2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="budget">Budget (NPR)</Label>
                      <Input
                        id="budget"
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleInputChange}
                        placeholder="e.g. 50000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="special_requirements">Special Requirements</Label>
                      <Textarea
                        id="special_requirements"
                        name="special_requirements"
                        value={formData.special_requirements}
                        onChange={handleInputChange}
                        placeholder="Any special requirements or requests..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact_name">Full Name *</Label>
                        <Input
                          id="contact_name"
                          name="contact_name"
                          value={formData.contact_name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_email">Email *</Label>
                        <Input
                          id="contact_email"
                          name="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="contact_phone">Phone Number *</Label>
                      <Input
                        id="contact_phone"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleInputChange}
                        placeholder="+977-XXXXXXXXX"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Additional Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Any additional information or questions..."
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <Button 
                      type="submit" 
                      className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg"
                      disabled={submitting}
                    >
                      {submitting ? 'Sending Request...' : 'Send Booking Request'}
                    </Button>
                    <p className="text-sm text-gray-500 text-center mt-2">
                      We'll get back to you within 24 hours with a quote and availability.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookArtist;
