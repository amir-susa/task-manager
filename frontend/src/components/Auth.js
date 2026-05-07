import { useState } from "react";
import API from "../api";

const SunIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>;
const MoonIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>;

export default function Auth({ setUser, theme, setTheme }) {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!email || !password) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);

      const url = isLogin ? "/auth/login" : "/auth/register";

      const res = await API.post(url, { email, password });

      // Save token only on login
      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        setUser(true);
      } else {
        setIsLogin(true);
        setError("Registered successfully. Please login.");
      }

    } catch (err) {
      const message = err.response?.data?.error || err.message || "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`h-screen flex items-center justify-center overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Auth Card */}
      <div className={`relative z-10 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl ${theme === 'dark' ? 'bg-slate-900/50 border border-slate-700/50 text-slate-100' : 'bg-white/90 border border-slate-200 text-slate-900'}`}>
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-3 py-2 rounded-md border border-slate-700/50 bg-slate-800/60 text-slate-100 hover:bg-slate-700/70 transition flex items-center gap-2"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            Task Manager
          </h1>
          <p className="text-slate-400 text-sm">Manage your workflow with style</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-lg">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
              setEmail("");
              setPassword("");
            }}
            className={`flex-1 py-2 px-4 rounded-md transition font-medium text-sm ${
              isLogin
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
              setEmail("");
              setPassword("");
            }}
            className={`flex-1 py-2 px-4 rounded-md transition font-medium text-sm ${
              !isLogin
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 mb-4 rounded-lg text-sm flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="space-y-3 mb-6">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className={`w-full px-4 py-3 rounded-lg border focus:border-blue-500/50 focus:outline-none transition ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className={`w-full px-4 py-3 rounded-lg border focus:border-blue-500/50 focus:outline-none transition ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Please wait...
            </span>
          ) : isLogin ? (
            "Login"
          ) : (
            "Create Account"
          )}
        </button>

        {/* Toggle Link */}
        <p className="text-center text-slate-400 text-sm mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setEmail("");
              setPassword("");
            }}
            className="text-blue-400 hover:text-blue-300 cursor-pointer font-semibold transition"
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 mt-6 pt-6 border-t border-slate-700/30">
          Your tasks are encrypted and secure
        </div>
      </div>
    </div>
  );
}