import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { eventsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const EventsEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await eventsAPI.getById(id);
        setForm(res.data);
      } catch (e: any) {
        setError(e.message || 'Failed to load event');
      }
    };
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as any;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload: any = {};
      ['title','description','category_id','venue_id','start_date','end_date','start_time','end_time','price','currency','total_seats','tags']
        .forEach((k) => {
          if (form?.[k] !== undefined && form?.[k] !== null && form?.[k] !== '') payload[k] = form[k];
        });
      const res = await eventsAPI.update(id, payload);
      if (res.success) navigate(`/events`);
      else setError(res.message || 'Failed to update event');
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">Loading...</div>
      </div>
    );
  }

  const isOwner = user && form.organizer_id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {!isOwner && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            <p className="text-sm">You are not allowed to edit this event.</p>
          </div>
        )}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Event</h1>
          <p className="text-gray-600">Update your event details</p>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Event Title</label>
            <input name="title" value={form.title || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" value={form.description || ''} onChange={handleChange} className="w-full border rounded px-3 py-2 h-28" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" name="start_date" value={form.start_date || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input type="date" name="end_date" value={form.end_date || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input type="time" name="start_time" value={form.start_time || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input type="time" name="end_time" value={form.end_time || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ticket Price</label>
            <input name="price" type="number" value={form.price || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total Seats</label>
            <input name="total_seats" type="number" value={form.total_seats || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          {error && <div className="col-span-2 text-red-600 text-sm">{error}</div>}

          <div className="col-span-2">
            <button disabled={!isOwner || submitting} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventsEdit;


