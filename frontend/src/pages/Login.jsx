import React, { useState } from 'react';
import { useAuth } from '../components/layout/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-xl border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">PAIMANA Intelligence</h2>
          <p className="text-slate-500 mt-2">Sign in to access infrastructure insights</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 text-center space-y-1">
          <p>Demo Accounts (Username / Password):</p>
          <p>Admin: <span className="font-mono bg-slate-100 px-1 rounded">admin / admin</span></p>
          <p>Engineer: <span className="font-mono bg-slate-100 px-1 rounded">engineer / engineer</span></p>
          <p>Viewer: <span className="font-mono bg-slate-100 px-1 rounded">viewer / viewer</span></p>
        </div>
      </div>
    </div>
  );
}
