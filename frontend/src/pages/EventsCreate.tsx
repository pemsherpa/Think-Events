import React, { useEffect, useState } from 'react';
import Header from '@/components/Layout/Header';
import { eventsAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const EventsCreate = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    venue_id: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    price: '',
    currency: 'NPR',
    total_seats: '',
    tags: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    const loadMeta = async () => {
      try {
        const [cats, vens] = await Promise.all([
          eventsAPI.getCategories(),
          eventsAPI.getVenues(),
        ]);
        setCategories(cats.data || []);
        setVenues(vens.data?.venues || []);
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

  const validate = () => {
    if (!form.title || !form.category_id || !form.venue_id || !form.start_date || !form.start_time || !form.total_seats) {
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
      fd.append('venue_id', String(form.venue_id));
      fd.append('start_date', form.start_date);
      fd.append('end_date', form.end_date || form.start_date);
      fd.append('start_time', form.start_time);
      if (form.end_time) fd.append('end_time', form.end_time);
      if (form.price) fd.append('price', String(form.price));
      fd.append('currency', form.currency || 'NPR');
      fd.append('total_seats', String(form.total_seats));
      if (form.tags) fd.append('tags', form.tags);

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
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><span>📍</span> Venue *</label>
            <select name="venue_id" value={form.venue_id} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select venue</option>
              {venues.map((v: any) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
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


