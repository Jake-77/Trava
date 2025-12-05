/**
 * NewServicePage - Create Service Wrapper
 *
 * Purpose:
 * Page wrapper that handles authentication before rendering the
 * service form in create mode.
 *
 * Flow:
 * 1. Verifies user is authenticated on mount
 * 2. Redirects to home if not logged in
 * 3. Renders ServiceForm without serviceId (create mode)
 *
 * Security:
 * - Requires authentication to create services
 * - Redirects unauthenticated users to home page
 */
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
