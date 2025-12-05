import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiGetCurrentUser, getAppointments, deleteAppointment, getServices } from '../lib/storage';

export default function AppointmentsPage() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showCalendar, setShowCalendar] = useState(false);

  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(y => y - 1);
    } else setCalMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(y => y + 1);
    } else setCalMonth(m => m + 1);
  };

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstWeekday = new Date(calYear, calMonth, 1).getDay();
  const totalCells = firstWeekday + daysInMonth;

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
      setAppointments((prev) => prev.filter(a => a.id !== appointmentId));
    }
  };

  const filteredAppointments =
    filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`).getTime();
    const dateB = new Date(`${b.date}T${b.time}`).getTime();
    return dateA - dateB;
  });

  return (
    <div className="min-h-screen bg-[#D9E1F2] p-4">
      <div className="max-w-2xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Appointments
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCalendar(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
            >
              Calendar View
            </button>

            <button
              onClick={() => navigate('/appointments/new')}
              className="bg-[#4F7CEB] hover:bg-[#3E67CB] text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              + New Appointment
            </button>
          </div>
        </div>

        {/* FILTER BUTTONS */}
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

        {/* EMPTY STATE */}
        {sortedAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
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
                scheduled: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
                completed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
                cancelled: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
              };

              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow-md p-4 border border-zinc-200"
                >
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
                      <span
                        className={`font-medium ${
                          appointment.paymentStatus === 'paid'
                            ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                        }`}
                      >
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

      {/* ─────────────────────────────────────────── */}
      {/* CALENDAR MODAL */}
      {/* ─────────────────────────────────────────── */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-xl p-4 relative scale-90">

            <h2 className="text-xl font-semibold text-center mb-2 text-zinc-900 dark:text-zinc-100">
              Appointment Calendar
            </h2>

            {/* NAVIGATION */}
            <div className="flex justify-between items-center mb-3">
              <button
                onClick={prevMonth}
                className="px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-sm"
              >
                ← Prev
              </button>

              <h3 className="text-lg font-medium text-black">
                {new Date(calYear, calMonth).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>

              <button
                onClick={nextMonth}
                className="px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-sm"
              >
                Next →
              </button>
            </div>

            {/* DAY LABELS */}
            <div className="grid grid-cols-7 text-center mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="font-semibold text-xs text-zinc-700 dark:text-zinc-300">
                  {d}
                </div>
              ))}
            </div>

            {/* CALENDAR GRID */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: totalCells }).map((_, index) => {
                const dayNum = index - firstWeekday + 1;

                if (dayNum < 1 || dayNum > daysInMonth) {
                  return <div key={index} className="h-14"></div>;
                }

                const dayAppointments = appointments.filter(a => {
                  const d = new Date(a.date);
                  return (
                    d.getDate() === dayNum &&
                    d.getMonth() === calMonth &&
                    d.getFullYear() === calYear
                  );
                });

                return (
                  <div
                    key={index}
                    className="border border-zinc-300 dark:border-zinc-800 p-1 h-14 rounded overflow-y-auto text-[10px]"
                  >
                    <div className="font-bold text-zinc-700 dark:text-zinc-200 text-xs">
                      {dayNum}
                    </div>

                    {dayAppointments.length === 0 ? (
                      <div className="text-zinc-400 dark:text-zinc-600 mt-1">—</div>
                    ) : (
                      dayAppointments.map(app => {
                        const service = services.find(s => s.id === app.serviceId);
                        return (
                          <div
                            key={app.id}
                            className="mt-1 bg-[#3b5ba9] text-white p.0.5"
                          >
                            {service?.title}
                            <br />
                            {app.time}
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowCalendar(false)}
              className="mt-4 bg-[#1e3a74] hover: bg-[#162d5c] text-white py-2 px-4 rounded text-sm w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
