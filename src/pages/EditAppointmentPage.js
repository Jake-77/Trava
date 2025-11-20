import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser, getAppointmentById } from '../lib/storage';
import AppointmentForm from '../components/AppointmentForm';

export default function EditAppointmentPage() {
  const navigate = useNavigate();
  const { id: appointmentId } = useParams();

  useEffect(() => {
    const fetchAppointment = async () => {
      const user = getCurrentUser(); // ⚠️ Depends on localStorage; if removed, use apiGetCurrentUser()
      if (!user) {
        navigate('/');
        return;
      }

      try {
        // Fetch appointment using backend first, localStorage fallback if API fails
        const data = await getAppointmentById(appointmentId); // ⚠️ Previously synchronous; must now await
        if (!data || data.userId !== user.id) {
          navigate('/appointments');
          return;
        }
        
      } catch (err) {
        console.error('Failed to fetch appointment:', err);
        navigate('/appointments');
      } 
    };

    fetchAppointment();
  }, [appointmentId, navigate]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <AppointmentForm appointmentId={appointmentId} />
    </div>
  );
}
