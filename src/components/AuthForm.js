/**
 * AuthForm - Authentication Form
 *
 * Purpose:
 * Handles user authentication with toggle between login and signup modes.
 *
 * Features:
 * - Email and password input fields
 * - Toggle button to switch between login and signup
 * - Input validation (trims whitespace, normalizes email)
 * - Error message display for failed authentication
 * - Automatic redirect to dashboard on successful auth
 *
 * User Flow:
 * - Users can sign up for a new account or login to existing account
 * - Form validates input and shows appropriate error messages
 * - On success, navigates to dashboard
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiSignup, apiLogin } from '../lib/storage';

export default function AuthForm() {
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

      let response;

      if (isSignUp) {
        response = await apiSignup(trimmedEmail, trimmedPassword);
      } else {
        response = await apiLogin(trimmedEmail, trimmedPassword);
      }

      // All endpoints now return { user: { id, email } }
      if (response.user && response.user.id) {
        navigate('/dashboard');
      } else {
        setError('Unexpected response from server.');
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          {isSignUp ? 'Sign Up' : 'Login'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-black">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder-black"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-black">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder-black"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-[#1E3A74] hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
          className="w-full mt-4 text-sm text-[#1E3A74] hover:text-blue-700"
        >
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}
