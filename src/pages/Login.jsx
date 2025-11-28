import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Trees } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state so message doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-default flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Trees className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-fg-default" />
          <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold text-fg-default">
            Skovkrogen
          </h2>
          <p className="mt-2 text-center text-sm text-fg-muted">
            Log ind for at booke sommerhuset
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-fg-default mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-border-default placeholder-fg-muted text-fg-default rounded-md focus:outline-none focus:ring-accent-fg focus:border-accent-fg focus:z-10 sm:text-sm"
                placeholder="din@email.dk"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-fg-default mb-1">
                Adgangskode
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-border-default placeholder-fg-muted text-fg-default rounded-md focus:outline-none focus:ring-accent-fg focus:border-accent-fg focus:z-10 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-danger-fg/10 border border-danger-fg/20 p-3 sm:p-4">
              <p className="text-sm text-danger-fg">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-success-fg/10 border border-success-fg/20 p-3 sm:p-4">
              <p className="text-sm text-success-fg">{successMessage}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-btn-primary-bg hover:bg-btn-primary-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-fg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logger ind...' : 'Log ind'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/reset-password"
            className="text-sm text-fg-muted hover:text-fg-default"
          >
            Glemt adgangskode?
          </Link>
        </div>
      </div>
    </div>
  );
}
