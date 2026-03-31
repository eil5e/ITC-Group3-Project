"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function to12h(timeStr) {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "pm" : "am";
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}${period}`;
}

function to24h(str) {
    // converts "01:30pm" → "13:30"
    if (!str) return "";
    const match = str.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
    if (!match) return "";
    let h = parseInt(match[1]);
    const m = match[2];
    const period = match[3].toLowerCase();
    if (period === "pm" && h < 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m}`;
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

export default function ModulesPage() {
    const [user, setUser] = useState(null);
    // const modules = studentData.modules;
    // const schedule = studentData.schedule;
    const [editing, setEditing] = useState(null); // { mod, sched }
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Edit form state
    const [title, setTitle] = useState("");
    const [lecturer, setLecturer] = useState("");
    const [credits, setCredits] = useState("");
    const [location, setLocation] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sameTime, setSameTime] = useState(true);
    const [sharedStart, setSharedStart] = useState("");
    const [sharedEnd, setSharedEnd] = useState("");
    const [perDayTimes, setPerDayTimes] = useState({});

    useEffect(() => {
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    if (!user) {
        return (
            <div className="flex min-h-screen bg-simconnect-bg">
                <Sidebar />
                <main className="flex-1 p-8 flex items-center justify-center">
                    <p className="font-bold text-gray-500 animate-pulse">Loading Modules...</p>
                </main>
            </div>
        );
    }

    const modules = user.modules || [];
    const schedule = user.schedule || [];
    const totalModules = modules.length;
    const totalCredits = modules.reduce((sum, mod) => sum + mod.credits, 0);
    const averageCredits = totalModules ? (totalCredits / totalModules).toFixed(1) : "0";

    function openEdit(mod) {
        const sched = schedule.find(s => s.code === mod.code);
        setEditing({ mod, sched });
        setTitle(mod.title);
        setLecturer(mod.lecturer);
        setCredits(String(mod.credits));
        setLocation(sched?.location ?? "");
        setSelectedDays(sched?.days ?? []);
        setStartDate(sched?.startDate ?? "");
        setEndDate(sched?.endDate ?? "");
        setErrorMsg("");

        if (sched?.dayTimes) {
            setSameTime(false);
            const converted = {};
            for (const [day, timeStr] of Object.entries(sched.dayTimes)) {
                const [s, e] = timeStr.split(" - ").map(to24h);
                converted[day] = { start: s, end: e };
            }
            setPerDayTimes(converted);
            setSharedStart("");
            setSharedEnd("");
        } else {
            setSameTime(true);
            const parts = sched?.time?.split(" - ") ?? [];
            setSharedStart(to24h(parts[0] ?? ""));
            setSharedEnd(to24h(parts[1] ?? ""));
            setPerDayTimes({});
        }
    }

    function closeEdit() {
        setEditing(null);
        setErrorMsg("");
    }

    function toggleDay(day) {
        setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    }

    function setDayTime(day, field, val) {
        setPerDayTimes(prev => ({ ...prev, [day]: { ...prev[day], [field]: val } }));
    }

    async function handleSave() {
        if (!title.trim() || !lecturer.trim() || !credits) { setErrorMsg("Please fill all fields."); return; }
        if (selectedDays.length === 0) { setErrorMsg("Select at least one day."); return; }
        if (startDate && endDate && startDate > endDate) { setErrorMsg("End date must be after start date."); return; }

        let timeFormatted = "";
        let dayTimesFormatted = null;

        if (sameTime) {
            if (!sharedStart || !sharedEnd) { setErrorMsg("Please set start and end times."); return; }
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
            timeFormatted = dayTimesFormatted[selectedDays[0]];
        }

        setIsSaving(true);
         try {
            const response = await fetch("/api/enroll", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: user.username, // 🟢 Pass username to backend
                    code: editing.mod.code,
                    title, lecturer, credits: Number(credits),
                    location,
                    days: selectedDays,
                    time: timeFormatted,
                    dayTimes: dayTimesFormatted,
                    startDate: startDate || null,
                    endDate: endDate || null,
                }),
            });
            if (response.ok) {
                const updatedUser = {...user};
                window.location.reload();
            } else {
            setErrorMsg("Failed to save changes. Please try again.");
            }
        } catch (error) {
            setErrorMsg("An error occurred while saving changes. Please try again.");
        }
        setIsSaving(false);

        setErrorMsg("");

        const response = await fetch("/api/enroll", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: editing.mod.code,
                title, lecturer, credits,
                location,
                days: selectedDays,
                time: timeFormatted,
                dayTimes: dayTimesFormatted,
                startDate: startDate || null,
                endDate: endDate || null,
            }),
        });
    }

    const inputClass = "w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-gray-900 outline-none font-medium placeholder:text-gray-500 text-simconnect-green text-sm";

    return (
        <div className="flex min-h-screen bg-simconnect-bg relative">
            <Sidebar />

            <main className="flex-1 p-8 md:p-12 h-screen overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10 pb-4 border-b-2 border-gray-900">
                    <div>
                        <div className="flex items-center space-x-3">
                            <span className="text-3xl">📚</span>
                            <h1 className="text-3xl font-extrabold uppercase text-gray-900">MY MODULES</h1>
                        </div>
                        <p className="text-sm font-bold text-gray-600 mt-2 uppercase tracking-wider">Your enrolled courses for this semester</p>
                    </div>
                    <Link href="/enrollment"
                        className="px-8 py-4 text-lg font-black uppercase rounded-xl border-2 border-gray-900 bg-simconnect-button text-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:translate-y-1 hover:shadow-none transition-all">
                        + Module
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {[
                        { label: "Total Modules", value: totalModules, sub: "Active this semester", icon: "📖" },
                        { label: "Total Credits", value: totalCredits, sub: "Credit hours", icon: "🎖️" },
                        { label: "Average Credits", value: averageCredits, sub: "Per module", icon: "⏱️" },
                    ].map(s => (
                        <div key={s.label} className="bg-white border-2 border-gray-900 rounded-lg p-6 flex flex-col shadow-sm">
                            <div className="flex justify-between items-center text-gray-800 text-xs font-bold uppercase mb-4">
                                <span>{s.label}</span><span className="text-lg">{s.icon}</span>
                            </div>
                            <span className="text-4xl font-extrabold text-gray-900 mb-1">{s.value}</span>
                            <span className="text-xs font-medium text-gray-500 uppercase">{s.sub}</span>
                        </div>
                    ))}
                </div>

                {/* Module Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
                    {modules.map((mod) => {
                        const sched = schedule.find(s => s.code === mod.code);
                        return (
                            <div key={mod.code} className="bg-white border-2 border-gray-900 rounded-lg p-6 flex flex-col hover:shadow-md transition-shadow">

                                {/* Title row */}
                                <div className="flex justify-between items-start mb-5">
                                    <div>
                                        <h3 className="text-2xl font-extrabold text-gray-900 tracking-wide mb-1">{mod.code}</h3>
                                        <p className="text-gray-700 text-sm font-bold uppercase">{mod.title}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(mod)}
                                            className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
                                            title="Edit module">
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <div className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-base font-bold ${mod.theme}`}>
                                            {(mod.code.split("-")[1] ?? mod.code).substring(0, 1)}
                                        </div>
                                    </div>
                                </div>

                                {/* Lecturer */}
                                <div className="bg-simconnect-bg border-2 border-gray-200 rounded-lg p-3 flex items-center mb-4">
                                    <div className="w-9 h-9 rounded-full bg-white border-2 border-gray-900 flex items-center justify-center mr-3 text-base">👤</div>
                                    <div>
                                        <p className="text-sm font-extrabold text-gray-900">{mod.lecturer}</p>
                                        <p className="text-xs font-bold text-gray-500 uppercase">Lecturer</p>
                                    </div>
                                </div>

                                {/* Schedule info */}
                                {sched ? (
                                    <div className="border-2 border-gray-100 rounded-lg p-3 mb-4 space-y-2.5">
                                        <div className="flex items-start gap-2">
                                            <span className="text-sm mt-0.5">📅</span>
                                            <div className="flex-1">
                                                {sched.dayTimes ? (
                                                    <div className="space-y-1">
                                                        {sched.days.map(day => (
                                                            <div key={day} className="flex justify-between text-xs">
                                                                <span className="font-bold text-gray-700">{day}</span>
                                                                <span className="font-semibold text-gray-500">{sched.dayTimes[day]}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-700">{sched.days.join(", ")}</p>
                                                        <p className="text-xs font-semibold text-gray-500 mt-0.5">{sched.time}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {(sched.startDate || sched.endDate) && (
                                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                                <span className="text-sm">🗓️</span>
                                                <p className="text-xs font-semibold text-gray-500">
                                                    {formatDate(sched.startDate)} → {formatDate(sched.endDate)}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                            <span className="text-sm">📍</span>
                                            <p className="text-xs font-semibold text-gray-500">{sched.location}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 mb-4 text-xs text-gray-400 font-medium text-center">
                                        No schedule info available
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="mt-auto flex items-center justify-between pt-3 border-t-2 border-gray-100">
                                    <div className="flex items-center text-gray-900 text-sm font-bold">
                                        <span className="mr-2">🎖️</span> {mod.credits} CREDITS
                                    </div>
                                    <div className="text-xs font-bold text-gray-500 uppercase">${mod.fee?.toLocaleString() ?? "—"}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closeEdit}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border-2 border-gray-900"
                        onClick={e => e.stopPropagation()}>

                        {/* Modal header */}
                        <div className="flex items-center justify-between p-6 border-b-2 border-gray-900">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 uppercase">Edit Module</h2>
                                <p className="text-xs font-bold text-gray-500 mt-0.5">{editing.mod.code}</p>
                            </div>
                            <button onClick={closeEdit} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-500 font-bold text-lg">✕</button>
                        </div>

                        {/* Modal body */}
                        <div className="p-6 space-y-4">
                            {errorMsg && (
                                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-md">⚠️ {errorMsg}</div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Course Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Lecturer</label>
                                    <input type="text" value={lecturer} onChange={e => setLecturer(e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Credits</label>
                                    <input type="number" value={credits} onChange={e => setCredits(e.target.value)} className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Location</label>
                                <input type="text" value={location} onChange={e => setLocation(e.target.value)} className={inputClass} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Start Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                        className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-gray-900 outline-none font-medium text-simconnect-green text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">End Date</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                        className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-gray-900 outline-none font-medium text-simconnect-green text-sm" />
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
                                            }`}>
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
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-bold text-gray-700 uppercase">Time</label>
                                        <div className="flex gap-2">
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
                                            <TimeRange startVal={sharedStart} endVal={sharedEnd} onStart={setSharedStart} onEnd={setSharedEnd} />
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
                        </div>

                        {/* Modal footer */}
                        <div className="flex gap-3 p-6 border-t-2 border-gray-100">
                            <button onClick={closeEdit}
                                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold text-sm uppercase rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="flex-1 py-3 bg-simconnect-green border-2 border-gray-900 text-white font-bold text-sm uppercase rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
