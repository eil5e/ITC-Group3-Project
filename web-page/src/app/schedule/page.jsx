"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

const parseTimeForSorting = (timeString) => {
    if (!timeString) return 0;
    
    const startTime = timeString.split(" - ")[0]; 
    const match = startTime.match(/(\d+):(\d+)(am|pm)/i);
    if (!match) return 0;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const modifier = match[3].toLowerCase();

    if (modifier === 'pm' && hours < 12) hours += 12;
    if (modifier === 'am' && hours === 12) hours = 0;

    return (hours * 60) + minutes;
};

export default function SchedulePage() {
    const [user, setUser] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedClass, setSelectedClass] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const getSubjectTheme = (code) => {
        if (!user || !user.modules) return "bg-gray-100 text-gray-800 border-gray-300";
        const matchingModule = user.modules.find(mod => mod.code === code);
        return matchingModule?.theme || "bg-gray-100 text-gray-800 border-gray-300";
    };

    if (!user) {
        return (
            <div className="flex min-h-screen bg-simconnect-bg">
                <Sidebar />
                <main className="flex-1 p-8 md:p-12 h-screen flex items-center justify-center">
                    <p className="text-gray-500 font-bold animate-pulse text-lg">
                        LOADING YOUR SCHEDULE...
                    </p>
                </main>
            </div>
        );
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    return (
        <div className="flex min-h-screen bg-simconnect-bg relative">
            <Sidebar />

            <main className="flex-1 p-8 md:p-12 h-screen overflow-y-auto relative">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-900">
                    <div>
                        <div className="flex items-center space-x-3">
                            <span className="text-3xl">📅</span>
                            <h1 className="text-3xl font-extrabold uppercase text-gray-900">
                                CLASS SCHEDULE
                            </h1>
                        </div>
                        <p className="text-sm font-bold text-gray-600 mt-2 uppercase tracking-wider">Your academic calendar</p>
                    </div>

                    {/* Month Navigation Controls */}
                    <div className="flex items-center space-x-4 bg-white border-2 border-gray-900 rounded-lg p-2 shadow-sm">
                        <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors cursor-pointer font-bold text-xl">
                            ←
                        </button>
                        <h2 className="text-xl font-extrabold text-gray-900 w-48 text-center uppercase tracking-widest">
                            {MONTHS[month]} {year}
                        </h2>
                        <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors cursor-pointer font-bold text-xl">
                            →
                        </button>
                    </div>
                </div>

                {/* Calendar Container */}
                <div className="bg-white border-2 border-gray-900 rounded-xl overflow-hidden shadow-sm">
                    
                    {/* CHANGED: Text size increased from text-xs to text-sm */}
                    <div className="grid grid-cols-7 bg-simconnect-green text-white border-b-2 border-gray-900">
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-emerald-800 last:border-0">
                                {day.substring(0, 3)}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 bg-gray-100 gap-[1px] border-b-2 border-gray-900">
                        
                        {blanks.map((_, i) => (
                            <div key={`blank-${i}`} className="bg-gray-50 min-h-[150px] p-2"></div>
                        ))}

                        {days.map(day => {
                            const currentDayOfWeek = DAYS_OF_WEEK[new Date(year, month, day).getDay()];
                            const currentDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                            const todaysClasses = (user.schedule || [])
                                .filter(c => {
                                    if (!c.days.includes(currentDayOfWeek)) return false;
                                    if (c.startDate && currentDateStr < c.startDate) return false;
                                    if (c.endDate && currentDateStr > c.endDate) return false;
                                    return true;
                                })
                                .map(c => ({
                                    ...c,
                                    displayTime: c.dayTimes?.[currentDayOfWeek] ?? c.time,
                                }))
                                .sort((a, b) => parseTimeForSorting(a.displayTime) - parseTimeForSorting(b.displayTime));

                            return (
                                <div key={day} className={`min-h-[150px] p-2.5 flex flex-col transition-colors ${isToday(day) ? "bg-emerald-50" : "bg-white"} hover:bg-gray-50`}>
                                    
                                    <div className="flex justify-between items-start mb-3">
                                        {/* CHANGED: Date number size increased to text-base */}
                                        <span className={`w-8 h-8 flex items-center justify-center rounded-full text-base font-bold ${isToday(day) ? "bg-simconnect-green text-white shadow-md" : "text-gray-700"}`}>
                                            {day}
                                        </span>
                                    </div>

                                    <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                                        {todaysClasses.map(cls => (
                                            <button 
                                                key={cls.id} 
                                                onClick={() => setSelectedClass(cls)}
                                                className={`w-full text-left p-2 border rounded-md cursor-pointer hover:opacity-80 transition-opacity ${getSubjectTheme(cls.code)}`}
                                            >
                                                {/* CHANGED: Font sizes significantly bumped up! */}
                                                <p className="text-xs font-extrabold truncate leading-tight">{cls.code}</p>
                                                <p className="text-[11px] font-bold opacity-90 truncate mt-0.5">{cls.displayTime}</p>
                                            </button>
                                        ))}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>


            {/* The Popup Modal */}
            {selectedClass && (
                <div 
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up"
                    onClick={() => setSelectedClass(null)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-[450px] max-w-full overflow-hidden border-2 border-gray-900 transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`p-6 border-b-2 border-gray-900 ${getSubjectTheme(selectedClass.code).split(" ")[0]} ${getSubjectTheme(selectedClass.code).split(" ")[1]}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight">{selectedClass.code}</h2>
                                    <p className="font-bold uppercase tracking-wider mt-1 opacity-90">{selectedClass.name}</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedClass(null)} 
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors cursor-pointer text-xl font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6 bg-white">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl border-2 border-gray-900">🕒</div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Schedule</p>
                                    <p className="font-extrabold text-gray-900 text-lg">{selectedClass.displayTime ?? selectedClass.time}</p>
                                    <p className="text-sm font-medium text-gray-700">{selectedClass.days.join(", ")}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl border-2 border-gray-900">📍</div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</p>
                                    <p className="font-extrabold text-gray-900 text-lg">{selectedClass.location}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl border-2 border-gray-900">👨‍🏫</div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Instructor</p>
                                    <p className="font-extrabold text-gray-900 text-lg">{selectedClass.instructor}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-gray-50 border-t-2 border-gray-900 flex justify-end space-x-3">
                            <button className="px-5 py-2.5 bg-white border-2 border-gray-900 text-gray-900 text-sm font-bold uppercase rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shadow-sm">
                                View Materials
                            </button>
                            <button 
                                onClick={() => setSelectedClass(null)} 
                                className="px-5 py-2.5 bg-simconnect-button border-2 border-gray-900 text-gray-900 text-sm font-bold uppercase rounded-lg hover:opacity-90 transition-colors cursor-pointer shadow-sm"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}