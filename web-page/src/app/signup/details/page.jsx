"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupDetailsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const username = searchParams.get("username");

    const [name, setName] = useState("");
    const [studentId, setStudentId] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSaveNewProfile(e) {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!name || !studentId || !email) {
            setError("All fields are required.");
            return;
        }

        try {
            const res = await fetch("/api/signup/details", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    name,
                    studentId,
                    email
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/");
                }, 2000);
            } else {
                setError(data.error || "Failed to save profile details.");
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
              Profile updated successfully! Redirecting to login...
            </p>
          </div>
        ) : (
            <form onSubmit={handleSaveNewProfile} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                        Account
                    </label>
                    <input
                        type="text"
                        value={username}
                        disabled
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-simconnect-green placeholder:text-gray-500 text-simconnect-green bg-gray-100 cursor-not-allowed"
                    /> 
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-simconnect-green placeholder:text-gray-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                        Student ID
                    </label>
                    <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="Your student ID"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-simconnect-green placeholder:text-gray-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-simconnect-green placeholder:text-gray-500"
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
                    Save & Continue
                </button>
            </form>
        )}
      </div>
    </div>
  );
}