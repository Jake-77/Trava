// Type definitions (converted from TypeScript)

export const User = {
  id: '',
  email: '',
  password: '', // In production, this should be hashed
};

export const Service = {
  id: '',
  userId: '',
  title: '',
  description: '',
  price: '',
  createdAt: '',
};

export const Appointment = {
  id: '',
  userId: '',
  serviceId: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  date: '', // ISO date string
  time: '', // Time string
  status: 'scheduled', // 'scheduled' | 'completed' | 'cancelled'
  paymentMethod: undefined, // 'cash' | 'stripe'
  paymentStatus: 'pending', // 'pending' | 'paid'
  notes: '',
  createdAt: '',
};
