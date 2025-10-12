import React, { useEffect, useState } from 'react';
import Header from '@/components/Layout/Header';
import { eventsAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, X, Settings, CheckCircle, AlertCircle, Upload, Calendar, MapPin, Clock, DollarSign, Users, Tag, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import SeatLayoutManager from '@/components/SeatLayout/SeatLayoutManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const EventsCreate = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSeatLayout, setShowSeatLayout] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<number | null>(null);
  const [eventCreated, setEventCreated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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

  const steps = [
    { id: 1, title: 'Event Details', icon: FileText, description: 'Basic information and description' },
    { id: 2, title: 'Venue & Timing', icon: MapPin, description: 'Location, date and capacity' },
    { id: 3, title: 'Create Event', icon: CheckCircle, description: 'Review and publish' }
  ];

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
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!form.title.trim()) errors.title = 'Event title is required';
        if (!form.category_id) errors.category_id = 'Please select a category';
        if (form.title.length > 100) errors.title = 'Title must be less than 100 characters';
        break;
      case 2:
        if (!form.venue_name.trim()) errors.venue_name = 'Venue name is required';
        if (!form.venue_city.trim()) errors.venue_city = 'City is required';
        if (!form.start_date) errors.start_date = 'Start date is required';
        if (!form.start_time) errors.start_time = 'Start time is required';
        if (!form.total_seats || parseInt(form.total_seats) <= 0) {
          errors.total_seats = 'Total seats must be greater than 0';
        }
        if (form.price && parseFloat(form.price) < 0) {
          errors.price = 'Price cannot be negative';
        }
        if (form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
          errors.end_date = 'End date cannot be before start date';
        }
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Please select an image smaller than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);
      
      // Create FormData
      const formData = new FormData();
      formData.append('eventImage', file);

      // Upload to server
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/events/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setForm(prev => ({
          ...prev,
          image_url: data.data.image_url
        }));
        setImagePreview(data.data.image_url);
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
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
    console.log('Form submitted!', form);
    
    // Prevent multiple event creation
    if (eventCreated) {
      console.log('Event already created, preventing duplicate creation');
      return;
    }
    
    // Validate all steps before submission
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    
    if (!step1Valid || !step2Valid) {
      setError('Please complete all required fields before submitting');
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

      console.log('Sending event data:', eventData);
      const res = await eventsAPI.create(eventData);
      console.log('Event creation response:', res);
      
      if (res.success) {
        setCreatedEventId(res.data.id);
        setEventCreated(true);
        setShowSeatLayout(true);
        console.log('Event created successfully with ID:', res.data.id);
        // Show success message
        alert('Event created successfully! You can now configure the seating layout.');
      } else {
        setError(res.message || 'Failed to create event');
      }
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                Basic Information
              </CardTitle>
              <p className="text-purple-100">Tell us about your event</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                  <span className="text-purple-600">🎫</span>
                  Event Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter an engaging event title..."
                  className={`transition-all ${formErrors.title ? 'border-red-500 focus:border-red-500' : 'focus:border-purple-500'}`}
                />
                {formErrors.title && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id" className="text-sm font-medium flex items-center gap-2">
                  <span className="text-purple-600">🏷️</span>
                  Category *
                </Label>
                <Select name="category_id" value={form.category_id} onValueChange={(value) => handleChange({ target: { name: 'category_id', value } } as any)}>
                  <SelectTrigger className={`transition-all ${formErrors.category_id ? 'border-red-500 focus:border-red-500' : 'focus:border-purple-500'}`}>
                    <SelectValue placeholder="Select event category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category_id && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.category_id}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                  <span className="text-purple-600">📄</span>
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your event in detail..."
                  className="min-h-[120px] focus:border-purple-500 transition-all"
                />
                <p className="text-xs text-gray-500">Help attendees understand what to expect</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url" className="text-sm font-medium flex items-center gap-2">
                  <span className="text-purple-600">🖼️</span>
                  Event Image
                </Label>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Event preview"
                        className="w-full h-64 md:h-80 object-cover rounded-lg border-2 border-purple-200 shadow-lg"
                        onError={() => setImagePreview(null)}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                      <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Add an image to make your event stand out</p>
                      <p className="text-sm text-gray-500">Supports JPG, PNG, GIF formats</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="imageFile" className="text-sm font-medium text-gray-700 mb-2 block">
                        Upload from Computer
                      </Label>
                      <Input
                        id="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="focus:border-purple-500 transition-all"
                      />
                      {uploadingImage && (
                        <p className="text-sm text-purple-600 mt-1">Uploading image...</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="image_url" className="text-sm font-medium text-gray-700 mb-2 block">
                        Or paste image URL
                      </Label>
                      <Input
                        id="image_url"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={form.image_url || ''}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        className="focus:border-purple-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <MapPin className="h-6 w-6" />
                Venue, Date & Pricing
              </CardTitle>
              <p className="text-blue-100">Where, when, and how much?</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="venue_name" className="text-sm font-medium flex items-center gap-2">
                    <span className="text-blue-600">📍</span>
                    Venue Name *
                  </Label>
                  <Input
                    id="venue_name"
                    name="venue_name"
                    value={form.venue_name}
                    onChange={handleChange}
                    placeholder="e.g. Dashrath Stadium"
                    className={`transition-all ${formErrors.venue_name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {formErrors.venue_name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.venue_name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue_city" className="text-sm font-medium flex items-center gap-2">
                    <span className="text-blue-600">🌍</span>
                    City *
                  </Label>
                  <Input
                    id="venue_city"
                    name="venue_city"
                    value={form.venue_city}
                    onChange={handleChange}
                    placeholder="e.g. Kathmandu"
                    className={`transition-all ${formErrors.venue_city ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {formErrors.venue_city && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.venue_city}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue_address" className="text-sm font-medium flex items-center gap-2">
                  <span className="text-blue-600">🏠</span>
                  Venue Address
                </Label>
                <Input
                  id="venue_address"
                  name="venue_address"
                  value={form.venue_address}
                  onChange={handleChange}
                  placeholder="e.g. Tripureshwor, Kathmandu"
                  className="focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Start Date *
                  </Label>
                  <Input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className={`transition-all ${formErrors.start_date ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {formErrors.start_date && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.start_date}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    End Date
                  </Label>
                  <Input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    className={`transition-all ${formErrors.end_date ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {formErrors.end_date && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.end_date}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_time" className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Start Time *
                  </Label>
                  <Input
                    type="time"
                    step="60"
                    id="start_time"
                    name="start_time"
                    value={form.start_time}
                    onChange={handleChange}
                    className={`transition-all ${formErrors.start_time ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {formErrors.start_time && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.start_time}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time" className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    End Time
                  </Label>
                  <Input
                    type="time"
                    step="60"
                    id="end_time"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    className="focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Pricing and Capacity Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Pricing & Capacity
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                      <span className="text-blue-600">💵</span>
                      Ticket Price (NPR)
                    </Label>
                    <Input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0"
                      className={`transition-all ${formErrors.price ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                    />
                    {formErrors.price && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {formErrors.price}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">Leave empty for free events</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_seats" className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Total Seats *
                    </Label>
                    <Input
                      name="total_seats"
                      type="number"
                      value={form.total_seats}
                      onChange={handleChange}
                      placeholder="100"
                      className={`transition-all ${formErrors.total_seats ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                    />
                    {formErrors.total_seats && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {formErrors.total_seats}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    Tags
                  </Label>
                  <Input
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                    placeholder="music, live, outdoor, family-friendly"
                    className="focus:border-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-500">Separate tags with commas to help people find your event</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                Review & Create
              </CardTitle>
              <p className="text-purple-100">Review your event details before publishing</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Event Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Title:</span>
                          <span className="font-medium">{form.title || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">
                            {categories.find((c: any) => c.id.toString() === form.category_id)?.name || 'Not selected'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">
                            {form.price ? `रु ${form.price}` : 'Free'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium">{form.total_seats || 'Not set'} seats</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Venue & Timing</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Venue:</span>
                          <span className="font-medium">{form.venue_name || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">City:</span>
                          <span className="font-medium">{form.venue_city || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">
                            {form.start_date ? new Date(form.start_date).toLocaleDateString() : 'Not set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">{form.start_time || 'Not set'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {form.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{form.description}</p>
                  </div>
                )}

                {form.tags && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {form.tags.split(',').map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Error</span>
                    </div>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!user && !loading && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
            <p className="text-sm">You must be logged in to create an event. <a href="/login" className="underline">Log in</a></p>
          </div>
        )}
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Create Your Event
          </h1>
          <p className="text-gray-600 text-lg">Share your passion with the world</p>
        </div>

        <form onSubmit={onSubmit}>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-purple-600 border-purple-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <Progress value={(currentStep / 3) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={submitting || eventCreated}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Event...
                </>
              ) : eventCreated ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Event Created
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Create Event
                </>
              )}
            </Button>
          )}
        </div>

        {/* Seat Layout Configuration */}
        {showSeatLayout && createdEventId && (
          <Card className="mt-8 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <Settings className="h-6 w-6" />
                Configure Seat Layout
              </CardTitle>
              <p className="text-indigo-100">Set up the seating arrangement for your event (optional)</p>
            </CardHeader>
            <CardContent className="p-6">
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/events')}
                  className="flex items-center gap-2"
                >
                  Skip for Now
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Continue to Events
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        </form>
      </div>
    </div>
  );
};

export default EventsCreate;


