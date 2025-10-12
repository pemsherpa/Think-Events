// Dynamic App Configuration
export const APP_CONFIG = {
  // Currency Configuration
  currency: {
    symbol: 'रु',
    code: 'NPR',
    name: 'Nepali Rupee',
    decimalPlaces: 0,
    format: (amount: number) => `रु ${amount.toLocaleString('en-NP')}`
  },

  // Seat Categories - Dynamic Configuration
  seatCategories: {
    VIP: {
      name: 'VIP',
      color: '#F59E0B',
      description: 'Premium VIP seating',
      icon: '👑',
      defaultPrice: 2500
    },
    Premium: {
      name: 'Premium',
      color: '#3B82F6',
      description: 'Premium seating',
      icon: '⭐',
      defaultPrice: 1500
    },
    Standard: {
      name: 'Standard',
      color: '#10B981',
      description: 'Standard seating',
      icon: '🪑',
      defaultPrice: 800
    },
    Economy: {
      name: 'Economy',
      color: '#6B7280',
      description: 'Economy seating',
      icon: '💺',
      defaultPrice: 400
    },
    Disabled: {
      name: 'Disabled',
      color: '#EF4444',
      description: 'Disabled/Unavailable seats',
      icon: '❌',
      defaultPrice: 0
    }
  },

  // Venue Types - Dynamic Configuration
  venueTypes: {
    theater: {
      name: 'Theater',
      description: 'Traditional theater with rows and columns',
      icon: '🎭',
      defaultRows: 10,
      defaultColumns: 12,
      seatNaming: 'alphabetical' // A1, A2, B1, B2...
    },
    stadium: {
      name: 'Stadium',
      description: 'Sports stadium with sections',
      icon: '🏟️',
      defaultRows: 4,
      defaultColumns: 5,
      seatNaming: 'sectional' // North Stand-1, South Stand-1...
    },
    movie: {
      name: 'Movie Hall',
      description: 'Cinema hall with stadium seating',
      icon: '🎬',
      defaultRows: 12,
      defaultColumns: 16,
      seatNaming: 'alphabetical'
    },
    openground: {
      name: 'Open Ground',
      description: 'Outdoor venue with sections',
      icon: '🌳',
      defaultRows: 3,
      defaultColumns: 4,
      seatNaming: 'sectional'
    },
    simple_counter: {
      name: 'Simple Counter',
      description: 'General admission without specific seats',
      icon: '🎫',
      defaultRows: 0,
      defaultColumns: 0,
      seatNaming: 'none'
    }
  },

  // Booking Types
  bookingTypes: {
    one_time: {
      name: 'One Time',
      description: 'Each seat can only be booked once',
      maxBookingsPerSeat: 1
    },
    multiple: {
      name: 'Multiple',
      description: 'Seats can be booked multiple times up to capacity',
      maxBookingsPerSeat: 5
    }
  },

  // Pricing Configuration
  pricing: {
    serviceFeePercentage: 5, // 5% service fee
    taxPercentage: 13, // 13% VAT
    currencySymbol: 'रु',
    freeEventThreshold: 0
  },

  // Event Categories - Dynamic Configuration
  eventCategories: {
    music: {
      name: 'Music & Concerts',
      icon: '🎵',
      color: '#FF6B6B',
      description: 'Live music performances and concerts'
    },
    sports: {
      name: 'Sports & Fitness',
      icon: '⚽',
      color: '#4ECDC4',
      description: 'Sports events and fitness activities'
    },
    technology: {
      name: 'Technology & Business',
      icon: '💻',
      color: '#45B7D1',
      description: 'Tech conferences and business events'
    },
    food: {
      name: 'Food & Drink',
      icon: '🍕',
      color: '#FFEAA7',
      description: 'Food festivals and culinary events'
    },
    education: {
      name: 'Education & Workshops',
      icon: '📚',
      color: '#DDA0DD',
      description: 'Learning and skill development events'
    },
    arts: {
      name: 'Arts & Culture',
      icon: '🎨',
      color: '#FF9F43',
      description: 'Art exhibitions and cultural events'
    },
    festival: {
      name: 'Festival',
      icon: '🎪',
      color: '#6C5CE7',
      description: 'Festival events'
    },
    trekking: {
      name: 'Trekking',
      icon: '🥾',
      color: '#00B894',
      description: 'Trekking events'
    }
  },

  // App Settings
  app: {
    name: 'Think Events',
    tagline: 'Discover Nepal',
    logo: '🎫',
    primaryColor: '#7C3AED',
    secondaryColor: '#4F46E5',
    supportEmail: 'support@thinkevents.com',
    supportPhone: '+977-1-XXXXXXX'
  },

  // Booking Flow Configuration
  bookingFlow: {
    steps: [
      { id: 'seats', name: 'Select Seats', icon: '🎫' },
      { id: 'info', name: 'Your Info', icon: '👤' },
      { id: 'payment', name: 'Payment', icon: '💳' }
    ],
    allowGuestBooking: true,
    requirePhoneVerification: true,
    requireEmailVerification: false
  },

  // Payment Methods
  paymentMethods: {
    wallet: {
      name: 'Digital Wallet',
      icon: '💳',
      enabled: true,
      processingFee: 0
    },
    bank_transfer: {
      name: 'Bank Transfer',
      icon: '🏦',
      enabled: true,
      processingFee: 0
    },
    cash: {
      name: 'Cash Payment',
      icon: '💵',
      enabled: true,
      processingFee: 0
    }
  },

  // Notification Settings
  notifications: {
    email: {
      bookingConfirmation: true,
      eventReminder: true,
      eventUpdates: true
    },
    sms: {
      bookingConfirmation: true,
      eventReminder: false,
      eventUpdates: false
    }
  }
};

// Helper functions for dynamic configuration
export const getSeatCategoryConfig = (categoryName: string) => {
  return APP_CONFIG.seatCategories[categoryName as keyof typeof APP_CONFIG.seatCategories] || APP_CONFIG.seatCategories.Standard;
};

export const getVenueTypeConfig = (venueType: string) => {
  return APP_CONFIG.venueTypes[venueType as keyof typeof APP_CONFIG.venueTypes] || APP_CONFIG.venueTypes.theater;
};

export const getEventCategoryConfig = (categoryName: string) => {
  return APP_CONFIG.eventCategories[categoryName as keyof typeof APP_CONFIG.eventCategories] || APP_CONFIG.eventCategories.music;
};

export const formatCurrency = (amount: number) => {
  return APP_CONFIG.currency.format(amount);
};

export const calculateServiceFee = (amount: number) => {
  return Math.round(amount * (APP_CONFIG.pricing.serviceFeePercentage / 100));
};

export const calculateTax = (amount: number) => {
  return Math.round(amount * (APP_CONFIG.pricing.taxPercentage / 100));
};

export const calculateTotal = (baseAmount: number) => {
  const serviceFee = calculateServiceFee(baseAmount);
  const tax = calculateTax(baseAmount + serviceFee);
  return baseAmount + serviceFee + tax;
};

