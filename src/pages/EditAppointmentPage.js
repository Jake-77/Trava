import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser, getAppointmentById } from '../lib/storage';
import AppointmentForm from '../components/AppointmentForm';

export default function EditAppointmentPage() {
  const navigate = useNavigate();
  const { id: appointmentId } = useParams();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/');
      return;
    }
    const appointment = getAppointmentById(appointmentId);
    if (!appointment || appointment.userId !== user.id) {
      navigate('/appointments');
    }
  }, [appointmentId, navigate]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <AppointmentForm appointmentId={appointmentId} />
    </div>
  );
}
