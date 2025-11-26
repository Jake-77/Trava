import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiGetCurrentUser, getAppointmentById, deleteAppointment, getServiceById, saveAppointment } from '../lib/storage';

export default function AppointmentDetailPage() {
  const navigate = useNavigate();
  const { id: appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [service, setService] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await apiGetCurrentUser(); 
      if (!currentUser) {
        navigate('/');
        return;
      }
      const foundAppointment = await getAppointmentById(appointmentId); 
     
      if (!foundAppointment || foundAppointment.userId !== currentUser.id) {
        navigate('/appointments');
        return;
      }
      setAppointment(foundAppointment);
      

      const fetchedService = await getServiceById(foundAppointment.serviceId); 
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

  const handlePaypalPayment = async () => { 
    await handlePayment('paypal');
  };

  if (!appointment) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D9E1F2] p-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/appointments" className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium inline-block">
          ← Back to Appointments
        </Link>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">
              {service?.title}
            </h1>
            <p className="text-sm text-zinc-500">
              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h2 className="text-sm font-semibold text-zinc-600 mb-1">Customer</h2>
              <p className="text-zinc-900 font-medium">{appointment.customerName}</p>
              {appointment.customerPhone && (
                <p className="text-sm text-zinc-600">📞 {appointment.customerPhone}</p>
              )}
              {appointment.customerEmail && (
                <p className="text-sm text-zinc-600">✉️ {appointment.customerEmail}</p>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-600 mb-1">Status</h2>
              <p className="text-zinc-900 capitalize">{appointment.status}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-600 mb-1">Payment Status</h2>
              <p className={`font-medium ${appointment.paymentStatus === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {appointment.paymentStatus === 'paid' ? '✓ Paid' : 'Pending Payment'}
              </p>
              {appointment.paymentMethod && (
                <p className="text-sm text-zinc-600">Method: {appointment.paymentMethod}</p>
              )}
            </div>
            {service && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-600 mb-1">Price</h2>
                <p className="text-2xl font-bold text-[#1E3A74] mb-3">{service.price}</p>
                {appointment.paymentStatus === 'pending' && (
                  <div className="mt-3 p-3 bg-[#cbd9f0] rounded-lg">
                    <p className="text-xs text-blue-800 mb-2 font-medium">
                      Payment Link
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={typeof window !== 'undefined' ? `${window.location.origin}/pay/${appointment.id}` : ''}
                        className="flex-1 text-xs px-2 py-1 bg-white border border-zinc-300 rounded text-zinc-900"
                      />
                      <button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            navigator.clipboard.writeText(`${window.location.origin}/pay/${appointment.id}`);
                            alert('Payment link copied to clipboard!');
                          }
                        }}
                        className="text-xs bg-[#1E3A74] hover:bg-[#162B57] text-white px-3 py-1 rounded transition-colors"
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
            <div className="border-t border-zinc-200 pt-6 mb-6">
              <h3 className="text-md font-semibold text-zinc-900 mb-3">
                Payment Options
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handlePayment('cash')}
                  className="w-full bg-[#4F7CEB] hover:bg-[#3E67CB] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>💵</span>
                  Mark as Paid - Cash
                </button>
                <button
                  onClick={handlePaypalPayment}
                  className="w-full bg-[#1E3A74] hover:bg-[#162B57] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>💳</span>
                  Customer Paid with Paypal
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-zinc-200">
            <button
              onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
              className="flex-1 bg-[#1E3A74] hover:bg-[#162B57] text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Edit Appointment
            </button>
            <button
              onClick={async () => { 
                if (window.confirm('Are you sure you want to delete this appointment?')) {
                  await deleteAppointment(appointment.id); 
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
