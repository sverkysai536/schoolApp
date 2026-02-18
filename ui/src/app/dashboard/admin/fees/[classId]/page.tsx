"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { getClassFees, updateStudentFee } from "@/utils/api";
import { useParams } from "next/navigation";

interface StudentFee {
    pk: string;
    student_id: string;
    class_id: string;
    base_amount: number;
    discount_amount: number;
    final_amount: number;
    paid_amount: number;
    status: string;
    due_date: string;
}

export default function ClassFeesPage() {
    const params = useParams();
    const classId = params.classId as string;
    const [fees, setFees] = useState<StudentFee[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit States
    const [editingFee, setEditingFee] = useState<string | null>(null);
    const [editType, setEditType] = useState<'discount' | 'payment'>('discount');
    const [editValue, setEditValue] = useState("");

    const fetchClassFees = async () => {
        try {
            const data = await getClassFees(classId);
            setFees(data);
        } catch (error) {
            console.error("Failed to fetch class fees", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (classId) {
            fetchClassFees();
        }
    }, [classId]);

    const startEdit = (fee: StudentFee, type: 'discount' | 'payment') => {
        setEditingFee(fee.pk);
        setEditType(type);
        setEditValue(type === 'discount' ? fee.discount_amount.toString() : fee.paid_amount.toString());
    };

    const handleSave = async (studentId: string) => {
        try {
            const val = parseFloat(editValue);
            if (isNaN(val) || !editingFee) return;

            await updateStudentFee({
                pk: editingFee,
                student_id: studentId,
                paid_amount: editType === 'payment' ? val : undefined,
                discount_amount: editType === 'discount' ? val : undefined
            });

            setEditingFee(null);
            fetchClassFees();
        } catch (error) {
            alert("Failed to update fee: " + error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Fees for Class {classId}</h1>
                <Link href="/dashboard/admin/fees">
                    <Button variant="ghost">Back to Fees</Button>
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-gray-300" style={{ backgroundColor: '#444' }}>
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="p-4">Student ID</th>
                            <th className="p-4">Base Fee</th>
                            <th className="p-4">Discount</th>
                            <th className="p-4">Final Fee</th>
                            <th className="p-4">Paid Amount</th>
                            <th className="p-4">Pending</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fees.map((fee) => {
                            const pending = fee.final_amount - fee.paid_amount;
                            const isEditing = editingFee === fee.pk;

                            return (
                                <tr key={fee.pk} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-4 font-mono">{fee.student_id}</td>
                                    <td className="p-4">${fee.base_amount.toLocaleString()}</td>

                                    {/* Discount Column */}
                                    <td className="p-4">
                                        {isEditing && editType === 'discount' ? (
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-20 h-8 bg-white/10 border-white/20 text-white"
                                                    autoFocus
                                                />
                                                <Button size="sm" onClick={() => handleSave(fee.student_id)}>✓</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingFee(null)}>✗</Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => startEdit(fee, 'discount')}>
                                                <span className={fee.discount_amount > 0 ? "text-green-400" : ""}>
                                                    ${fee.discount_amount.toLocaleString()}
                                                </span>
                                                <span className="opacity-0 group-hover:opacity-100 text-xs text-gray-500">✎</span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-4 font-bold text-white">${fee.final_amount.toLocaleString()}</td>

                                    {/* Paid Amount Column */}
                                    <td className="p-4">
                                        {isEditing && editType === 'payment' ? (
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-24 h-8 bg-white/10 border-white/20 text-white"
                                                    autoFocus
                                                />
                                                <Button size="sm" onClick={() => handleSave(fee.student_id)}>✓</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingFee(null)}>✗</Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => startEdit(fee, 'payment')}>
                                                <span className="text-white">
                                                    ${fee.paid_amount.toLocaleString()}
                                                </span>
                                                <span className="opacity-0 group-hover:opacity-100 text-xs text-gray-500">✎</span>
                                            </div>
                                        )}
                                    </td>

                                    {/* Pending Column */}
                                    <td className="p-4">
                                        <span className={pending > 0 ? "text-red-400 font-bold" : "text-gray-400"}>
                                            ${Math.max(0, pending).toLocaleString()}
                                        </span>
                                    </td>

                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${fee.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                            fee.status === 'overdue' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {fee.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {fees.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500">
                        No students found in this class. Add students to the class to generate fee records.
                    </div>
                )}
            </div>
        </div>
    );
}
