/**
 * BookServicePage - Public Service Booking Page
 *
 * Purpose:
 * Public-facing page where customers can book an appointment for a specific service.
 * No authentication required - accessible via shareable booking link.
 *
 * Features:
 * - Displays service information (title, description, price)
 * - Customer information form (name, phone, email)
 * - Date and time selection
 * - Optional notes field
 *
 * Validation:
 * - Prevents booking dates in the past
 * - Required fields: name, phone, date, time
 *
 * User Flow:
 * 1. Customer fills out booking form
 * 2. Appointment created with 'scheduled' status and 'pending' payment
 * 3. Success confirmation screen displayed
 * 4. Customer can safely close the page
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getServiceById, saveAppointment} from '../lib/storage';

export default function BookServicePage() {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      const foundService = await getServiceById(serviceId);
      if (!foundService) {
        console.error(`Service with ID ${serviceId} not found.`);
        return;
      }
      setService(foundService);
    };
    fetchService();
  }, [serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!service) return;

    setSubmitting(true);

    const appointment = {
      userId: service.userId,
      serviceId: service.id,
      customerName,
      customerPhone,
      customerEmail,
      date,
      time,
      status: 'scheduled',
      paymentStatus: 'pending',
      notes,
      createdAt: new Date().toISOString(),
    };

    await saveAppointment(appointment);
    // <-- Currently writes to localStorage, will become API POST call when localStorage removed

    setSubmitting(false);
    setBookingConfirmed(true);
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
        <p className="text-zinc-600 dark:text-zinc-400">Service not found</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  // Show confirmation screen after booking
  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Booking Confirmed
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Your appointment has been successfully booked!
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                It's safe to close this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Book {service.title}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-3">
              {service.description}
            </p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {service.price}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium mb-2">
                Your Name *
              </label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium mb-2">
                Phone Number *
              </label>
              <input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                placeholder="john@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-2">
                  Date *
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={today}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium mb-2">
                  Time *
                </label>
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                placeholder="Any special requests or notes..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {submitting ? 'Booking...' : 'Book Appointment'}
            </button>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
              Payment will be handled at the time of service
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
