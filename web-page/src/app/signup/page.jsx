"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/signup/details?username=${encodeURIComponent(username)}`);
        }, 2000);
      } else {
        setError(data.error || "Failed to create account.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-simconnect-bg">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-10">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-simconnect-green mb-4">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-extrabold uppercase text-gray-900 tracking-wide">
            SIMConnect
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create an Account</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <p className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              Account created successfully! Redirecting you to fill in your details...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-simconnect-green placeholder:text-gray-500 text-simconnect-green"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-simconnect-green placeholder:text-gray-500 text-simconnect-green"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-simconnect-green placeholder:text-gray-500 text-simconnect-green"
                required
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-red-500">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-simconnect-green text-white font-bold text-sm uppercase py-2.5 rounded-lg hover:opacity-90 transition cursor-pointer"
            >
              Sign Up
            </button>

            <button
              type="button"
              className="w-full bg-gray-100 text-gray-700 font-bold text-sm uppercase py-2.5 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              onClick={() => router.push("/")}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
