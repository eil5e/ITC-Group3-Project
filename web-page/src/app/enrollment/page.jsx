"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import studentData from "@/data/studentInfo.json";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function to12h(timeStr) {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "pm" : "am";
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}${period}`;
}

function TimeRange({ startVal, endVal, onStart, onEnd }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1">Start</label>
                <input type="time" value={startVal} onChange={e => onStart(e.target.value)}
                    className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-gray-900 outline-none font-medium text-simconnect-green text-sm" />
            </div>
            <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1">End</label>
                <input type="time" value={endVal} onChange={e => onEnd(e.target.value)}
                    className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-gray-900 outline-none font-medium text-simconnect-green text-sm" />
            </div>
        </div>
    );
}

export default function EnrollmentPage() {
    const [formData, setFormData] = useState({ code: "", name: "", instructor: "", credits: "", location: "" });
    const [selectedDays, setSelectedDays] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sameTime, setSameTime] = useState(true);
    const [sharedStart, setSharedStart] = useState("");
    const [sharedEnd, setSharedEnd] = useState("");
    const [perDayTimes, setPerDayTimes] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errorMsg) setErrorMsg("");
    };

    const toggleDay = (day) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
        if (errorMsg) setErrorMsg("");
    };

    const setDayTime = (day, field, val) => {
        setPerDayTimes(prev => ({ ...prev, [day]: { ...prev[day], [field]: val } }));
    };

    const handleEnroll = async (e) => {
        e.preventDefault();

        if (Object.values(formData).some(v => !v.trim())) {
            setErrorMsg("Please fill out every field before enrolling."); return;
        }
        if (selectedDays.length === 0) {
            setErrorMsg("Please select at least one day."); return;
        }
        if (!startDate || !endDate) {
            setErrorMsg("Please select both a start and end date."); return;
        }
        if (startDate > endDate) {
            setErrorMsg("End date must be after start date."); return;
        }

        let timeFormatted = "";
        let dayTimesFormatted = null;

        if (sameTime) {
            if (!sharedStart || !sharedEnd) { setErrorMsg("Please select both start and end times."); return; }
            if (sharedStart >= sharedEnd) { setErrorMsg("End time must be after start time."); return; }
            timeFormatted = `${to12h(sharedStart)} - ${to12h(sharedEnd)}`;
        } else {
            dayTimesFormatted = {};
            for (const day of selectedDays) {
                const t = perDayTimes[day];
                if (!t?.start || !t?.end) { setErrorMsg(`Please set times for ${day}.`); return; }
                if (t.start >= t.end) { setErrorMsg(`End time must be after start time for ${day}.`); return; }
                dayTimesFormatted[day] = `${to12h(t.start)} - ${to12h(t.end)}`;
            }
            // Use the first day's time as the default display time
            timeFormatted = dayTimesFormatted[selectedDays[0]];
        }

        setIsSubmitting(true);
        setErrorMsg("");

        const response = await fetch("/api/enroll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...formData,
                days: selectedDays.join(", "),
                time: timeFormatted,
                dayTimes: dayTimesFormatted,
                startDate,
                endDate,
            }),
        });

        if (response.ok) {
            alert("Successfully enrolled! The page will now refresh.");
            window.location.reload();
        } else {
            setErrorMsg("Server error: Could not enroll in the class.");
        }
        setIsSubmitting(false);
    };

    const handleDrop = async (code) => {
        if (!confirm(`Are you sure you want to drop ${code}?`)) return;
        const response = await fetch("/api/enroll", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        });
        if (response.ok) window.location.reload();
    };

    const inputClass = "w-full p-3 border-2 border-gray-300 rounded-lg focus:border-gray-900 outline-none font-medium placeholder:text-gray-500 text-simconnect-green";

    return (
        <div className="flex min-h-screen bg-simconnect-bg relative">
            <Sidebar />
            <main className="flex-1 p-8 md:p-12 h-screen overflow-y-auto">

                <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-900">
                    <div>
                        <div className="flex items-center space-x-3">
                            <span className="text-3xl">📝</span>
                            <h1 className="text-3xl font-extrabold uppercase text-gray-900">MODULE ENROLLMENT</h1>
                        </div>
                        <p className="text-sm font-bold text-gray-600 mt-2 uppercase tracking-wider">Manage your courses</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* LEFT: Form */}
                    <div className="bg-white border-2 border-gray-900 rounded-xl p-8 shadow-sm h-fit">
                        <h2 className="text-xl font-extrabold text-gray-900 mb-6 uppercase border-b-2 border-gray-200 pb-2">Enroll in a New Module</h2>

                        {errorMsg && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-md">
                                ⚠️ {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleEnroll} className="space-y-4">

                            {/* Code + Credits */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Course Code</label>
                                    <input required type="text" name="code" placeholder="e.g. ENG-101" value={formData.code} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Credits</label>
                                    <input required type="number" name="credits" placeholder="e.g. 3" value={formData.credits} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Course Title</label>
                                <input required type="text" name="name" placeholder="e.g. Academic Writing" value={formData.name} onChange={handleChange} className={inputClass} />
                            </div>

                            {/* Instructor + Location */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Instructor</label>
                                    <input required type="text" name="instructor" placeholder="e.g. Dr. Adams" value={formData.instructor} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Location</label>
                                    <input required type="text" name="location" placeholder="e.g. Room 3B" value={formData.location} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>

                            {/* Start + End Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Start Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-gray-900 outline-none font-medium text-simconnect-green" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">End Date</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-gray-900 outline-none font-medium text-simconnect-green" />
                                </div>
                            </div>

                            {/* Days */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Days</label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(day => (
                                        <button key={day} type="button" onClick={() => toggleDay(day)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${
                                                selectedDays.includes(day)
                                                    ? "bg-simconnect-green text-white border-simconnect-green"
                                                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                                            }`}
                                        >
                                            {day.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                                {selectedDays.length > 0 && (
                                    <p className="text-xs text-simconnect-green font-semibold mt-1.5">{selectedDays.join(", ")}</p>
                                )}
                            </div>

                            {/* Time */}
                            {selectedDays.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Time</label>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => setSameTime(true)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold border-2 cursor-pointer transition-all ${sameTime ? "bg-simconnect-green text-white border-simconnect-green" : "bg-white text-gray-500 border-gray-300 hover:border-gray-500"}`}>
                                                Same for all
                                            </button>
                                            <button type="button" onClick={() => setSameTime(false)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold border-2 cursor-pointer transition-all ${!sameTime ? "bg-simconnect-green text-white border-simconnect-green" : "bg-white text-gray-500 border-gray-300 hover:border-gray-500"}`}>
                                                Per day
                                            </button>
                                        </div>
                                    </div>

                                    {sameTime ? (
                                        <>
                                            <TimeRange
                                                startVal={sharedStart} endVal={sharedEnd}
                                                onStart={setSharedStart} onEnd={setSharedEnd}
                                            />
                                            {sharedStart && sharedEnd && sharedStart < sharedEnd && (
                                                <p className="text-xs text-simconnect-green font-semibold mt-1.5">{to12h(sharedStart)} – {to12h(sharedEnd)}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedDays.map(day => (
                                                <div key={day} className="p-3 border-2 border-gray-200 rounded-lg">
                                                    <p className="text-xs font-bold text-gray-600 uppercase mb-2">{day}</p>
                                                    <TimeRange
                                                        startVal={perDayTimes[day]?.start ?? ""}
                                                        endVal={perDayTimes[day]?.end ?? ""}
                                                        onStart={val => setDayTime(day, "start", val)}
                                                        onEnd={val => setDayTime(day, "end", val)}
                                                    />
                                                    {perDayTimes[day]?.start && perDayTimes[day]?.end && perDayTimes[day].start < perDayTimes[day].end && (
                                                        <p className="text-xs text-simconnect-green font-semibold mt-1.5">{to12h(perDayTimes[day].start)} – {to12h(perDayTimes[day].end)}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button disabled={isSubmitting} type="submit"
                                className="w-full mt-4 py-4 bg-simconnect-button border-2 border-gray-900 text-gray-900 font-extrabold uppercase rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm disabled:opacity-50">
                                {isSubmitting ? "Enrolling..." : "Complete Enrollment"}
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: Currently Enrolled */}
                    <div className="bg-white border-2 border-gray-900 rounded-xl p-8 shadow-sm h-fit">
                        <h2 className="text-xl font-extrabold text-gray-900 mb-6 uppercase border-b-2 border-gray-200 pb-2">Currently Enrolled</h2>
                        <div className="space-y-4">
                            {studentData.modules.length === 0 ? (
                                <p className="text-gray-500 font-medium">You have no enrolled classes.</p>
                            ) : (
                                studentData.modules.map((mod, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                                        <div>
                                            <h3 className="font-extrabold text-gray-900 text-lg">{mod.code}</h3>
                                            <p className="text-xs font-bold text-gray-600 uppercase">{mod.title}</p>
                                        </div>
                                        <button onClick={() => handleDrop(mod.code)}
                                            className="px-4 py-2 bg-red-50 text-red-600 border-2 border-red-200 font-bold text-xs uppercase rounded-md hover:bg-red-100 hover:border-red-600 transition-all cursor-pointer">
                                            Drop
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
