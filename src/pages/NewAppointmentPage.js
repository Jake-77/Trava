/**
 * NewAppointmentPage - Create Appointment Wrapper
 *
 * Purpose:
 * Page wrapper that handles authentication before rendering the
 * appointment form in create mode.
 *
 * Flow:
 * 1. Verifies user is authenticated
 * 2. Redirects to home if not logged in
 * 3. Renders AppointmentForm without appointmentId (create mode)
 *
 * Security:
 * - Requires authentication to create appointments
 * - Redirects unauthenticated users to home page
 */
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
    <div className="min-h-screen bg-[#D9E1F2] py-8">
      <AppointmentForm />
    </div>
  );
}
