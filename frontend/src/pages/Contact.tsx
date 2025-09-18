import React, { useState } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Mail, MessageCircle, Send } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as any;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // For now, just simulate submit
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="h-7 w-7" />
              <h1 className="text-2xl sm:text-3xl font-bold">Get in touch</h1>
            </div>
            <p className="text-white/90">We’d love to hear from you. Reach us directly on WhatsApp or email.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/9779841753666`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-medium shadow-lg transition-colors"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp: +977 9841753666
              </a>
              <a
                href={`mailto:thapakashchitbikram@gmail.com`}
                className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 hover:bg-purple-50 px-5 py-3 rounded-xl font-medium shadow-lg transition-colors"
              >
                <Mail className="h-5 w-5" /> Email: thapakashchitbikram@gmail.com
              </a>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">
            <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4">
                Thanks! We’ve received your message and will get back to you soon.
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Your Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="you@email.com"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-4 py-3 h-36 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg disabled:opacity-70"
                  >
                    <Send className="h-4 w-4" /> {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;


