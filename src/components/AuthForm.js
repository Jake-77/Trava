import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser, getUserByEmail, setCurrentUser, apiSignup, apiLogin } from '../lib/storage';

export default function AuthForm({ apiMode = false }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();
      let user;

      if (apiMode) {
        // Use backend API
        if (isSignUp) {
          user = await apiSignup(trimmedEmail, trimmedPassword);
        } else {
          user = await apiLogin(trimmedEmail, trimmedPassword);
        }
      } else {
        // LocalStorage mode
        if (isSignUp) {
          const existingUser = await getUserByEmail(trimmedEmail);
          if (existingUser) {
            setError('Email already exists');
            return;
          }
          const newUser = {
            email: trimmedEmail,
            password: trimmedPassword,
          };
          user = await saveUser(newUser); // make sure saveUser returns the saved user
          setCurrentUser(user);
        } else {
          user = await getUserByEmail(trimmedEmail);
          if (!user || user.password !== trimmedPassword) {
            setError('Invalid email or password');
            return;
          }
          setCurrentUser(user);
        }
      }

      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? 'Sign Up' : 'Login'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
          className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700"
        >
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}