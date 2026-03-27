"use client";

import { useState, useEffect } from "react";

const STATUSES = [
    { key: "not_started", label: "Not Started", color: "bg-gray-100 text-gray-600" },
    { key: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-700" },
    { key: "done",        label: "Done",        color: "bg-emerald-100 text-emerald-700" },
];

function nextStatus(current) {
    const idx = STATUSES.findIndex(s => s.key === current);
    return STATUSES[(idx + 1) % STATUSES.length].key;
}

function getStatusStyle(key) {
    return STATUSES.find(s => s.key === key) ?? STATUSES[0];
}

function formatDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr + "T00:00:00") < today;
}

export default function ToDoList() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [newDueDate, setNewDueDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showDateInput, setShowDateInput] = useState(false);

    useEffect(() => {
        fetch("/api/todos")
            .then(res => res.json())
            .then(data => setTasks(data))
            .catch(err => console.error("Failed to load tasks", err));
    }, []);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setIsLoading(true);
        try {
            const response = await fetch("/api/todos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTask, dueDate: newDueDate || null }),
            });
            if (response.ok) {
                const added = await response.json();
                setTasks(prev => [added, ...prev]);
                setNewTask("");
                setNewDueDate("");
                setShowDateInput(false);
            }
        } catch (error) {
            console.error("Error adding task:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCycleStatus = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const newStatus = nextStatus(task.status);
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        try {
            await fetch("/api/todos", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus }),
            });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDelete = async (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        try {
            await fetch("/api/todos", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleClearDone = async () => {
        const done = tasks.filter(t => t.status === "done");
        setTasks(prev => prev.filter(t => t.status !== "done"));
        await Promise.all(done.map(t =>
            fetch("/api/todos", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: t.id }),
            })
        ));
    };

    const active = tasks.filter(t => t.status !== "done");
    const done = tasks.filter(t => t.status === "done");

    return (
        <div className="w-full h-full p-6 border-2 border-gray-900 rounded-lg bg-white flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-gray-900">
                <div className="flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <h2 className="text-xl font-extrabold uppercase text-gray-900">To-Do List</h2>
                </div>
                {tasks.length > 0 && (
                    <span className="text-xs font-bold text-gray-400 uppercase">{active.length} remaining</span>
                )}
            </div>

            {/* Tasks */}
            <ul className="grow space-y-2 mb-4 overflow-y-auto">
                {tasks.length === 0 && (
                    <p className="text-sm text-gray-400 font-medium text-center py-6">No tasks yet. You're all caught up!</p>
                )}

                {/* Active tasks */}
                {active.map(task => {
                    const s = getStatusStyle(task.status);
                    const overdue = isOverdue(task.dueDate);
                    return (
                        <li key={task.id} className="flex items-start gap-2 group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            {/* Status badge — click to cycle */}
                            <button
                                onClick={() => handleCycleStatus(task.id)}
                                className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-md text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${s.color}`}
                                title="Click to change status"
                            >
                                {s.label}
                            </button>

                            {/* Title + due date */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 wrap-break-word">{task.title}</p>
                                {task.dueDate && (
                                    <p className={`text-xs font-semibold mt-0.5 ${overdue ? "text-red-500" : "text-gray-400"}`}>
                                        {overdue ? "⚠ Overdue · " : "📅 "}{formatDate(task.dueDate)}
                                    </p>
                                )}
                            </div>

                            {/* Delete */}
                            <button
                                onClick={() => handleDelete(task.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-gray-300 hover:text-red-500 shrink-0 mt-0.5"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </li>
                    );
                })}

                {/* Done section */}
                {done.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 pt-3 pb-1">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs font-bold text-gray-400 uppercase shrink-0">Done ({done.length})</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>
                        {done.map(task => (
                            <li key={task.id} className="flex items-start gap-2 group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                <button
                                    onClick={() => handleCycleStatus(task.id)}
                                    className="shrink-0 mt-0.5 px-2 py-0.5 rounded-md text-xs font-bold cursor-pointer bg-emerald-100 text-emerald-700 whitespace-nowrap"
                                >
                                    Done
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-400 line-through wrap-break-word">{task.title}</p>
                                    {task.dueDate && (
                                        <p className="text-xs font-semibold mt-0.5 text-gray-300">📅 {formatDate(task.dueDate)}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(task.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-gray-300 hover:text-red-500 shrink-0 mt-0.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                        <button
                            onClick={handleClearDone}
                            className="w-full mt-1 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors py-1 cursor-pointer uppercase tracking-wide"
                        >
                            Clear done
                        </button>
                    </>
                )}
            </ul>

            {/* Add task form */}
            <form onSubmit={handleAddTask} className="flex flex-col gap-2 mt-auto pt-3 border-t border-gray-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        placeholder="E.g., Review Math Lecture"
                        className="flex-1 h-11 px-4 border-2 border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none text-sm placeholder:text-gray-500 text-simconnect-green"
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowDateInput(v => !v)}
                        title="Set due date"
                        className={`shrink-0 w-11 h-11 border-2 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${showDateInput ? "border-simconnect-green bg-simconnect-green text-white" : "border-gray-300 text-gray-400 hover:border-gray-900 hover:text-gray-900"}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>

                {showDateInput && (
                    <input
                        type="date"
                        value={newDueDate}
                        onChange={e => setNewDueDate(e.target.value)}
                        className="w-full h-10 px-4 border-2 border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none text-sm text-simconnect-green"
                    />
                )}

                <button
                    type="submit"
                    disabled={isLoading || !newTask.trim()}
                    className="w-full h-11 border-2 border-gray-900 bg-simconnect-button rounded-lg text-sm font-bold uppercase text-gray-900 hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
                >
                    {isLoading ? "Adding..." : "+ Add New Task"}
                </button>
            </form>
        </div>
    );
}
