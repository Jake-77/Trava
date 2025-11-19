import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCurrentUser, getServiceById, deleteService } from '../lib/storage';

export default function ServiceDetailPage() {
  const navigate = useNavigate();
  const { id: serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate('/');
        return;
      }

      try {
        // Now awaited because getServiceById performs a fetch
        const foundService = await getServiceById(serviceId);

        if (!foundService || foundService.userId !== currentUser.id) {
          navigate('/services');
          return;
        }
        setService(foundService);
      } catch (error) {
        console.error("Failed to load service:", error);
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/services" className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium inline-block">
          ← Back to Services
        </Link>
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {service.title}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Created: {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Description
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
              {service.description}
            </p>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Price
            </h2>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
              {service.price}
            </p>
          </div>
          {/* Booking Link */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mb-6">
            <h3 className="text-md font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Booking Link
            </h3>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 mb-3">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Share this link with customers:</p>
              <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100 break-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/book/${service.id}` : ''}
              </p>
            </div>
            <button
              onClick={async () => {
                if (typeof window !== 'undefined' && navigator.share) {
                  try {
                    await navigator.share({
                      title: service.title,
                      text: `Book ${service.title} - ${service.price}`,
                      url: `${window.location.origin}/book/${service.id}`,
                    });
                  } catch (err) {
                    // User cancelled or share failed, fallback to copy
                    if (err instanceof Error && err.name !== 'AbortError') {
                      navigator.clipboard.writeText(`${window.location.origin}/book/${service.id}`);
                      alert('Booking link copied to clipboard!');
                    }
                  }
                } else {
                  // Fallback for browsers without share API
                  navigator.clipboard.writeText(`${window.location.origin}/book/${service.id}`);
                  alert('Booking link copied to clipboard!');
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              📤 Share Booking Link
            </button>
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => navigate(`/services/${service.id}/edit`)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Edit Service
            </button>
            <button
              // Updated to be async to wait for the backend response
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this service?')) {
                  await deleteService(service.id);
                  navigate('/services');
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Delete Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}