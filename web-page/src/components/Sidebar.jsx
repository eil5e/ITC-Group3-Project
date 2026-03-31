"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
    { 
        name: "Dashboard", 
        href: "/dashboard",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        )
    },
    { 
        name: "Schedule", 
        href: "/schedule",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        )
    },
    { 
        name: "My Modules", 
        href: "/modules",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6.5" /></svg>
        )
    },
    { 
        name: "Module Enrollment",
        href: "/enrollment",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        )
    },
    { 
        name: "Notes-Buddy", 
        href: "/notes-buddy",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        )
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        router.push("/");
    };

    return (
        <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shadow-sm">
            
            {/* Logo Area */}
            <div className="h-24 flex items-center px-8 border-b border-gray-100">
                <div className="w-10 h-10 bg-simconnect-green rounded-xl flex items-center justify-center mr-3 shadow-md text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6.5" /></svg>
                </div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">SimConnect</h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    
                    return (
                        <Link href={item.href} key={item.name} className="block group">
                            <div 
                                className={`flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                                    isActive 
                                    ? "bg-simconnect-green text-white shadow-md shadow-emerald-900/20" 
                                    : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                            >
                                <div className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-900"} transition-colors`}>
                                    {item.icon}
                                </div>
                                <span className={`text-sm font-bold uppercase tracking-wider ${isActive ? "text-white" : ""}`}>
                                    {item.name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Settings/Logout Area */}
            <div className="p-6 border-t border-gray-100 space-y-3">
                <button onClick={() => router.push("/settings")} className="w-full flex items-center space-x-4 px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span>Settings</span>
                </button>
                <button onClick={handleLogout} className="w-full flex items-center space-x-4 px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-colors text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}