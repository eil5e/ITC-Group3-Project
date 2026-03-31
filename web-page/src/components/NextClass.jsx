"use client";

import { useState, useEffect } from "react";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const parseTimeForComparison = (timeString) => {
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

export default function NextClass() {
    const [upcomingClass, setUpcomingClass] = useState(null);
    const [dayLabel, setDayLabel] = useState("");
    
    // We only need one state now to track if the button was clicked
    const [isMarked, setIsMarked] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem("currentUser");
        if (!savedUser) return;

        const user = JSON.parse(savedUser);
        const schedule = user.schedule || [];

        const findNextClass = () => {
            const now = new Date();
            const currentDayIndex = now.getDay();
            const currentMinutes = (now.getHours() * 60) + now.getMinutes();

            const sortedClasses = [...schedule].sort((a, b) => 
                parseTimeForComparison(a.time) - parseTimeForComparison(b.time)
            );

            for (let i = 0; i < 7; i++) {
                const checkDayIndex = (currentDayIndex + i) % 7;
                const checkDayName = DAYS_OF_WEEK[checkDayIndex];
                const classesOnDay = sortedClasses.filter(c => c.days.includes(checkDayName));

                for (const cls of classesOnDay) {
                    if (i === 0) {
                        if (parseTimeForComparison(cls.time) > currentMinutes) {
                            setUpcomingClass(cls);
                            setDayLabel("TODAY");
                            return;
                        }
                    } else {
                        setUpcomingClass(cls);
                        setDayLabel(i === 1 ? "TOMORROW" : checkDayName.toUpperCase());
                        return;
                    }
                }
            }
        };

        findNextClass();
    }, []);

    const handleMarkAttendance = () => {
        if (isMarked) return; 
        setIsMarked(true); // Just flip the switch to true!
    };

    if (!upcomingClass) {
        return (
            <div className="w-full p-6 border-2 border-gray-900 rounded-lg bg-white min-h-[300px] flex items-center justify-center">
                <p className="font-bold text-gray-500 text-lg">No upcoming classes! Rest well ⸜(｡˃ ᵕ ˂ )⸝♡</p>
            </div>
        );
    }

    return (
        <div className="w-full p-8 border-2 border-gray-900 rounded-xl bg-white">

            <div className="flex items-center justify-between mb-8 pb-3 border-b-2 border-gray-900 mt-2">
                <div className="flex items-center">
                    <span className="text-2xl mr-2">⏭️</span>
                    <h2 className="text-2xl font-extrabold uppercase text-gray-900">NEXT CLASS</h2>
                </div>
                <span className="px-4 py-1.5 bg-simconnect-green text-white text-sm font-bold rounded-md tracking-wider">
                    {dayLabel}
                </span>
            </div>

            <p className="text-sm font-bold uppercase text-gray-800 tracking-wider">MODULE CODE AND NAME</p>
            
            <h3 className="text-6xl font-black text-gray-950 my-3 tracking-tight">{upcomingClass.code}</h3>
            
            <p className="text-lg font-bold uppercase text-gray-800 mb-10">{upcomingClass.name}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                <div className="space-y-6 md:col-span-2">
                    <div className="flex items-start space-x-4">
                        <span className="text-3xl mt-1">🕒</span>
                        <div>
                            <p className="text-sm font-bold uppercase text-gray-800 tracking-wider">TIME</p>
                            <p className="text-xl font-black text-gray-950">{upcomingClass.time}</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-4">
                        <span className="text-3xl mt-1">📍</span>
                        <div>
                            <p className="text-sm font-bold uppercase text-gray-800 tracking-wider">LOCATION</p>
                            <p className="text-xl font-black text-gray-950">{upcomingClass.location}</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleMarkAttendance}
                    disabled={isMarked}
                    className={`h-20 rounded-xl text-base font-black uppercase shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] transition-all cursor-pointer border-2 border-gray-900 ${
                        isMarked 
                        ? "bg-gray-100 text-gray-400 border-gray-300 shadow-none translate-y-1 cursor-not-allowed" 
                        : "bg-simconnect-button text-gray-950 hover:translate-y-1 hover:shadow-none"
                    }`}
                >
                    {isMarked ? "Marked ✔" : "Mark Attendance"}
                </button>
            </div>
        </div>
    );
}