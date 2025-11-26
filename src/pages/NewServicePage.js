import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetCurrentUser } from '../lib/storage';
import ServiceForm from '../components/ServiceForm';

export default function NewServicePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const newService = async () => {
      const user = await apiGetCurrentUser();
      if (!user || !user.user) {
        navigate('/');
      }
    };
    newService();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#D9E1F2] py-8">
      <ServiceForm />
    </div>
  );
}
