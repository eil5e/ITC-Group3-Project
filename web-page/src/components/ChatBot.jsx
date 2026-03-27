"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatBot({ onClose }) {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi! I'm your SIMConnect assistant. How can I help you today?" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMessages = [...messages, { role: "user", content: inputValue }];
        setMessages(newMessages);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages.slice(1) }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
            } else {
                setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (prompt) => {
        setInputValue(prompt);
    };

    return (
        <div
            className="fixed bottom-24 right-8 bg-[#eef8f2] rounded-[2rem] shadow-2xl flex flex-col z-50 border-2 border-gray-900 overflow-hidden"
            style={{ width: "450px", height: "650px", maxWidth: "90vw", maxHeight: "85vh" }}
        >
            {/* Header */}
            <div className="flex-none flex justify-between items-center p-5 border-b-2 border-gray-900 bg-white">
                <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 bg-simconnect-green border-2 border-gray-900 rounded-full flex items-center justify-center text-xl shrink-0 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
                        🤖
                    </div>
                    <div>
                        <h3 className="font-extrabold text-sm text-gray-900">SIMConnect Assistant</h3>
                        <div className="flex items-center text-xs text-gray-500 font-semibold mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                            Online
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <span className="text-lg font-black text-gray-500">✕</span>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "assistant" && (
                            <div className="w-8 h-8 bg-simconnect-green border-2 border-gray-900 rounded-full shrink-0 mr-2.5 flex items-center justify-center text-sm mt-1">
                                🤖
                            </div>
                        )}
                        <div
                            className={`max-w-[80%] px-4 py-3 text-sm border-2 border-gray-900 rounded-2xl shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] ${
                                msg.role === "user"
                                    ? "bg-simconnect-green text-white rounded-br-sm"
                                    : "bg-white text-gray-900 rounded-tl-sm"
                            }`}
                        >
                            {msg.role === "assistant" ? (
                                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:font-bold prose-headings:font-bold prose-headings:text-gray-900">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="font-medium">{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}

                {/* Quick actions shown only on first message */}
                {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 pl-11">
                        <button
                            onClick={() => handleQuickAction("Can you summarize my class schedule?")}
                            className="px-3 py-1.5 bg-white border-2 border-gray-900 text-gray-900 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] cursor-pointer"
                        >
                            📅 Class Schedule
                        </button>
                        <button
                            onClick={() => handleQuickAction("What modules am I enrolled in?")}
                            className="px-3 py-1.5 bg-white border-2 border-gray-900 text-gray-900 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] cursor-pointer"
                        >
                            📚 My Modules
                        </button>
                        <button
                            onClick={() => handleQuickAction("What can you help me with?")}
                            className="px-3 py-1.5 bg-white border-2 border-gray-900 text-gray-900 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] cursor-pointer"
                        >
                            💡 Help
                        </button>
                    </div>
                )}

                {/* Typing indicator */}
                {isLoading && (
                    <div className="flex justify-start w-full">
                        <div className="w-8 h-8 bg-simconnect-green border-2 border-gray-900 rounded-full shrink-0 mr-2.5 flex items-center justify-center text-sm">
                            🤖
                        </div>
                        <div className="px-4 py-3 bg-white border-2 border-gray-900 rounded-2xl rounded-tl-sm shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] flex space-x-1.5 items-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-none p-4 bg-white border-t-2 border-gray-900">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                        placeholder={isLoading ? "Assistant is typing..." : "Ask me anything..."}
                        className="flex-1 h-11 px-4 rounded-full bg-gray-50 border-2 border-gray-900 focus:outline-none focus:bg-white text-sm font-medium text-gray-900 disabled:opacity-60 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="flex-none w-11 h-11 flex items-center justify-center bg-simconnect-green border-2 border-gray-900 text-white rounded-full shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]"
                    >
                        <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
