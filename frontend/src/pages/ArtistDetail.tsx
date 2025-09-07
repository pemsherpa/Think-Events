import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, 
  Calendar, 
  MapPin, 
  Star, 
  Users, 
  Clock,
  ArrowLeft,
  ExternalLink,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Heart,
  Share2
} from 'lucide-react';
import EventCard from '@/components/Events/EventCard';

interface Artist {
  id: number;
  name: string;
  bio: string;
  genre: string;
  image_url: string;
  upcoming_events: number;
  total_events: number;
  rating: number;
  social_links: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
  upcoming_shows: any[];
  past_shows: any[];
}

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Sample artist data - in a real app, this would come from an API
  const sampleArtists: Artist[] = [
    {
      id: 1,
      name: "The Himalayan Beats",
      bio: "Nepal's premier folk fusion band, blending traditional instruments with modern sounds. With over 10 years of experience, they have performed at major festivals across Nepal and internationally. Their unique sound combines traditional Nepali instruments like the sarangi and madal with contemporary arrangements, creating a bridge between the old and new.",
      genre: "Folk Fusion",
      image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      upcoming_events: 3,
      total_events: 15,
      rating: 4.8,
      social_links: {
        instagram: "https://instagram.com/himalayanbeats",
        youtube: "https://youtube.com/himalayanbeats"
      },
      upcoming_shows: [
        {
          id: 1,
          title: "Folk Fusion Night",
          date: "2024-09-15",
          time: "19:00",
          venue: "Kathmandu Durbar Square",
          city: "Kathmandu",
          price: 1500,
          currency: "NPR",
          available_seats: 50,
          total_seats: 100
        },
        {
          id: 2,
          title: "Mountain Melodies",
          date: "2024-09-22",
          time: "18:30",
          venue: "Pokhara Lakeside",
          city: "Pokhara",
          price: 1200,
          currency: "NPR",
          available_seats: 30,
          total_seats: 80
        }
      ],
      past_shows: [
        {
          id: 3,
          title: "Cultural Heritage Concert",
          date: "2024-08-20",
          venue: "Basantapur Square",
          city: "Kathmandu"
        }
      ]
    },
    {
      id: 2,
      name: "Kathmandu Jazz Collective",
      bio: "Contemporary jazz ensemble pushing the boundaries of Nepali music. Formed in 2018, this group of talented musicians brings fresh perspectives to jazz while incorporating elements of traditional Nepali music. Their performances are known for their improvisational brilliance and emotional depth.",
      genre: "Jazz",
      image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
      upcoming_events: 2,
      total_events: 8,
      rating: 4.6,
      social_links: {
        instagram: "https://instagram.com/kathmandujazz",
        facebook: "https://facebook.com/kathmandujazz"
      },
      upcoming_shows: [
        {
          id: 4,
          title: "Jazz Under the Stars",
          date: "2024-09-18",
          time: "20:00",
          venue: "Garden of Dreams",
          city: "Kathmandu",
          price: 2000,
          currency: "NPR",
          available_seats: 25,
          total_seats: 60
        }
      ],
      past_shows: [
        {
          id: 5,
          title: "Smooth Jazz Evening",
          date: "2024-08-15",
          venue: "Hotel Yak & Yeti",
          city: "Kathmandu"
        }
      ]
    }
  ];

  useEffect(() => {
    const loadArtist = async () => {
      try {
        setLoading(true);
        
        // Fetch events from the database for this artist/organizer
        const eventsResponse = await eventsAPI.getAll({ organizer_id: id, limit: 100 });
        const events = eventsResponse.data?.events || [];
        
        if (events.length === 0) {
          setError('Artist not found');
          return;
        }
        
        // Get the first event to extract artist info
        const firstEvent = events[0];
        const organizerName = firstEvent.organizer_name || 'Unknown Artist';
        
        // Separate upcoming and past events
        const today = new Date();
        const upcomingShows = events
          .filter(event => new Date(event.start_date) >= today)
          .map(event => ({
            id: event.id,
            title: event.title,
            date: event.start_date,
            time: event.start_time,
            venue: event.venue_name,
            city: event.venue_city,
            price: event.price,
            currency: event.currency,
            available_seats: event.available_seats,
            total_seats: event.total_seats
          }));
        
        const pastShows = events
          .filter(event => new Date(event.start_date) < today)
          .map(event => ({
            id: event.id,
            title: event.title,
            date: event.start_date,
            venue: event.venue_name,
            city: event.venue_city
          }));
        
        const artistData: Artist = {
          id: parseInt(id || '0'),
          name: organizerName,
          bio: `Professional event organizer with ${events.length} events. Creating memorable experiences across Nepal.`,
          genre: firstEvent.category_name || 'General',
          image_url: firstEvent.images?.[0] || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
          upcoming_events: upcomingShows.length,
          total_events: events.length,
          rating: 4.5 + Math.random() * 0.5,
          social_links: {
            instagram: `https://instagram.com/${organizerName.toLowerCase().replace(/\s+/g, '')}`,
            youtube: `https://youtube.com/${organizerName.toLowerCase().replace(/\s+/g, '')}`
          },
          upcoming_shows: upcomingShows,
          past_shows: pastShows
        };
        
        setArtist(artistData);
      } catch (err) {
        console.error('Error loading artist:', err);
        setError('Failed to load artist');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadArtist();
    }
  }, [id]);

  const handleBookArtist = () => {
    // Navigate to booking page or show booking modal
    navigate(`/book-artist/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading artist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">{error || 'Artist not found'}</p>
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
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="w-full lg:w-1/3">
              <img
                src={artist.image_url}
                alt={artist.name}
                className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl"
              />
            </div>
            <div className="w-full lg:w-2/3 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  {artist.genre}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm">{artist.rating}</span>
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-4">{artist.name}</h1>
              <p className="text-xl text-purple-100 mb-6 max-w-2xl">
                {artist.bio}
              </p>
              
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">{artist.upcoming_events}</div>
                  <div className="text-sm text-purple-200">Upcoming Shows</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{artist.total_events}</div>
                  <div className="text-sm text-purple-200">Total Shows</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3"
                  onClick={handleBookArtist}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book This Artist
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white/10 px-8 py-3"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Follow
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white/10 px-8 py-3"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
              
              {/* Social Links */}
              <div className="flex gap-4 justify-center lg:justify-start mt-6">
                {artist.social_links.instagram && (
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Instagram className="h-5 w-5" />
                  </Button>
                )}
                {artist.social_links.youtube && (
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Youtube className="h-5 w-5" />
                  </Button>
                )}
                {artist.social_links.twitter && (
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Twitter className="h-5 w-5" />
                  </Button>
                )}
                {artist.social_links.facebook && (
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Facebook className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Shows</TabsTrigger>
            <TabsTrigger value="past">Past Shows</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Shows</h2>
              {artist.upcoming_shows.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Music className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming shows</h3>
                    <p className="text-gray-600">Check back later for new performances.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artist.upcoming_shows.map((show) => (
                    <Card key={show.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="group-hover:text-purple-600 transition-colors">
                          {show.title}
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            {formatDate(show.date)} at {formatTime(show.time)}
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <MapPin className="h-4 w-4" />
                            {show.venue}, {show.city}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-2xl font-bold text-purple-600">
                              रु {show.price.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">{show.currency}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {show.available_seats} of {show.total_seats} seats left
                            </div>
                          </div>
                        </div>
                        <Button className="w-full" onClick={() => navigate(`/book/${show.id}`)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Past Shows</h2>
              {artist.past_shows.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Music className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No past shows</h3>
                    <p className="text-gray-600">This artist hasn't performed any shows yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {artist.past_shows.map((show) => (
                    <Card key={show.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{show.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(show.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {show.venue}, {show.city}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ArtistDetail;
