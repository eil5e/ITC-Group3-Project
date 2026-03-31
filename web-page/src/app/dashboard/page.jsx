"use client"; // REQUIRED: Allows this page to handle button clicks and state!

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ToDoList from "@/components/ToDoList";
import QuickAccess from "@/components/QuickAccess";
import NextClass from "@/components/NextClass";
import ChatBot from "@/components/ChatBot"; // Import the new ChatBot
import GlobalChat from "@/components/GlobalChat";

export default function DashboardPage() {
  // State to track if the chat window is open or closed
  const [isChatOpen, setIsChatOpen] = useState(false);

  const router = useRouter();
  const [user, setUser] = useState(null);


  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      router.push("/");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen bg-simconnect-bg relative">
        <Sidebar />
        <main className="flex-1 p-8 md:p-12">
          <h1 className="text-3xl font-extrabold uppercase text-gray-900">Loading Dashboard...</h1>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-simconnect-bg relative">
      <Sidebar />

      <main className="flex-1 p-8 md:p-12">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold uppercase text-gray-900">
              Welcome, {user.name || "Student"}
            </h1>
            <p className="mt-2 text-sm italic text-gray-700">
              "Dear Students, Mistakes help you learn and grow"
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-3 rounded-full overflow-hidden border-gray-900 flex flex-col items-center justify-center">
              {user.pfp ? (
                <img src={user.pfp} alt="Profile" className="w-full h-full object-cover object-center"
                />
              ) : (
                <span className="text-4xl font-light text-gray-900">
                {user.name?.trim() ? user.name.trim() [0].toUpperCase() : "?"}
                </span>
              )}
            </div>
            <span className="mt-2 text-xs font-bold uppercase text-gray-900">
              Profile
            </span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <ToDoList />
          </div>
          <div className="md:col-span-2 space-y-8">
            <QuickAccess />
            <NextClass />
          </div>
        </div>
      </main>



      {/* The actual ChatBot window (Only renders when isChatOpen is true) */}
      {isChatOpen && <ChatBot onClose={() => setIsChatOpen(false)} />}

      <GlobalChat />
    </div>
  );
}