import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setMessage('A password reset email has been sent. Please check your inbox (and spam folder).');
    } catch (err) {
      setError('Failed to reset password: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-gray-700">Email Address</span>
          <input
            type="email"
            required
            className="mt-1 block w-full border px-3 py-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
          />
        </label>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark disabled:opacity-70"
          disabled={loading || !email}
        >
          {loading ? "Sending..." : "Send Reset Email"}
        </button>
        {message && <div className="text-green-600 mt-2">{message}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
}