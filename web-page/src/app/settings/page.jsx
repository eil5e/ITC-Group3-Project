"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import studentData from "@/data/studentInfo.json";

export default function SettingsPage() {
    const [name, setName] = useState(studentData.profile.name);
    const [studentId, setStudentId] = useState(studentData.profile.studentId || "S10234567A");
    const [email, setEmail] = useState(studentData.profile.email || "student@mymail.sim.edu.sg");
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileError, setProfileError] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");
    const [passwordError, setPasswordError] = useState("");

    async function handleSaveProfile(e) {
        e.preventDefault();
        setProfileSaved(false);
        setProfileError("");
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, studentId, email }),
            });
            if (res.ok) {
                setProfileSaved(true);
                setTimeout(() => setProfileSaved(false), 3000);
            } else {
                const errorData = await res.json();
                console.error("Server says:", errorData.error);
                setProfileError("else. Failed to save profile.");
            }
        } catch (err) {
            setProfileError("Network Error. Please try again.");
        }
    }

    function handleChangePassword(e) {
        e.preventDefault();
        setPasswordMsg("");
        setPasswordError("");
        if (currentPassword !== "password123") {
            setPasswordError("Current password is incorrect.");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }
        setPasswordMsg("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordMsg(""), 3000);
    }

    const initial = name.trim() ? name.trim()[0].toUpperCase() : "?";

    return (
        <div className="flex min-h-screen bg-simconnect-bg relative">
            <Sidebar />

            <main className="flex-1 p-8 md:p-12 h-screen overflow-y-auto">

                {/* Header */}
                <div className="flex items-center mb-8 pb-4 border-b-2 border-gray-900">
                    <div className="flex items-center space-x-3">
                        <span className="text-3xl">⚙️</span>
                        <div>
                            <h1 className="text-3xl font-extrabold uppercase text-gray-900">Settings</h1>
                            <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-wider">Manage your account</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-2xl space-y-6">

                    {/* Profile Section */}
                    <div className="bg-white border-2 border-gray-900 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b-2 border-gray-900 bg-gray-50">
                            <h2 className="text-base font-extrabold uppercase tracking-wider text-gray-900">Profile</h2>
                        </div>

                        <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                            {/* Avatar */}
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 rounded-full bg-simconnect-green flex items-center justify-center text-white text-2xl font-black border-2 border-gray-900 shadow-md">
                                    {initial}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-700">{name}</p>
                                    <p className="text-xs text-gray-400 font-medium">Display name initial shown in avatar</p>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-simconnect-green outline-none font-semibold text-simconnect-green placeholder-gray-400"
                                    placeholder="Your full name"
                                    required
                                />
                            </div>

                            {/* Student ID */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Student ID</label>
                                <input
                                    type="text"
                                    value={studentId}
                                    onChange={e => setStudentId(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-simconnect-green outline-none font-semibold text-simconnect-green placeholder-gray-400"
                                    placeholder="e.g. S10234567A"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-simconnect-green outline-none font-semibold text-simconnect-green placeholder-gray-400"
                                    placeholder="your@email.com"
                                />
                            </div>

                            {profileSaved && (
                                <p className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
                                    Profile saved successfully.
                                </p>
                            )}
                            {profileError && (
                                <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                                    {profileError}
                                </p>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-simconnect-green text-white text-sm font-bold uppercase tracking-wider rounded-xl border-2 border-gray-900 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                                >
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Section */}
                    <div className="bg-white border-2 border-gray-900 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b-2 border-gray-900 bg-gray-50">
                            <h2 className="text-base font-extrabold uppercase tracking-wider text-gray-900">Change Password</h2>
                        </div>

                        <form onSubmit={handleChangePassword} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-simconnect-green outline-none font-semibold text-simconnect-green placeholder-gray-400"
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-simconnect-green outline-none font-semibold text-simconnect-green placeholder-gray-400"
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-simconnect-green outline-none font-semibold text-simconnect-green placeholder-gray-400"
                                    placeholder="Re-enter new password"
                                    required
                                />
                            </div>

                            {passwordMsg && (
                                <p className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
                                    {passwordMsg}
                                </p>
                            )}
                            {passwordError && (
                                <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                                    {passwordError}
                                </p>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-simconnect-green text-white text-sm font-bold uppercase tracking-wider rounded-xl border-2 border-gray-900 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* About Section */}
                    <div className="bg-white border-2 border-gray-900 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b-2 border-gray-900 bg-gray-50">
                            <h2 className="text-base font-extrabold uppercase tracking-wider text-gray-900">About</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">App</span>
                                <span className="text-sm font-bold text-gray-900">SIMConnect</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Version</span>
                                <span className="text-sm font-bold text-gray-900">1.0.0</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Built with</span>
                                <span className="text-sm font-bold text-gray-900">Next.js · Tailwind CSS · OpenAI</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Team</span>
                                <span className="text-sm font-bold text-gray-900">ITC Group 3</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
