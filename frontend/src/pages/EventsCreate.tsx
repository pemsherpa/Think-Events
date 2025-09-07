import React, { useEffect, useState } from 'react';
import Header from '@/components/Layout/Header';
import { eventsAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, X, Settings } from 'lucide-react';
import SeatLayoutManager from '@/components/SeatLayout/SeatLayoutManager';

const EventsCreate = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSeatLayout, setShowSeatLayout] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    venue_name: '',
    venue_address: '',
    venue_city: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    price: '',
    currency: 'NPR',
    total_seats: '',
    tags: '',
    image_url: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    const loadMeta = async () => {
      try {
        const cats = await eventsAPI.getCategories();
        setCategories(cats.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadMeta();
  }, [user, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as any;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUrlChange = (url: string) => {
    setForm(prev => ({ ...prev, image_url: url }));
    if (url) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, image_url: '' }));
    setImagePreview(null);
  };

  const validate = () => {
    if (!form.title || !form.category_id || !form.venue_name || !form.venue_city || !form.start_date || !form.start_time || !form.total_seats) {
      return 'Please fill all required fields';
    }
    const sd = new Date(form.start_date);
    const ed = form.end_date ? new Date(form.end_date) : sd;
    if (ed < sd) return 'End date cannot be before start date';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      
      const eventData = {
        title: form.title,
        description: form.description,
        category_id: parseInt(form.category_id),
        venue_name: form.venue_name,
        venue_address: form.venue_address,
        venue_city: form.venue_city,
        start_date: form.start_date,
        end_date: form.end_date || form.start_date,
        start_time: form.start_time,
        end_time: form.end_time || null,
        price: form.price ? parseFloat(form.price) : null,
        currency: form.currency || 'NPR',
        total_seats: parseInt(form.total_seats),
        tags: form.tags || null,
        image_url: form.image_url || null
      };

      const res = await eventsAPI.create(eventData);
      if (res.success) {
        setCreatedEventId(res.data.id);
        setShowSeatLayout(true);
      } else {
        setError(res.message || 'Failed to create event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {!user && !loading && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
            <p className="text-sm">You must be logged in to create an event. <a href="/login" className="underline">Log in</a></p>
          </div>
        )}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-purple-100 text-purple-700">🎫</span>
            Create Event
          </h1>
          <p className="text-gray-600">Add details for your new event</p>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>📝</span> Event Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. Music Night" />
          </div>

          {/* Image URL Input */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-2 flex items-center gap-2"><span>🖼️</span> Event Image URL</label>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-48 object-cover rounded-lg border"
                    onError={() => setImagePreview(null)}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Enter an image URL to preview</p>
                  <p className="text-sm text-gray-500">Supports JPG, PNG, GIF formats</p>
                </div>
              )}
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={form.image_url || ''}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>📄</span> Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2 h-28" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>🏷️</span> Category *</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select category</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>📍</span> Venue Name *</label>
            <input name="venue_name" value={form.venue_name} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. Dashrath Stadium" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>🏠</span> Venue Address</label>
            <input name="venue_address" value={form.venue_address} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. Tripureshwor, Kathmandu" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>🌍</span> City *</label>
            <input name="venue_city" value={form.venue_city} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. Kathmandu" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>📆</span> Start Date *</label>
            <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>📆</span> End Date</label>
            <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>⏰</span> Start Time *</label>
            <input type="time" step="60" name="start_time" value={form.start_time} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>⏰</span> End Time</label>
            <input type="time" step="60" name="end_time" value={form.end_time} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>💵</span> Ticket Price (NPR)</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>🎟️</span> Total Seats *</label>
            <input name="total_seats" type="number" value={form.total_seats} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>🔖</span> Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="music, live, outdoor" />
          </div>

          {error && (
            <div className="col-span-1 md:col-span-2 text-red-600 text-sm">{error}</div>
          )}

          <div className="col-span-1 md:col-span-2">
            <button disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg">
              {submitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>

        {/* Seat Layout Configuration */}
        {showSeatLayout && createdEventId && (
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6 text-purple-600" />
                Configure Seat Layout
              </h2>
              <p className="text-gray-600">Set up the seating arrangement for your event (optional)</p>
            </div>
            
            <SeatLayoutManager 
              eventId={createdEventId}
              onLayoutChange={() => {
                // Optional: Show success message or navigate
                setTimeout(() => {
                  navigate('/events');
                }, 2000);
              }}
            />
            
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => navigate('/events')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Skip for Now
              </button>
              <button
                onClick={() => navigate('/events')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Continue to Events
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsCreate;


