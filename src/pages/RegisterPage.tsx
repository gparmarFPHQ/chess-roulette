// ============================================================================
// MBA Case Study Platform — Register Page
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration
    if (username && email && password) {
      navigate('/login');
    } else {
      setError('Please fill in all fields');
    }
  };

  const features = [
    'Read cases with beautiful typography',
    'Highlight and annotate text',
    'Chat with AI personas of case characters',
    'View interactive charts and exhibits',
    'Draft proposals with autosave',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left: Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <BookOpen className="h-16 w-16 mb-6" />
          <h1 className="text-4xl font-serif font-bold mb-4">
            Start Learning
          </h1>
          <p className="text-lg text-slate-300 mb-8">
            Create your account to access interactive case studies
          </p>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <BookOpen className="h-12 w-12 text-burgundy-700 mb-4" />
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              Create Account
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Create your account
            </h2>
            <p className="text-slate-600 mb-6">
              Get started with interactive case studies
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-700"
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-700"
                  placeholder="your@email.com"
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
                  placeholder="Create a password"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-burgundy-700 text-white py-2.5 rounded-md hover:bg-burgundy-800 transition-colors font-medium"
              >
                Create Account
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-burgundy-700 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>

            <p className="mt-4 text-center text-xs text-slate-500">
              Demo: Enter any details to create an account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
