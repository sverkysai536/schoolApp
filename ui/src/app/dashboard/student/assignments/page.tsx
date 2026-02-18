"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { getStudentAssignments } from "@/utils/api";

interface Assignment {
    pk: string;
    title: string;
    description: string;
    due_date: string;
    class_id: string;
}

export default function StudentAssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const studentId = typeof window !== 'undefined' ? localStorage.getItem('username') || '' : '';

    useEffect(() => {
        const fetchData = async () => {
            if (!studentId) return;
            try {
                const data = await getStudentAssignments(studentId);
                setAssignments(data);
            } catch (error) {
                console.error("Failed to fetch assignments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [studentId]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Assignments</h1>
            <div className="grid gap-6">
                {assignments.map(asm => (
                    <Card key={asm.pk} className="border-white/10" glass>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-white">{asm.title}</CardTitle>
                                <span className="text-sm text-yellow-400">
                                    Due: {new Date(asm.due_date).toLocaleDateString()}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-300 whitespace-pre-wrap">{asm.description}</p>
                        </CardContent>
                    </Card>
                ))}

                {assignments.length === 0 && !loading && (
                    <p className="text-gray-400">No upcoming assignments.</p>
                )}
            </div>
        </div>
    );
}
