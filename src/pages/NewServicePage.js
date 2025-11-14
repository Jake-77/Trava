import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/storage';
import ServiceForm from '../components/ServiceForm';

export default function NewServicePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <ServiceForm />
    </div>
  );
}
