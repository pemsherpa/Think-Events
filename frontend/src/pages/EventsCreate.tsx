import React, { useEffect, useState, useRef } from 'react';
import Header from '@/components/Layout/Header';
import { eventsAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Camera, X } from 'lucide-react';

const EventsCreate = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category_id', String(form.category_id));
      fd.append('venue_name', form.venue_name);
      fd.append('venue_address', form.venue_address);
      fd.append('venue_city', form.venue_city);
      fd.append('start_date', form.start_date);
      fd.append('end_date', form.end_date || form.start_date);
      fd.append('start_time', form.start_time);
      if (form.end_time) fd.append('end_time', form.end_time);
      if (form.price) fd.append('price', String(form.price));
      fd.append('currency', form.currency || 'NPR');
      fd.append('total_seats', String(form.total_seats));
      if (form.tags) fd.append('tags', form.tags);
      
      // Add image if selected or image URL provided
      if (selectedImage) {
        fd.append('image', selectedImage);
      } else if (form.image_url) {
        fd.append('image_url', form.image_url);
      }

      const res = await eventsAPI.create(fd);
      if (res.success) {
        navigate('/events');
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

          {/* Image Upload */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-2 flex items-center gap-2"><span>🖼️</span> Event Image</label>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload event image</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {/* Image URL Input */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2 text-center">Or enter an image URL:</p>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={form.image_url || ''}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
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
      </div>
    </div>
  );
};

export default EventsCreate;


