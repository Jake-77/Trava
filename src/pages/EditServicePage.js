import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser, getServiceById } from '../lib/storage';
import ServiceForm from '../components/ServiceForm';

export default function EditServicePage() {
  const navigate = useNavigate();
  const { id: serviceId } = useParams();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/');
      return;
    }
    const service = getServiceById(serviceId);
    if (!service || service.userId !== user.id) {
      navigate('/services');
    }
  }, [serviceId, navigate]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <ServiceForm serviceId={serviceId} />
    </div>
  );
}
