import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGetCurrentUser, getServiceById } from '../lib/storage';
import ServiceForm from '../components/ServiceForm';

export default function EditServicePage() {
  const navigate = useNavigate();
  const { id: serviceId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await apiGetCurrentUser();
      if (!user  || !user.user) {
        navigate('/');
        return;
      }

      try {
        // Await the async service fetch
        const service = await getServiceById(serviceId);
        
        // Check existence and ownership
        if (!service) {
          navigate('/services');
          return;
        }
        
        // If valid, stop loading and show form
        setLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate('/services');
      }
    };

    checkAuth();
  }, [serviceId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <ServiceForm serviceId={serviceId} />
    </div>
  );
}