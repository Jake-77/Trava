/**
 * EditAppointmentPage - Edit Appointment Wrapper
 *
 * Purpose:
 * Page wrapper that handles authentication and authorization before
 * rendering the appointment form in edit mode.
 *
 * Flow:
 * 1. Verifies user is authenticated
 * 2. Fetches appointment to confirm it exists
 * 3. Backend ensures appointment belongs to user
 * 4. Renders AppointmentForm with appointmentId prop
 *
 * Security:
 * - Redirects to home if not authenticated
 * - Redirects to appointments list if appointment not found
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGetCurrentUser, getAppointmentById } from '../lib/storage';
import AppointmentForm from '../components/AppointmentForm';

export default function EditAppointmentPage() {
  const navigate = useNavigate();
  const { id: appointmentId } = useParams();


  useEffect(() => {
    const fetchAppointment = async () => {
      // --- FIX: backend-based auth ---
      const me = await apiGetCurrentUser();
      if (!me || !me.user) {
        navigate('/');
        return;
      }

      try {
        // --- fetch from backend ---
        const appointment = await getAppointmentById(appointmentId);

        // If backend says "not found", it throws → handled below
        if (!appointment) {
          navigate('/appointments');
          return;
        }

        // No need to check appointment.userId because:
        // backend only returns user's own appointments

      } catch (err) {
        console.error("Failed to load appointment:", err);
        navigate('/appointments');
      }
    };

    fetchAppointment();
  }, [appointmentId, navigate]);

  return (
    <div className="min-h-screen bg-[#D9E1F2] py-8">
      <AppointmentForm appointmentId={appointmentId} />
    </div>
  );
}
