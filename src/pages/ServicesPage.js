/**
 * ServicesPage - Services List View
 *
 * Purpose:
 * Displays a list of all services created by the logged-in user.
 *
 * Features:
 * - Service cards showing title, description (truncated), and price
 * - Quick actions: view details or delete
 * - Empty state with call-to-action when no services exist
 *
 * Navigation:
 * - Back to dashboard link
 * - Add new service button
 *
 * Actions:
 * - View service details (navigates to detail page)
 * - Delete service (with confirmation dialog)
 *
 * Data:
 * - Fetches user's services on mount
 * - Updates list after deletion
 * - Redirects to home if not authenticated
 */
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiGetCurrentUser, getServices, deleteService } from '../lib/storage';

export default function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await apiGetCurrentUser();
      if (!currentUser) {
        navigate('/');
        return;
      }
      const userServices = await getServices();
      setServices(userServices);
    };
    loadData();
  }, [navigate]);

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      await deleteService(serviceId);
      setServices(services.filter(service => service.id !== serviceId));
    }
  };

  return (
    <div className="min-h-screen bg-[#D9E1F2] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-black hover:text-zinc-700 text-sm">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Services
            </h1>
          </div>
          <button
            onClick={() => navigate('/services/new')}
            className="bg-[#1E3A74] hover:bg-[#162B57] text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            + Add Service
          </button>
        </div>
        {services.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-zinc-600 mb-4">
              No services yet. Add your first service!
            </p>
            <button
              onClick={() => navigate('/services/new')}
              className="bg-[#1E3A74] hover:bg-[#162B57] text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Add Service
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-md p-4 border border-zinc-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {service.title}
                  </h3>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-zinc-600 text-sm mb-3 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#1E3A74]">
                    {service.price}
                  </span>
                  <button
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
