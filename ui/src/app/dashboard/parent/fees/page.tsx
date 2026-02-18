"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { getChildFees } from "@/utils/api";
import { getChildren } from "@/utils/api"; // Need to ensure this exists or add it

interface Fee {
    pk: string;
    class_id: string;
    base_amount: number;
    discount_amount: number;
    final_amount: number;
    paid_amount: number;
    status: string;
    due_date: string;
}

interface Child {
    username: string; // Used as ID
    first_name: string;
    last_name: string;
}

export default function ParentFeesPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<string>("");
    const [fees, setFees] = useState<Fee[]>([]);
    const [loading, setLoading] = useState(true);

    const parentId = typeof window !== 'undefined' ? localStorage.getItem('username') || '' : ''; // Basic auth check

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                // We'll reuse the endpoint from parent.py but we need a util fn
                // Temporarily using raw fetch or assuming getChildren works
                const res = await fetch(`http://localhost:8000/parent/children?parent_id=${parentId}`);
                if (res.ok) {
                    const data = await res.json();
                    setChildren(data);
                    if (data.length > 0) setSelectedChild(data[0].username);
                }
            } catch (error) {
                console.error("Failed to fetch children", error);
            }
        };
        if (parentId) fetchChildren();
    }, [parentId]);

    useEffect(() => {
        const fetchFees = async () => {
            if (!selectedChild || !parentId) return;
            setLoading(true);
            try {
                const data = await getChildFees(parentId, selectedChild);
                setFees(data);
            } catch (error) {
                console.error("Failed to fetch fees", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFees();
    }, [selectedChild, parentId]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Fee Status</h1>

            {/* Child Selector */}
            {children.length > 1 && (
                <div className="mb-6 flex gap-4">
                    {children.map(child => (
                        <button
                            key={child.username}
                            onClick={() => setSelectedChild(child.username)}
                            className={`px-4 py-2 rounded-lg border transition-all ${selectedChild === child.username
                                ? 'bg-white/20 border-white text-white'
                                : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'
                                }`}
                        >
                            {child.first_name} {child.last_name}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid gap-6">
                {fees.map(fee => {
                    const pending = fee.final_amount - fee.paid_amount;
                    return (
                        <Card key={fee.pk} className="border-white/10" style={{ backgroundColor: '#444' }}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-white text-xl">Class {fee.class_id}</CardTitle>
                                        <p className="text-sm text-gray-400 mt-1">Due Date: {new Date(fee.due_date).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${fee.status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                        fee.status === 'overdue' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                        }`}>
                                        {fee.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-sm text-gray-400">Total Fee</p>
                                        <p className="text-2xl font-bold text-white mt-1">${fee.final_amount.toLocaleString()}</p>
                                        {fee.discount_amount > 0 && <p className="text-xs text-green-400 mt-1">Includes ${fee.discount_amount} discount</p>}
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-sm text-gray-400">Paid Amount</p>
                                        <p className="text-2xl font-bold text-green-400 mt-1">${fee.paid_amount.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-sm text-gray-400">Pending Due</p>
                                        <p className={`text-2xl font-bold mt-1 ${pending > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                            ${Math.max(0, pending).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {fees.length === 0 && !loading && (
                    <p className="text-gray-400">No fee records found for this student.</p>
                )}
            </div>
        </div>
    );
}
