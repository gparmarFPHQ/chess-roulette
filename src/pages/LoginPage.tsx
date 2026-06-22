// ============================================================================
// MBA Case Study Platform — Login Page
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in real app would call API
    if (username && password) {
      navigate('/home');
    } else {
      setError('Please enter username and password');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-burgundy-700 to-burgundy-900 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <BookOpen className="h-16 w-16 mb-6" />
          <h1 className="text-4xl font-serif font-bold mb-4">
            Case Study Lab
          </h1>
          <p className="text-lg text-burgundy-100">
            Interactive MBA case studies powered by AI. Read, annotate, chat with personas, and draft your recommendations.
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <BookOpen className="h-12 w-12 text-burgundy-700 mb-4" />
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              Case Study Lab
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Welcome back
            </h2>
            <p className="text-slate-600 mb-6">
              Sign in to access your case studies
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-700"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-700"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-burgundy-700 text-white py-2.5 rounded-md hover:bg-burgundy-800 transition-colors font-medium"
              >
                Sign In
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-burgundy-700 hover:underline font-medium"
              >
                Sign up
              </button>
            </p>

            <p className="mt-4 text-center text-xs text-slate-500">
              Demo: Enter any username and password to continue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
