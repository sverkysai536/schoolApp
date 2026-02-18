"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { getFeeStructures, createOrUpdateFeeStructure } from "@/utils/api";
import { useRouter } from "next/navigation";

interface FeeStructure {
    pk: string;
    class_id: string;
    amount: number;
    academic_year: string;
    due_date: string;
}

export default function FeesPage() {
    const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        class_id: "",
        amount: "",
        academic_year: "2025-2026",
        due_date: ""
    });

    const router = useRouter();

    const fetchFees = async () => {
        try {
            const data = await getFeeStructures();
            setFeeStructures(data);
        } catch (error) {
            console.error("Failed to fetch fees", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createOrUpdateFeeStructure({
                class_id: formData.class_id,
                amount: parseFloat(formData.amount),
                academic_year: formData.academic_year,
                due_date: new Date(formData.due_date).toISOString()
            });
            alert("Fee structure saved successfully");
            setShowForm(false);
            setFormData({
                class_id: "",
                amount: "",
                academic_year: "2025-2026",
                due_date: ""
            });
            fetchFees();
        } catch (error: any) {
            alert("Error saving fee structure: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Class Fees</h1>
                <div className="space-x-4">
                    <Link href="/dashboard/admin">
                        <Button variant="ghost">Back to Dashboard</Button>
                    </Link>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Cancel" : "Set New Class Fee"}
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card className="mb-8 border-white/10" glass>
                    <CardHeader>
                        <CardTitle className="text-white">Set Default Fee for Class</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    name="class_id"
                                    placeholder="Class ID (e.g. 10A)"
                                    value={formData.class_id}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                />
                                <Input
                                    name="amount"
                                    type="number"
                                    placeholder="Fee Amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                />
                                <Input
                                    name="academic_year"
                                    placeholder="Academic Year"
                                    value={formData.academic_year}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                />
                                <Input
                                    name="due_date"
                                    type="date"
                                    placeholder="Due Date"
                                    value={formData.due_date}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                />
                            </div>
                            <Button type="submit" isLoading={loading}>
                                Save Fee Structure
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6">
                {feeStructures.length === 0 && !loading && (
                    <p className="text-gray-400">No fee structures defined yet. Create one to get started.</p>
                )}
                {feeStructures.map((fee) => (
                    <Card key={fee.pk} className="p-6 border-white/10" glass>
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white">Class: {fee.class_id}</h3>
                                <p className="text-gray-300">Amount: ${fee.amount.toLocaleString()}</p>
                                <p className="text-sm text-gray-400">Due: {new Date(fee.due_date).toLocaleDateString()} | Year: {fee.academic_year}</p>
                            </div>
                            <Link href={`/dashboard/admin/fees/${fee.class_id}`}>
                                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/10">
                                    Manage Student Discounts
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
