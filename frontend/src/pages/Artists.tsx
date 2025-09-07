import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Music, 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { eventsAPI } from '@/services/api';

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
}

const Artists = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  // Sample artists data - in a real app, this would come from an API
  const sampleArtists: Artist[] = [
    {
      id: 1,
      name: "The Himalayan Beats",
      bio: "Nepal's premier folk fusion band, blending traditional instruments with modern sounds.",
      genre: "Folk Fusion",
      image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      upcoming_events: 3,
      total_events: 15,
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
      upcoming_events: 2,
      total_events: 8,
      rating: 4.6,
      social_links: {
        instagram: "https://instagram.com/kathmandujazz",
        facebook: "https://facebook.com/kathmandujazz"
      }
    },
    {
      id: 3,
      name: "Mountain Echo",
      bio: "Acoustic duo specializing in traditional Nepali ballads and contemporary covers.",
      genre: "Acoustic",
      image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      upcoming_events: 4,
      total_events: 12,
      rating: 4.7,
      social_links: {
        instagram: "https://instagram.com/mountainecho",
        youtube: "https://youtube.com/mountainecho"
      }
    },
    {
      id: 4,
      name: "Urban Rhythms",
      bio: "Hip-hop and rap artists representing the voice of Nepal's youth.",
      genre: "Hip-Hop",
      image_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop",
      upcoming_events: 1,
      total_events: 6,
      rating: 4.5,
      social_links: {
        instagram: "https://instagram.com/urbanrhythms",
        twitter: "https://twitter.com/urbanrhythms"
      }
    },
    {
      id: 5,
      name: "Classical Heritage",
      bio: "Traditional classical musicians preserving Nepal's musical heritage.",
      genre: "Classical",
      image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      upcoming_events: 2,
      total_events: 10,
      rating: 4.9,
      social_links: {
        youtube: "https://youtube.com/classicalheritage"
      }
    },
    {
      id: 6,
      name: "Electronic Dreams",
      bio: "Electronic music producers creating ambient soundscapes inspired by the Himalayas.",
      genre: "Electronic",
      image_url: "https://images.unsplash.com/photo-1511379938547-c1f198198a58?w=400&h=400&fit=crop",
      upcoming_events: 3,
      total_events: 9,
      rating: 4.4,
      social_links: {
        instagram: "https://instagram.com/electronicdreams",
        youtube: "https://youtube.com/electronicdreams"
      }
    }
  ];

  const genres = ['all', 'Folk Fusion', 'Jazz', 'Acoustic', 'Hip-Hop', 'Classical', 'Electronic'];

  useEffect(() => {
    const loadArtists = async () => {
      try {
        setLoading(true);
        
        // Fetch events from the database
        const eventsResponse = await eventsAPI.getAll({ limit: 100 });
        const events = eventsResponse.data?.events || [];
        
        // Group events by organizer to create artists
        const artistMap = new Map();
        
        events.forEach(event => {
          const organizerName = event.organizer_name || 'Unknown Artist';
          const organizerId = event.organizer_id;
          
          if (!artistMap.has(organizerId)) {
            artistMap.set(organizerId, {
              id: organizerId,
              name: organizerName,
              bio: `Professional event organizer with ${events.filter(e => e.organizer_id === organizerId).length} events`,
              genre: event.category_name || 'General',
              image_url: event.images?.[0] || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
              upcoming_events: 0,
              total_events: 0,
              rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
              social_links: {
                instagram: `https://instagram.com/${organizerName.toLowerCase().replace(/\s+/g, '')}`,
                youtube: `https://youtube.com/${organizerName.toLowerCase().replace(/\s+/g, '')}`
              },
              events: []
            });
          }
          
          const artist = artistMap.get(organizerId);
          artist.events.push(event);
          artist.total_events++;
          
          // Check if event is upcoming
          const eventDate = new Date(event.start_date);
          const today = new Date();
          if (eventDate >= today) {
            artist.upcoming_events++;
          }
        });
        
        // Convert map to array and sort by upcoming events
        const artistsArray = Array.from(artistMap.values())
          .filter(artist => artist.total_events > 0)
          .sort((a, b) => b.upcoming_events - a.upcoming_events);
        
        setArtists(artistsArray);
        setLoading(false);
      } catch (err) {
        console.error('Error loading artists:', err);
        // Fallback to sample data if API fails
        setArtists(sampleArtists);
        setLoading(false);
      }
    };
    
    loadArtists();
  }, []);

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || artist.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleArtistClick = (artistId: number) => {
    navigate(`/artist/${artistId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading artists...</p>
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
            <p className="text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
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
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">Discover Artists</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Explore talented artists and their upcoming shows across Nepal
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Filter className="h-4 w-4 text-gray-500 mt-3" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre === 'all' ? 'All Genres' : genre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="text-gray-600">
            Showing {filteredArtists.length} artist{filteredArtists.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Artists Grid */}
        {filteredArtists.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <Card 
                key={artist.id} 
                className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105"
                onClick={() => handleArtistClick(artist.id)}
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={artist.image_url}
                      alt={artist.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-purple-600">
                        {artist.genre}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm font-medium">{artist.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2 group-hover:text-purple-600 transition-colors">
                    {artist.name}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 mb-4 line-clamp-2">
                    {artist.bio}
                  </CardDescription>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Upcoming Shows</span>
                      </div>
                      <span className="font-medium text-purple-600">{artist.upcoming_events}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Total Events</span>
                      </div>
                      <span className="font-medium">{artist.total_events}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="group-hover:bg-purple-50 group-hover:border-purple-200 transition-all duration-300 hover:scale-105 hover:shadow-md"
                      >
                        View Profile
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                      
                      <div className="flex gap-2">
                        {artist.social_links.instagram && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Instagram</span>
                            📷
                          </Button>
                        )}
                        {artist.social_links.youtube && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">YouTube</span>
                            ▶️
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Artists;
