import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetCurrentUser, apiLogout, getServices, getAppointments } from '../lib/storage';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); 
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      // Fetch user from backend session
      const res = await apiGetCurrentUser();
      const currentUser = res.user;

      if (!currentUser) {
        navigate("/");
        return;
      }

      setUser(currentUser);

      try {
        // Already filtered by logged-in user on backend
        const userServices = await getServices();
        const userAppointments = await getAppointments();

        setServices(userServices);
        setAppointments(userAppointments);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }

      setLoading(false);
    };

    loadDashboard();
  }, [navigate]);

  const pendingPayments = appointments.filter(
    (a) => a.paymentStatus === "pending"
  ).length;

  const totalRevenue = appointments
    .filter((a) => a.paymentStatus === "paid")
    .reduce((sum, a) => {
      const service = services.find((s) => s.id == a.serviceId);
      return service ? sum + Number(service.price) : sum;
    }, 0);

  const handleLogout = async () => {
    await apiLogout();
    navigate("/");
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
    <div className="min-h-screen bg-[#D9E1F2] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className='flex items-center'>
            <img src="/trava.png" alt="Logo" className="object-contain w-[120px] h-[120px]" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-[#1E3A74] hover:bg-[#6D8EDB] text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Logout
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-zinc-600 mb-1">Services</p>
            <p className="text-2xl font-bold text-zinc-900">{services.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-zinc-600 mb-1">Pending Payments</p>
            <p className="text-2xl font-bold text-orange-600">{pendingPayments}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-zinc-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/services/new')}
              className="bg-[#3B5BA9] hover:bg-[#324d90] text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
            >
              + Add Service
            </button>
            <button
              onClick={() => navigate('/appointments/new')}
              className="bg-[#4F7CEB] hover:bg-[#3e67cb] text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
            >
              + New Appointment
            </button>
            <button
              onClick={() => navigate('/appointments')}
              className="bg-[#AFC7F5] hover:bg-[#93b4f0] text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm col-span-2"
            >
              View Appointments
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Navigation</h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/services')}
              className="w-full text-left bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              📋 Services
            </button>
            <button
              onClick={() => navigate('/appointments')}
              className="w-full text-left bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              📅 Appointments
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-full text-left bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
