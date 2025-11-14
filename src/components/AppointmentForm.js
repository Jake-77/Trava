import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveAppointment, getAppointmentById, getServicesByUserId } from '../lib/storage';
import { getCurrentUser } from '../lib/storage';

export default function AppointmentForm({ appointmentId: propAppointmentId }) {
  const navigate = useNavigate();
  const params = useParams();
  const appointmentId = propAppointmentId || params.id;
  const [user, setUser] = useState(getCurrentUser());
  const existingAppointment = appointmentId ? getAppointmentById(appointmentId) : null;
  const [services, setServices] = useState([]);

  const [serviceId, setServiceId] = useState(existingAppointment?.serviceId || '');
  const [customerName, setCustomerName] = useState(existingAppointment?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(existingAppointment?.customerPhone || '');
  const [customerEmail, setCustomerEmail] = useState(existingAppointment?.customerEmail || '');
  const [date, setDate] = useState(existingAppointment?.date || '');
  const [time, setTime] = useState(existingAppointment?.time || '');
  const [status, setStatus] = useState(existingAppointment?.status || 'scheduled');
  const [paymentMethod, setPaymentMethod] = useState(existingAppointment?.paymentMethod || '');
  const [paymentStatus, setPaymentStatus] = useState(existingAppointment?.paymentStatus || 'pending');
  const [notes, setNotes] = useState(existingAppointment?.notes || '');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);
    setServices(getServicesByUserId(currentUser.id));
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/');
      return;
    }

    const appointment = {
      id: existingAppointment?.id || Date.now().toString(),
      userId: user.id,
      serviceId,
      customerName,
      customerPhone,
      customerEmail,
      date,
      time,
      status,
      paymentMethod: paymentMethod || undefined,
      paymentStatus,
      notes,
      createdAt: existingAppointment?.createdAt || new Date().toISOString(),
    };

    saveAppointment(appointment);
    navigate('/appointments');
  };

  if (!user) {
    return null;
  }

  const hasServices = services.length > 0;

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">
          {existingAppointment ? 'Edit Appointment' : 'New Appointment'}
        </h1>
        {!hasServices && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              You need to add at least one service first. <button type="button" onClick={() => navigate('/services/new')} className="underline font-medium">Add Service</button>
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="serviceId" className="block text-sm font-medium mb-2">
              Service
            </label>
            <select
              id="serviceId"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title} - {service.price}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium mb-2">
              Customer Name
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
              Phone
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
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-2">
                Time
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
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label htmlFor="paymentStatus" className="block text-sm font-medium mb-2">
              Payment Status
            </label>
            <select
              id="paymentStatus"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              required
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          {paymentStatus === 'paid' && (
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium mb-2">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
              >
                <option value="">Select method</option>
                <option value="cash">Cash</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>
          )}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {existingAppointment ? 'Update' : 'Create'} Appointment
            </button>
            <button
              type="button"
              onClick={() => navigate('/appointments')}
              className="flex-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
