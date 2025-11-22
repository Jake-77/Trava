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
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
      <AuthForm />
    </div>
  );
}
