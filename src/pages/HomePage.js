/**
 * HomePage - Landing/Authentication Page
 *
 * Purpose:
 * Entry point of the application. Handles initial authentication check
 * and displays login/signup form for unauthenticated users.
 *
 * Behavior:
 * - Checks authentication status on mount
 * - Redirects to dashboard if user is already logged in
 * - Shows AuthForm component for login/signup if not authenticated
 *
 * User Flow:
 * - New users: see signup form
 * - Returning users: automatically redirected to dashboard if logged in
 * - Logged out users: see login form
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetCurrentUser } from '../lib/storage';
import AuthForm from '../components/AuthForm';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await apiGetCurrentUser();
      if (user && user.user) {
        navigate('/dashboard');
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#85ABD2] flex items-center justify-center p-4">
      <AuthForm />
    </div>
  );
}
