import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Trees, ArrowLeft, Mail, Lock } from "lucide-react";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState("request"); // 'request' or 'reset'

  // Check if we have a token in the URL (from email link)
  // Supabase uses hash fragments for auth tokens
  useEffect(() => {
    // Check URL hash for recovery token (Supabase uses hash fragments)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    // Also check query params for compatibility
    const token = searchParams.get("token");
    const queryType = searchParams.get("type");

    if (
      (accessToken && type === "recovery") ||
      (token && queryType === "recovery")
    ) {
      // Set up listener for auth state changes
      // Supabase will automatically process the hash fragment
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (
          event === "PASSWORD_RECOVERY" ||
          (event === "SIGNED_IN" && session)
        ) {
          setStep("reset");
          // Clear the hash from URL for cleaner UX (only after session is confirmed)
          if (accessToken && session) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }
      });

      // Also check current session immediately in case it's already processed
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setStep("reset");
          if (accessToken) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        } else {
          // If no session after a short delay, show error
          setTimeout(async () => {
            const {
              data: { session: retrySession },
            } = await supabase.auth.getSession();
            if (!retrySession) {
              setError(
                "Ugyldigt eller udløbet nulstillingslink. Anmod venligst om et nyt link."
              );
            }
          }, 1000);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [searchParams]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Always use production URL for password reset emails
      // This ensures emails work correctly regardless of where the request is made from
      const appUrl =
        import.meta.env.VITE_APP_URL || "https://sommerhus-one.vercel.app";
      const redirectTo = new URL("/reset-password", appUrl).toString();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Adgangskoderne matcher ikke");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Adgangskoden skal være mindst 6 tegn lang");
      setLoading(false);
      return;
    }

    try {
      // First, verify we have a valid session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!session || sessionError) {
        throw new Error(
          "Ingen gyldig session. Klik venligst på linket i din email igen."
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      // Sign out after password reset to force re-login
      await supabase.auth.signOut();

      // Success - redirect to login
      navigate("/login", {
        state: {
          message:
            "Adgangskode er blevet nulstillet. Log venligst ind med din nye adgangskode.",
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "reset") {
    return (
      <div className="min-h-screen bg-canvas-default flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent-fg/10">
              <Lock className="h-6 w-6 text-accent-fg" />
            </div>
            <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold text-fg-default">
              Nulstil adgangskode
            </h2>
            <p className="mt-2 text-center text-sm text-fg-muted">
              Indtast din nye adgangskode
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-fg-default mb-1"
                >
                  Ny adgangskode
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-border-default placeholder-fg-muted text-fg-default rounded-md focus:outline-none focus:ring-accent-fg focus:border-accent-fg focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-fg-default mb-1"
                >
                  Bekræft adgangskode
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-border-default placeholder-fg-muted text-fg-default rounded-md focus:outline-none focus:ring-accent-fg focus:border-accent-fg focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-danger-fg/10 border border-danger-fg/20 p-3 sm:p-4">
                <p className="text-sm text-danger-fg">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-btn-primary-bg hover:bg-btn-primary-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-fg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Nulstiller..." : "Nulstil adgangskode"}
              </button>
            </div>
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-fg-muted hover:text-fg-default"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Tilbage til login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-default flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent-fg/10">
            <Mail className="h-6 w-6 text-accent-fg" />
          </div>
          <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold text-fg-default">
            Glemt adgangskode?
          </h2>
          <p className="mt-2 text-center text-sm text-fg-muted">
            Indtast din email, og vi sender dig et link til at nulstille din
            adgangskode
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-success-fg/10 border border-success-fg/20 p-4">
            <p className="text-sm text-success-fg text-center">
              Vi har sendt et link til din email. Tjek din indbakke og følg
              instruktionerne for at nulstille din adgangskode.
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleRequestReset}>
            <div className="rounded-md shadow-sm">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-fg-default mb-1"
                >
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
            </div>

            {error && (
              <div className="rounded-md bg-danger-fg/10 border border-danger-fg/20 p-3 sm:p-4">
                <p className="text-sm text-danger-fg">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-btn-primary-bg hover:bg-btn-primary-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-fg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sender..." : "Send nulstillingslink"}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-fg-muted hover:text-fg-default"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Tilbage til login
          </Link>
        </div>
      </div>
    </div>
  );
}
