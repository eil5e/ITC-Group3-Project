"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    if (username === "student" && password === "password123") {
      router.push("/dashboard");
    } else {
      setError("Invalid username or password.");
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
          <p className="text-sm text-gray-500 mt-1">Student Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="student"
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

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-simconnect-green text-white font-bold text-sm uppercase py-2.5 rounded-lg hover:opacity-90 transition"
          >
            Log In
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Default password: <span className="font-mono">password123</span>
        </p>
      </div>
    </div>
  );
}
