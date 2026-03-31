"use client";

import Sidebar from "@/components/Sidebar";

// Dummy data
const announcements = [
    {
        id: 1,
        isPinned: true,
        category: "Academic",
        categoryColor: "bg-blue-100 text-blue-800 border-blue-300",
        title: "Intro to AI: Mid-Term Examination Schedule Released",
        date: "March 24, 2026",
        author: "Academic Office",
        content: "The mid-term examination schedule for Semester 1 2026 has been published. Please ensure you review your exam dates for CSCI-213 and your other modules on the Schedule page."
    },
    {
        id: 2,
        isPinned: true,
        category: "Events",
        categoryColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
        title: "Guest Speaker: Scaling Startups in Southeast Asia",
        date: "March 23, 2026",
        author: "Business School",
        content: "Join us this Friday for an exclusive session with local founders discussing the current innovation landscape in Singapore. Perfect for students working on market analysis projects!"
    },
    {
        id: 3,
        isPinned: false,
        category: "Project",
        categoryColor: "bg-purple-100 text-purple-800 border-purple-300",
        title: "Group 3 Update from Katrin",
        date: "March 22, 2026",
        author: "Katrin",
        content: "Hey everyone, just a reminder to upload your sections for the Canadian startup market analysis to the shared drive before our sync next week."
    },
    {
        id: 4,
        isPinned: false,
        category: "System",
        categoryColor: "bg-amber-100 text-amber-800 border-amber-300",
        title: "System Maintenance Notice",
        date: "March 20, 2026",
        author: "IT Services",
        content: "SIMConnect will undergo scheduled maintenance this Sunday from 2:00 AM to 6:00 AM. Services will be temporarily unavailable."
    }
];

export default function AnnouncementsPage() {
    // Separate the announcements so we can render them in different sections
    const pinnedAnnouncements = announcements.filter(a => a.isPinned);
    const recentAnnouncements = announcements.filter(a => !a.isPinned);

    return (
        <div className="flex min-h-screen bg-simconnect-bg relative">
            <Sidebar />

            <main className="flex-1 p-8 md:p-12 h-screen overflow-y-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-10 pb-4 border-b-2 border-gray-900">
                    <div>
                        <div className="flex items-center space-x-3">
                            <span className="text-3xl">📢</span>
                            <h1 className="text-3xl font-extrabold uppercase text-gray-900">
                                ANNOUNCEMENTS
                            </h1>
                        </div>
                        <p className="text-sm font-bold text-gray-600 mt-2 uppercase tracking-wider">
                            Stay updated with the latest news and updates
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl space-y-10 pb-24">
                    
                    {/* PINNED SECTION */}
                    <section>
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-lg">📌</span>
                            <h2 className="text-xl font-extrabold text-gray-900 uppercase">Pinned Announcements</h2>
                        </div>
                        <div className="space-y-4">
                            {pinnedAnnouncements.map(item => (
                                <div key={item.id} className="bg-white border-2 border-gray-900 rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(17,24,39,1)]">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border-2 ${item.categoryColor}`}>
                                            {item.category}
                                        </span>
                                        <span className="text-gray-900">📌</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{item.title}</h3>
                                    <div className="flex items-center space-x-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                                        <span className="flex items-center"><span className="mr-1.5">📅</span> {item.date}</span>
                                        <span className="flex items-center"><span className="mr-1.5">👤</span> {item.author}</span>
                                    </div>
                                    <p className="text-gray-700 font-medium leading-relaxed">
                                        {item.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* RECENT SECTION */}
                    <section>
                        <h2 className="text-xl font-extrabold text-gray-900 uppercase mb-4">Recent Announcements</h2>
                        <div className="space-y-4">
                            {recentAnnouncements.map(item => (
                                <div key={item.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-900 transition-colors">
                                    <div className="mb-3">
                                        <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border-2 ${item.categoryColor}`}>
                                            {item.category}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">{item.title}</h3>
                                    <div className="flex items-center space-x-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                                        <span className="flex items-center"><span className="mr-1.5">📅</span> {item.date}</span>
                                        <span className="flex items-center"><span className="mr-1.5">👤</span> {item.author}</span>
                                    </div>
                                    <p className="text-gray-600 font-medium leading-relaxed">
                                        {item.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </main>

        </div>
    );
}