import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, setCurrentUser, getServicesByUserId, getAppointmentsByUserId } from '../lib/storage';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser()); 
  // BREAKS without localStorage: getCurrentUser() reads from localStorage.
  // Replace with a backend call like: const currentUser = await fetch('/api/current_user').then(res => res.json());

  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = getCurrentUser(); 
      // BREAKS without localStorage: same as above.
      if (!currentUser) {
        navigate('/');
        return;
      }

      setUser(currentUser);

      try {
        const userServices = await getServicesByUserId(currentUser.id); 
        // OK with backend, works as-is
        const userAppointments = await getAppointmentsByUserId(currentUser.id); 
        // OK with backend, works as-is
        
        setServices(userServices);
        setAppointments(userAppointments);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const pendingPayments = appointments.filter(a => a.paymentStatus === 'pending').length;
  const totalRevenue = appointments
    .filter(a => a.paymentStatus === 'paid')
    .reduce((sum, a) => {
      const service = services.find(s => s.id === a.serviceId);
      if (service) {
        const price = parseFloat(service.price.replace(/[^0-9.]/g, '')) || 0;
        return sum + price;
      }
      return sum;
    }, 0);

  const handleLogout = () => {
    setCurrentUser(null); 
    // BREAKS without localStorage: removes user from localStorage. 
    // Replace with backend logout API call: await fetch('/api/logout', { method: 'POST' });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Logout
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Services</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{services.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Pending Payments</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingPayments}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/services/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
            >
              + Add Service
            </button>
            <button
              onClick={() => navigate('/appointments/new')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
            >
              + New Appointment
            </button>
            <button
              onClick={() => navigate('/appointments')}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm col-span-2"
            >
              View Appointments
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Navigation</h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/services')}
              className="w-full text-left bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              📋 Services
            </button>
            <button
              onClick={() => navigate('/appointments')}
              className="w-full text-left bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              📅 Appointments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
