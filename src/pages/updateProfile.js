import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetCurrentUser, apiUpdateProfile } from '../lib/storage';

export default function Settings() {
  const navigate = useNavigate();
  const [paypalHandle, setPaypalHandle] = useState('');

  // Password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load current settings
    apiGetCurrentUser().then((data) => {
      if (data.user && data.user.paypal_handle) {
        setPaypalHandle(data.user.paypal_handle);
      }
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('');

    // --- VALIDATION START ---

    // 1. Check if passwords match (only if the user typed a new password)
    if (newPassword && newPassword !== confirmPassword) {
      setStatus('Error: Passwords do not match.');
      return;
    }

    setLoading(true);
    const payload = {};

    // Always send the handle
    payload.paypal_handle = paypalHandle;

    // Only add password to payload if validation passed and it's not empty
    if (newPassword) {
      payload.password = newPassword;
    }

    try {
      await apiUpdateProfile(payload);
      setStatus('Settings saved successfully!');

      // Clear password fields on success
      setNewPassword('');
      setConfirmPassword('');

      // Redirect to dashboard after a brief delay to show success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setStatus('Error saving settings.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <form onSubmit={handleSave} className="space-y-6">

          {/* PayPal Section */}
          <div>
            <label className="block text-sm font-medium mb-2">
              PayPal.me Handle
            </label>
            <div className="flex items-center">
              <span className="bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-300 dark:border-zinc-700 rounded-l-lg px-3 py-2 text-zinc-500">
                paypal.me/
              </span>
              <input
                type="text"
                value={paypalHandle}
                onChange={(e) => setPaypalHandle(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                placeholder="username"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Leave blank to remove payment links.
            </p>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-700" />

          {/* Password Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                placeholder="Enter new password"
              />
            </div>

            {/* Only show Confirm Password if user has started typing a new password */}
            {newPassword && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-zinc-800 ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-500 focus:ring-red-500' // Red border if mismatch
                      : 'border-zinc-300 dark:border-zinc-700 focus:ring-blue-500'
                  }`}
                  placeholder="Re-type new password"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                   <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            )}
             <p className="text-xs text-zinc-500">
              Leave blank if you don't want to change it.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-medium py-2 px-4 rounded-lg transition-colors ${
              loading
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>

          {status && (
            <p className={`text-center text-sm ${
              status.includes('Error') ? 'text-red-500' : 'text-green-500'
            }`}>
              {status}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
