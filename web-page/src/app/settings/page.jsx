"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [studentId, setStudentId] = useState("");
    const [email, setEmail] = useState("");
    const [pfp, setPfp] = useState(null);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileError, setProfileError] = useState("");

    const [isPfpModalOpen, setIsPfpModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
            const user = JSON.parse(savedUser);
            setName(user.name || "Name not set");
            setUsername(user.username || "");
            setStudentId(user.studentId || "ID not set");
            setEmail(user.email || "Email not set");
            setPfp(user.pfp || null);
        }
    }, []);

    useEffect(() => {
        const handlePfpChange = () => {
            const savedUser = localStorage.getItem("currentUser");
            if (savedUser) {
                const user = JSON.parse(savedUser);
                setPfp(user.pfp || null);
            }
        };
        window.addEventListener("storage", handlePfpChange);
        return () => window.removeEventListener("storage", handlePfpChange);
    }, [])

    const handleNewPfp = (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file.");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                alert("File size must be under 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    const maxWidth = 250
                    const maxHeight = 250
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL("image/jpeg");

                    setPfp(compressedBase64);
                    setIsPfpModalOpen(false);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    }; //wanna either add new file to database or replace?

    const handleRemovePfp = () => {
        setPfp(null);
        setIsPfpModalOpen(false);
    };

    async function handleSaveProfile(e) {
        e.preventDefault();
        setProfileSaved(false);
        setProfileError("");
        try {
            const savedUser = JSON.parse(localStorage.getItem("currentUser"));
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: savedUser?.username,
                    name,
                    studentId,
                    email,
                    pfp
                }),
            });
            if (res.ok) {
                setProfileSaved(true);
                const savedUser = JSON.parse(localStorage.getItem("currentUser"));
                localStorage.setItem("currentUser", JSON.stringify({
                    ...savedUser,
                    name,
                    studentId,
                    email,
                    pfp
                }));

                window.dispatchEvent(new Event("storage"));
                setTimeout(() => setProfileSaved(false), 3000);
            } else {
                const errorData = await res.json();
                console.error("Server says:", errorData.error);
                setProfileError("Failed to save profile.");
            }
        } catch (err) {
            setProfileError("Network Error. Please try again.");
        }
    }

        async function handleChangePassword(e) {
        e.preventDefault();
        setPasswordMsg("");
        setPasswordError("");

        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }
        if (newPassword === currentPassword) {
            setPasswordError("New password cannot be the same as current password.");
            return;
        }

        try {
            const savedUser = JSON.parse(localStorage.getItem("currentUser"));
            const res = await fetch("/api/profile/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    username: savedUser?.username,
                    currentPassword,
                    newPassword 
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setPasswordMsg("Password updated successfully.");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setTimeout(() => setPasswordMsg(""), 3000);
            } else {
                setPasswordError(data.error || "Failed to update password.");
            }
        } catch (err) {
            setPasswordError("Network Error. Please try again.");
        }
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
                                <button
                                    type="button"
                                    onClick={() => setIsPfpModalOpen(true)}
                                    className="w-16 h-16 rounded-full overflow-hidden bg-simconnect-green flex items-center justify-center border-2 border-gray-900 shadow-md cursor-pointer hover:opactiy-90 transition-opacity"
                                >
                                    {pfp ? (
                                        <img src={pfp} alt="Profile" className="w-full h-full object-cover object-center" />
                                    ) : (
                                        <span className="text-white text-2xl font-black leading-none flex items-center justify-center">{initial}</span>
                                    )}
                                </button>
                                <div>
                                    <p className="text-sm font-bold text-gray-700">{name}</p>
                                    <p className="text-xs text-gray-400 font-medium">Click on avatar to change profile picture</p>
                                </div>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleNewPfp}
                                accept="image/*"
                                className="hidden"
                            />

                            {/* Username */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    className="w-full p-3 border-2 border-gray-500 bg-gray-300 rounded-xl focus:border-simconnect-green outline-none font-semibold text-simconnect-green placeholder-gray-400"
                                    disabled
                                />
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

            {/* PFP Pop-Up */}
            {isPfpModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80 flex flex-col items-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Update Profile Picture</h3>

                        {/*Pfp Preview*/}
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-simconnect-green flex flex-col items-center justify-center border-2 border-gray-900 mb-6 shadow-md">
                            {pfp ? (
                                <img src={pfp} alt="Profile Preview" className="w-full h-full object-cover object-center" />
                            ) : (
                                <span className="text-white text-5xl font-black leading-none flex items-center justify-center">{initial}</span>
                            )}
                        </div>

                        <div className="w-full space-y-3">
                            {/* Update Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="w-full px-4 py-2 bg-simconnect-green text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Update Profile Picture
                            </button>

                            {/* Remove Button */}
                            {pfp && (
                                <button
                                    type="button"
                                    onClick={handleRemovePfp}
                                    className="w-full px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Remove Profile Picture
                                </button>
                            )}

                            {/* Cancel Button */}
                            <button
                                type="button"
                                onClick={() => setIsPfpModalOpen(false)}
                                className="w-full px-4 py-2 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>

            )}

        </div>
    );
}
