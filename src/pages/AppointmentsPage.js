import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, getAppointmentsByUserId, deleteAppointment, getServicesByUserId } from '../lib/storage';

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser(); 
      // <-- Will change to await apiGetCurrentUser() when localStorage is removed

      if (!currentUser) {
        navigate('/');
        return;
      }

      const userAppointments = await getAppointmentsByUserId(currentUser.id); 
      // <-- Currently reads localStorage fallback. Will be pure API call later
      setAppointments(userAppointments);

      const userServices = await getServicesByUserId(currentUser.id); 
      // <-- Currently reads localStorage fallback. Will be pure API call later
      setServices(userServices);
    };

    loadData();
  }, [navigate]);

  const handleDelete = async (appointmentId) => { // <-- add async
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
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
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
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
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              No appointments yet. Create your first appointment!
            </p>
            <button
              onClick={() => navigate('/appointments/new')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              New Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAppointments.map((appointment) => {
              const service = services.find(s => s.id === appointment.serviceId);
              const statusColors = {
                scheduled: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
                completed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
                cancelled: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
              };
              return (
                <div key={appointment.id} className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {service?.title} - {appointment.customerName}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
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
                        <span className="text-zinc-600 dark:text-zinc-400 ml-2">
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
