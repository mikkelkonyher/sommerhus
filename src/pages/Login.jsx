import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Trees } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-canvas-subtle flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Trees className="mx-auto h-12 w-12 text-fg-default" />
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-fg-default">
          Log ind på Skogkrogen
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-canvas-default py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border-default">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-fg-default">
                Email adresse
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-border-default px-3 py-2 placeholder-fg-subtle shadow-sm focus:border-accent-fg focus:outline-none focus:ring-1 focus:ring-accent-fg sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-fg-default">
                Adgangskode
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-border-default px-3 py-2 placeholder-fg-subtle shadow-sm focus:border-accent-fg focus:outline-none focus:ring-1 focus:ring-accent-fg sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-danger-fg/10 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-danger-fg">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-btn-primary-bg py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-btn-primary-hover-bg focus:outline-none focus:ring-2 focus:ring-accent-fg focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logger ind...' : 'Log ind'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
