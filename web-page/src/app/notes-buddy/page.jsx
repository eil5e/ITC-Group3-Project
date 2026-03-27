"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import studentData from "@/data/studentInfo.json";
import ReactMarkdown from "react-markdown";

const initialNotes = [
    { id: 1, title: "Lecture 1: Neural Networks", moduleCode: "CSCI-213", type: "TXT", date: "March 20, 2026", size: "14 KB" }
];

export default function NotesBuddyPage() {
    const [notes, setNotes] = useState(initialNotes);
    const [selectedModule, setSelectedModule] = useState("All");
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const [isUploadView, setIsUploadView] = useState(false);
    const [uploadModule, setUploadModule] = useState(studentData.modules[0]?.code || "");
    const [uploadFile, setUploadFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiSummary, setAiSummary] = useState("");

    const enrolledModules = studentData.modules;
    const filteredNotes = selectedModule === "All" ? notes : notes.filter(note => note.moduleCode === selectedModule);

    const toggleDropdown = (e, id) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const handleDownloadNote = (e, note) => {
        e.stopPropagation();
        const fileContent = `Module: ${note.moduleCode}\nTitle: ${note.title}\n\n${note.summary || '[No summary available]'}`;
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${note.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setOpenDropdownId(null); 
    };

    const handleDeleteNote = (e, id) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this note?")) {
            setNotes(notes.filter(n => n.id !== id));
        }
        setOpenDropdownId(null);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadFile(file);
        setIsProcessing(true);
        setAiSummary("");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("moduleCode", uploadModule);

            const response = await fetch("/api/summarize", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setAiSummary(data.summary);
            } else {
                alert(data.error || "Failed to generate summary. Please check your API key.");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveNote = () => {
        const ext = uploadFile.name.split('.').pop().toUpperCase();
        const newNote = {
            id: Date.now(),
            title: uploadFile.name.replace(/\.[^/.]+$/, ""),
            moduleCode: uploadModule,
            type: ext,
            date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            size: `${(uploadFile.size / 1024).toFixed(1)} KB`,
            summary: aiSummary,
        };

        setNotes([newNote, ...notes]);
        setUploadFile(null);
        setAiSummary("");
        setIsUploadView(false);
        setSelectedModule(uploadModule);
    };

    return (
        <div className="flex min-h-screen bg-simconnect-bg relative" onClick={() => setOpenDropdownId(null)}>
            <Sidebar />

            <main className="flex-1 p-8 md:p-12 h-screen overflow-y-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-900">
                    <div>
                        <div className="flex items-center space-x-3">
                            <span className="text-3xl">✍️</span>
                            <h1 className="text-3xl font-extrabold uppercase text-gray-900">NOTES-BUDDY</h1>
                        </div>
                        <p className="text-sm font-bold text-gray-600 mt-2 uppercase tracking-wider">
                            {isUploadView ? "Upload and summarize your materials" : "Organize your study materials"}
                        </p>
                    </div>
                    
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsUploadView(!isUploadView);
                        }}
                        className={`px-8 py-4 text-lg font-black uppercase rounded-xl transition-all border-2 border-gray-900 cursor-pointer shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:translate-y-1 hover:shadow-none ${
                            isUploadView ? "bg-white text-gray-900" : "bg-simconnect-button text-gray-900"
                        }`}
                    >
                        {isUploadView ? "← Back to Folders" : "+ Upload Note"}
                    </button>
                </div>

                {isUploadView ? (
                    <div className="max-w-4xl mx-auto space-y-6">
                        
                        <div className="border-2 border-dashed border-gray-400 bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center relative">
                            <div className="w-16 h-16 bg-simconnect-green text-white rounded-full flex items-center justify-center text-2xl mb-4 shadow-md">
                                📤
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Upload Your Lecture Notes</h2>
                            <p className="text-gray-500 font-medium mb-6">Upload your notes and get an AI-generated summary instantly</p>
                            
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="text-left">
                                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Select Module</label>
                                    <select 
                                        value={uploadModule} 
                                        onChange={(e) => setUploadModule(e.target.value)}
                                        className="h-12 px-4 border-2 border-gray-900 rounded-lg font-bold outline-none bg-gray-50"
                                    >
                                        {enrolledModules.map(mod => (
                                            <option key={mod.code} value={mod.code}>{mod.code}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="relative mt-5">
                                    <input 
                                        type="file" 
                                        accept=".txt,.pdf,.docx,.pptx"
                                        onChange={handleFileUpload}
                                        disabled={isProcessing}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                                    />
                                    {/* CHANGED: "Choose File" is now "Upload File" */}
                                    <button disabled={isProcessing} className="h-12 px-8 bg-gray-900 text-white font-bold uppercase rounded-lg shadow-md hover:bg-gray-800 disabled:opacity-50 pointer-events-none">
                                        {isProcessing ? "Processing AI..." : "Upload File"}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-md border border-emerald-200 mt-2">
                                ✅ Supported: <span className="font-mono">PDF · DOCX · PPTX · TXT</span>
                            </div>
                        </div>

                        {aiSummary && (
                            <div className="bg-white border-2 border-simconnect-green rounded-2xl p-8 shadow-lg animate-fade-in-up">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">✨</span>
                                        <h3 className="text-xl font-black text-gray-900 uppercase">AI Summary Ready</h3>
                                    </div>
                                    <button 
                                        onClick={handleSaveNote}
                                        className="px-6 py-2.5 bg-simconnect-green text-white font-bold uppercase rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer shadow-sm"
                                    >
                                        Save to {uploadModule}
                                    </button>
                                </div>
                                <div className="prose prose-sm max-w-none text-gray-700">
                                    <ReactMarkdown>{aiSummary}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="bg-white border-2 border-gray-900 rounded-xl p-6">
                                <h3 className="text-lg font-black text-gray-900 uppercase mb-4 border-b-2 border-gray-100 pb-2">How Notes-Buddy Works</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="w-6 h-6 rounded-full bg-simconnect-green text-white flex items-center justify-center text-xs font-bold mr-3 shrink-0">1</div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Upload Notes</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Upload PDF, DOCX, PPTX, or TXT lecture files.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-6 h-6 rounded-full bg-simconnect-green text-white flex items-center justify-center text-xs font-bold mr-3 shrink-0">2</div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">AI Processing</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Our AI reads and extracts the key academic points.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-6 h-6 rounded-full bg-simconnect-green text-white flex items-center justify-center text-xs font-bold mr-3 shrink-0">3</div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Save & Study</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Save the summary directly into your module folders.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-gray-900 rounded-xl p-6">
                                <h3 className="text-lg font-black text-gray-900 uppercase mb-4 border-b-2 border-gray-100 pb-2">Tips for Best Results</h3>
                                <ul className="space-y-3 list-disc pl-5 text-sm text-gray-700 font-medium">
                                    <li>PDF, DOCX, PPTX, and TXT are supported. Old .doc/.ppt formats are not.</li>
                                    <li>Text-based files work best — image-only PDFs cannot be read.</li>
                                    <li>Make sure you select the correct module before uploading.</li>
                                    <li>AI summaries are saved for easy reference before exams.</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                ) : (
                    <>
                        <div className="mb-10">
                            <h2 className="text-sm font-extrabold text-gray-900 uppercase mb-4 tracking-wider">Your Folders</h2>
                            <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
                                <button onClick={() => setSelectedModule("All")} className={`flex-shrink-0 w-40 p-4 border-2 rounded-xl text-left transition-all cursor-pointer ${selectedModule === "All" ? "bg-simconnect-green border-gray-900 text-white shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] scale-105" : "bg-white border-gray-300 text-gray-700 hover:border-gray-900 hover:shadow-sm"}`}>
                                    <div className="text-3xl mb-2">📁</div>
                                    <h3 className="font-extrabold text-sm uppercase">All Notes</h3>
                                    <p className={`text-xs mt-1 font-bold ${selectedModule === "All" ? "text-emerald-100" : "text-gray-500"}`}>{notes.length} Files</p>
                                </button>

                                {enrolledModules.map(mod => (
                                    <button key={mod.code} onClick={() => setSelectedModule(mod.code)} className={`flex-shrink-0 w-48 p-4 border-2 rounded-xl text-left transition-all cursor-pointer ${selectedModule === mod.code ? "bg-simconnect-green border-gray-900 text-white shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] scale-105" : "bg-white border-gray-300 text-gray-700 hover:border-gray-900 hover:shadow-sm"}`}>
                                        <div className="text-3xl mb-2">📂</div>
                                        <h3 className="font-extrabold text-sm uppercase truncate">{mod.code}</h3>
                                        <p className={`text-[10px] mt-1 font-bold uppercase truncate ${selectedModule === mod.code ? "text-emerald-100" : "text-gray-500"}`}>{mod.title}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                                    {selectedModule === "All" ? "Recent Files" : `${selectedModule} Files`}
                                </h2>
                            </div>

                            {filteredNotes.length === 0 ? (
                                <div className="w-full py-16 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50">
                                    <span className="text-4xl mb-3">📭</span>
                                    <p className="text-gray-500 font-bold uppercase">No notes found for this module.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredNotes.map(note => (
                                        <div key={note.id} className="bg-white border-2 border-gray-900 rounded-xl p-5 hover:shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] transition-all group cursor-pointer relative">
                                            
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 rounded-lg border-2 border-gray-900 flex items-center justify-center font-black text-sm bg-gray-100 text-gray-700">
                                                    {note.type}
                                                </div>
                                                
                                                <div className="relative">
                                                    <button 
                                                        onClick={(e) => toggleDropdown(e, note.id)}
                                                        className="text-gray-400 hover:text-gray-900 font-bold text-2xl px-2 pb-2 leading-none cursor-pointer"
                                                    >
                                                        ⋮
                                                    </button>

                                                    {/* CHANGED: Removed Emojis and the "Copy Title" option */}
                                                    {openDropdownId === note.id && (
                                                        <div className="absolute right-0 top-8 w-48 bg-white border-2 border-gray-900 rounded-lg shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] z-10 overflow-hidden animate-fade-in-up">
                                                            <button 
                                                                onClick={(e) => handleDownloadNote(e, note)} 
                                                                className="w-full text-left px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-100 border-b-2 border-gray-100 flex items-center cursor-pointer transition-colors"
                                                            >
                                                                Save to Computer
                                                            </button>
                                                            <button 
                                                                onClick={(e) => handleDeleteNote(e, note.id)} 
                                                                className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center cursor-pointer transition-colors"
                                                            >
                                                                Delete Note
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="font-extrabold text-gray-900 text-lg mb-1 truncate group-hover:text-simconnect-green transition-colors">{note.title}</h3>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{note.moduleCode}</p>
                                            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 text-[10px] font-bold text-gray-500 uppercase">
                                                <span>{note.date}</span>
                                                <span>{note.size}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>


        </div>
    );
}