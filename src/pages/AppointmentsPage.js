/**
 * AppointmentsPage - Appointments List View
 *
 * Purpose:
 * Displays a list of all user's appointments with filtering and sorting capabilities.
 *
 * Features:
 * - Filter appointments by status (all, scheduled, completed, cancelled)
 * - Chronological sorting (earliest first)
 * - Status badges with color coding
 * - Payment status indicators (paid/pending)
 * - Service title and customer name display
 *
 * Display:
 * - Each appointment shows: service, customer, date/time, status, payment status
 * - Quick actions: view details or delete
 * - Empty state with call-to-action when no appointments exist
 *
 * Actions:
 * - Create new appointment button
 * - Filter by status buttons
 * - View appointment details
 * - Delete appointment (with confirmation)
 */
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiGetCurrentUser, getAppointments, deleteAppointment, getServices } from '../lib/storage';


export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('all');


  useEffect(() => {
    const loadData = async () => {
      const currentUser = await apiGetCurrentUser();

      if (!currentUser) {
        navigate('/');
        return;
      }
      const userAppointments = await getAppointments();
      setAppointments(userAppointments);

      const userServices = await getServices();
      setServices(userServices);
    };


    loadData();
  }, [navigate]);

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      await deleteAppointment(appointmentId);
      // <-- currently localStorage fallback. Will be pure API call later
      setAppointments(appointments.filter(appointment => appointment.id !== appointmentId));
    }
  };
  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);


  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`).getTime();
    const dateB = new Date(`${b.date}T${b.time}`).getTime();
    return dateA - dateB;
  });


  return (
    <div className="min-h-screen bg-[#D9E1F2] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Appointments
            </h1>
          </div>
          <button
            onClick={() => navigate('/appointments/new')}
            className="bg-[#4F7CEB] hover:bg-[#3E67CB] text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            + New Appointment
          </button>
        </div>


        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-[#4F7CEB] text-white'
                  : 'bg-white text-zinc-700 hover:bg-[#3E67CB]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>


        {sortedAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-zinc-600 mb-4">
              No appointments yet. Create your first appointment!
            </p>
            <button
              onClick={() => navigate('/appointments/new')}
              className="bg-[#4F7CEB] hover:bg-[#3E67CB] text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              New Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAppointments.map((appointment) => {
              const service = services.find(s => s.id === appointment.serviceId);
              const statusColors = {
                scheduled: 'bg-blue-100 text-blue-800 ',
                completed: 'bg-green-100  text-green-800 ',
                cancelled: 'bg-red-100  text-red-800 ',
              };
              return (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-4 border border-zinc-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900">
                        {service?.title} - {appointment.customerName}
                      </h3>
                      <p className="text-sm text-zinc-600">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[appointment.status]}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-sm">
                      <span className={`font-medium ${appointment.paymentStatus === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {appointment.paymentStatus === 'paid' ? '✓ Paid' : 'Pending Payment'}
                      </span>
                      {appointment.paymentMethod && (
                        <span className="text-zinc-600 ml-2">
                          ({appointment.paymentMethod})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/appointments/${appointment.id}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View →
                      </button>
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
