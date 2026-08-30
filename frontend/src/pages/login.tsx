import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] =
    useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "login"
          ? "/api/auth/login"
          : "/api/auth/register";

      const response = await fetch(
        `${API_BASE}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to authenticate."
        );
      }

      // ======================================================
      // SAVE JWT
      // ======================================================

      if (!data.access_token) {
        throw new Error(
          "Authentication succeeded, but no access token was returned."
        );
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // Remove any old token key we previously used.
      localStorage.removeItem("token");

      // ======================================================
      // VERIFY TOKEN WAS SAVED
      // ======================================================

      const savedToken =
        localStorage.getItem("access_token");

      if (!savedToken) {
        throw new Error(
          "Could not save authentication token."
        );
      }

      // ======================================================
      // GO TO BRAIN
      // ======================================================

      navigate("/brain");

    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-void text-white flex items-center justify-center px-6 font-body">

      <div className="w-full max-w-md">

        {/* Back */}
        <Link
          to="/"
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          ← Back
        </Link>

        {/* Header */}
        <div className="mt-10 mb-8">

          <div className="font-display text-3xl">
            Digital Brain
          </div>

          <p className="text-white/40 text-sm mt-2">
            {mode === "login"
              ? "Enter your brain."
              : "Create your own digital brain."}
          </p>

        </div>

        {/* Card */}
        <div className="bg-surface/70 border border-line rounded-2xl p-6 backdrop-blur">

          {/* Toggle */}
          <div className="flex bg-void rounded-lg p-1 mb-6">

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 py-2 rounded-md text-sm transition-colors ${
                mode === "login"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`flex-1 py-2 rounded-md text-sm transition-colors ${
                mode === "register"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Create account
            </button>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Email */}
            <div>

              <label className="block text-xs text-white/50 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full bg-void border border-line rounded-lg px-3 py-3 text-sm outline-none focus:border-white/30 transition-colors"
              />

            </div>

            {/* Password */}
            <div>

              <label className="block text-xs text-white/50 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                className="w-full bg-void border border-line rounded-lg px-3 py-3 text-sm outline-none focus:border-white/30 transition-colors"
              />

            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-3 py-2 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-signal text-void rounded-lg py-3 text-sm font-medium hover:bg-white transition-colors disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Enter brain"
                : "Create brain"}
            </button>

          </form>

        </div>

        <p className="text-center text-white/20 text-xs mt-6 font-mono">
          Your ideas. Your connections. Your brain.
        </p>

      </div>

    </div>
  );
}