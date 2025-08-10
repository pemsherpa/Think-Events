
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    agreeTerms: false,
    marketingEmails: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Enter your first name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Enter your last name"
            required
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+977 98X-XXXXXXX"
            required
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-2">
        <Label htmlFor="emergencyContact">Emergency Contact (Optional)</Label>
        <Input
          id="emergencyContact"
          name="emergencyContact"
          type="tel"
          value={formData.emergencyContact}
          onChange={handleInputChange}
          placeholder="+977 98X-XXXXXXX"
        />
        <p className="text-sm text-gray-500">
          This will only be used in case of emergency during the event
        </p>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeTerms"
            checked={formData.agreeTerms}
            onCheckedChange={(checked) => handleCheckboxChange('agreeTerms', checked as boolean)}
          />
          <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
            I agree to the{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700 underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700 underline">
              Privacy Policy
            </a>
          </Label>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="marketingEmails"
            checked={formData.marketingEmails}
            onCheckedChange={(checked) => handleCheckboxChange('marketingEmails', checked as boolean)}
          />
          <Label htmlFor="marketingEmails" className="text-sm leading-relaxed">
            I would like to receive updates about upcoming events and special offers
          </Label>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Please ensure all information is accurate as it will be used for ticket verification</li>
          <li>• Tickets are non-transferable and non-refundable</li>
          <li>• You must bring a valid ID matching the name on the ticket</li>
          <li>• Entry will be denied for incomplete or incorrect information</li>
        </ul>
      </div>
    </div>
  );
};

export default BookingForm;
