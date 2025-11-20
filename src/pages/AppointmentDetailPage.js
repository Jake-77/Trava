import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCurrentUser, getAppointmentById, deleteAppointment, getServiceById, saveAppointment } from '../lib/storage';

export default function AppointmentDetailPage() {
  const navigate = useNavigate();
  const { id: appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [service, setService] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser(); // <-- Will change to await apiGetCurrentUser() when localStorage is removed
      if (!currentUser) {
        navigate('/');
        return;
      }

      const foundAppointment = await getAppointmentById(appointmentId); 
      // <-- Currently reads localStorage fallback. When localStorage is removed, this will be a pure API call
      if (!foundAppointment || foundAppointment.userId !== currentUser.id) {
        navigate('/appointments');
        return;
      }
      setAppointment(foundAppointment);

      const fetchedService = await getServiceById(foundAppointment.serviceId); 
      // <-- Currently localStorage fallback. Will be pure API call without fallback
      setService(fetchedService);
    };

    loadData();
  }, [appointmentId, navigate]);

  const handlePayment = async (method) => { // <-- add async to await save
    if (!appointment) return;
    const updated = {
      ...appointment,
      paymentStatus: 'paid',
      paymentMethod: method,
    };
    await saveAppointment(updated); // <-- currently writes localStorage fallback. Will be pure API call
    setAppointment(updated);
  };

  const handleStripePayment = async () => {
    await handlePayment('stripe');
  };

  if (!appointment) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/appointments" className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium inline-block">
          ← Back to Appointments
        </Link>
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {service?.title}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Customer</h2>
              <p className="text-zinc-900 dark:text-zinc-100 font-medium">{appointment.customerName}</p>
              {appointment.customerPhone && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">📞 {appointment.customerPhone}</p>
              )}
              {appointment.customerEmail && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">✉️ {appointment.customerEmail}</p>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Status</h2>
              <p className="text-zinc-900 dark:text-zinc-100 capitalize">{appointment.status}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Payment Status</h2>
              <p className={`font-medium ${appointment.paymentStatus === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {appointment.paymentStatus === 'paid' ? '✓ Paid' : 'Pending Payment'}
              </p>
              {appointment.paymentMethod && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Method: {appointment.paymentMethod}</p>
              )}
            </div>
            {service && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Price</h2>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">{service.price}</p>
                {appointment.paymentStatus === 'pending' && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-200 mb-2 font-medium">
                      Payment Link
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={typeof window !== 'undefined' ? `${window.location.origin}/pay/${appointment.id}` : ''}
                        className="flex-1 text-xs px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
                      />
                      <button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            navigator.clipboard.writeText(`${window.location.origin}/pay/${appointment.id}`);
                            alert('Payment link copied to clipboard!');
                          }
                        }}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {appointment.notes && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Notes</h2>
                <p className="text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Payment Options */}
          {appointment.paymentStatus === 'pending' && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mb-6">
              <h3 className="text-md font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                Payment Options
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handlePayment('cash')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>💵</span>
                  Mark as Paid - Cash
                </button>
                <button
                  onClick={handleStripePayment}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>💳</span>
                  Customer Paid with Stripe
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Edit Appointment
            </button>
            <button
              onClick={async () => { // <-- add async to await delete
                if (window.confirm('Are you sure you want to delete this appointment?')) {
                  await deleteAppointment(appointment.id); // <-- currently localStorage fallback, will be pure API
                  navigate('/appointments');
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Delete Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
