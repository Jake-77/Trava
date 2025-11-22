import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetCurrentUser } from '../lib/storage';
import AppointmentForm from '../components/AppointmentForm';

export default function NewAppointmentPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const newApp = async () => {
      const user = await apiGetCurrentUser();
      if (!user.user) {
        navigate('/');
      }
    };
    newApp();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <AppointmentForm />
    </div>
  );
}
