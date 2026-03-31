"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

const mandatoryFees = [
    { id: "fee-tech", item: "Technology & Lab Fee", amount: 250.00, status: "Unpaid" },
    { id: "fee-lib", item: "Library Access Fee", amount: 50.00, status: "Paid" },
    { id: "fee-union", item: "Student Union Fee", amount: 35.00, status: "Paid" },
];

const allTransactions = [
    { id: "TXN-8821", date: "Jan 15, 2026", description: "Library Access & Student Union Fee", amount: 85.00, method: "Visa ending in 4242" },
    { id: "TXN-8750", date: "Aug 10, 2025", description: "Tuition Fee (Previous Semester)", amount: 4500.00, method: "Bank Transfer" },
    { id: "TXN-8701", date: "Aug 01, 2025", description: "Orientation Fee", amount: 150.00, method: "Mastercard ending in 1122" },
    { id: "TXN-8640", date: "Jul 15, 2025", description: "Housing Deposit", amount: 500.00, method: "Visa ending in 4242" },
    { id: "TXN-8500", date: "Jan 10, 2025", description: "Tuition Fee (Semester 1 2025)", amount: 4350.00, method: "Bank Transfer" },
];

export default function FinancesPage() {
    const [user, setUser] = useState(null);
    const [showAllTransactions, setShowAllTransactions] = useState(false);

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
                <main className="flex-1 p-8 md:p-12 h-screen flex items-center justify-center">
                    <p className="font-bold text-gray-500 animate-pulse text-lg">
                        LOADING FINANCIAL RECORDS...
                    </p>
                </main>
            </div>
        );
    }

    const userModules = user.modules || [];
    const name = user.profile?.name || "Student";

    const dynamicTuitionFees = userModules.map(mod => ({
        id: `tuition-${mod.code}`,
        item: `${mod.code} Tuition`,
        amount: mod.fee || 1200.00, 
        status: "Unpaid" 
    }));

    const fullFeeBreakdown = [...dynamicTuitionFees, ...mandatoryFees];

    const totalDue = fullFeeBreakdown
        .filter(fee => fee.status === "Unpaid")
        .reduce((sum, fee) => sum + fee.amount, 0);

    const handleDownloadInvoice = () => {
        let invoiceText = `=======================================\n`;
        invoiceText += `          OFFICIAL INVOICE\n`;
        invoiceText += `             SIMConnect\n`;
        invoiceText += `=======================================\n\n`;
        invoiceText += `Date: ${new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
        invoiceText += `Student: ${name || 'Student'}\n\n`;
        invoiceText += `--- CURRENT SEMESTER CHARGES ---\n`;
        
        fullFeeBreakdown.forEach(fee => {
            invoiceText += `${fee.item.padEnd(35)} $${fee.amount.toFixed(2)}\n`; 
        });
        
        invoiceText += `---------------------------------------\n`;
        invoiceText += `Subtotal:                           $${fullFeeBreakdown.reduce((sum, fee) => sum + fee.amount, 0).toFixed(2)}\n`;
        invoiceText += `=======================================\n`;
        invoiceText += `TOTAL BALANCE DUE:                  $${totalDue.toFixed(2)}\n`;
        invoiceText += `=======================================\n`;
        invoiceText += `\nPlease pay the outstanding balance by April 15, 2026 to avoid late fees.\n`;

        const blob = new Blob([invoiceText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SIMConnect_Invoice_${new Date().getTime()}.txt`;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const visibleTransactions = showAllTransactions ? allTransactions : allTransactions.slice(0, 3);

    return (
        <div className="flex min-h-screen bg-simconnect-bg relative">
            <Sidebar />

            <main className="flex-1 p-8 md:p-12 h-screen overflow-y-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-900">
                    <div>
                        <div className="flex items-center space-x-3">
                            <span className="text-3xl">💳</span>
                            <h1 className="text-3xl font-extrabold uppercase text-gray-900">FINANCES</h1>
                        </div>
                        <p className="text-sm font-bold text-gray-600 mt-2 uppercase tracking-wider">
                            Manage your tuition, fees, and payments
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => alert("Redirecting to secure payment gateway...")}
                        className="px-8 py-4 text-lg font-black uppercase rounded-xl transition-all border-2 border-gray-900 cursor-pointer shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:translate-y-1 hover:shadow-none bg-simconnect-button text-gray-900"
                    >
                        Make a Payment
                    </button>
                </div>

                {/* Top Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-white border-2 border-gray-900 rounded-xl p-6 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Amount Due</p>
                        <h2 className="text-4xl font-black text-gray-900">${totalDue.toFixed(2)}</h2>
                        <div className="mt-4 flex items-center text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-md border border-red-200 w-fit">
                            ⚠️ Due by April 15, 2026
                        </div>
                    </div>

                    {/* CHANGED: This entire dashed box is now one big, satisfying button! */}
                    <button 
                        onClick={handleDownloadInvoice}
                        className="w-full h-full bg-white border-2 border-gray-900 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center border-dashed group hover:border-simconnect-green hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl mb-3 border-2 border-gray-900 group-hover:bg-simconnect-green group-hover:text-white group-hover:border-simconnect-green transition-colors">
                            📄
                        </div>
                        <span className="text-sm font-extrabold text-gray-900 uppercase group-hover:text-simconnect-green transition-colors">
                            Download Official Invoice
                        </span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* LEFT SIDE: Fee Breakdown */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border-2 border-gray-900 rounded-xl p-8 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
                            <h2 className="text-xl font-extrabold text-gray-900 mb-6 uppercase border-b-2 border-gray-100 pb-4">Current Semester Breakdown</h2>
                            
                            <div className="space-y-4">
                                {fullFeeBreakdown.map((fee) => (
                                    <div key={fee.id} className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg hover:border-gray-900 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-3 h-3 rounded-full ${fee.status === 'Paid' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                            <div>
                                                <p className="font-extrabold text-gray-900 text-sm uppercase">{fee.item}</p>
                                                <p className="text-xs font-bold text-gray-500 uppercase mt-0.5">{fee.status}</p>
                                            </div>
                                        </div>
                                        <span className="font-black text-lg text-gray-900">
                                            ${fee.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 pt-6 border-t-2 border-gray-900 flex justify-between items-center">
                                <span className="font-extrabold text-gray-900 uppercase">Total Balance</span>
                                <span className="font-black text-2xl text-gray-900">${totalDue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Transaction History */}
                    <div className="space-y-6">
                        <div className="bg-white border-2 border-gray-900 rounded-xl p-8 shadow-sm transition-all">
                            <h2 className="text-xl font-extrabold text-gray-900 mb-6 uppercase border-b-2 border-gray-100 pb-4">Recent Transactions</h2>
                            
                            <div className="space-y-6 transition-all duration-300">
                                {visibleTransactions.map((txn) => (
                                    <div key={txn.id} className="flex flex-col border-b border-gray-100 last:border-0 pb-4 last:pb-0 animate-fade-in-up">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-extrabold text-gray-900 text-sm truncate pr-4">{txn.description}</span>
                                            <span className="font-black text-emerald-700 whitespace-nowrap">${txn.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
                                            <span>{txn.date} • {txn.id}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Paid via {txn.method}</p>
                                    </div>
                                ))}
                            </div>

                            {allTransactions.length > 3 && (
                                <button 
                                    onClick={() => setShowAllTransactions(!showAllTransactions)}
                                    className="w-full mt-6 py-3 border-2 border-gray-900 text-gray-900 font-extrabold uppercase rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-xs"
                                >
                                    {showAllTransactions ? "Show Less" : "View All History"}
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </main>


        </div>
    );
}