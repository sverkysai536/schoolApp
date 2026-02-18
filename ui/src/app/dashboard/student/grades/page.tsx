"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { getStudentGrades, getStudentAssignments } from "@/utils/api";

interface Grade {
    pk: string;
    assignment_id: string;
    score: number;
    feedback?: string;
    graded_by: string;
}

interface Assignment {
    pk: string;
    title: string;
}

export default function StudentGradesPage() {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [assignments, setAssignments] = useState<Record<string, string>>({}); // ID -> Title map
    const [loading, setLoading] = useState(true);
    const studentId = typeof window !== 'undefined' ? localStorage.getItem('username') || '' : '';

    useEffect(() => {
        const fetchData = async () => {
            if (!studentId) return;
            try {
                // Fetch grades and assignments to map titles (or fetch specific assignments per grade if backend supported it, but batch is better)
                // For optimal performance, backend should include title, but we'll fetch assignments separately for now or rely on what we have.
                // Re-using student assignments endpoint to get titles.
                const [gData, aData] = await Promise.all([
                    getStudentGrades(studentId),
                    getStudentAssignments(studentId)
                ]);

                setGrades(gData);

                const aMap: Record<string, string> = {};
                aData.forEach((a: Assignment) => aMap[a.pk] = a.title);
                setAssignments(aMap);

            } catch (error) {
                console.error("Failed to fetch grades", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [studentId]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Grades</h1>
            <div className="space-y-4">
                {grades.map(grade => (
                    <Card key={grade.pk} className="border-white/10" glass>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-white">
                                    {assignments[grade.assignment_id] || "Assignment"}
                                </CardTitle>
                                <span className={`text-xl font-bold ${grade.score >= 90 ? 'text-green-400' : 'text-white'}`}>
                                    {grade.score}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-300">
                                <strong>Feedback:</strong> {grade.feedback || "No feedback"}
                            </p>
                        </CardContent>
                    </Card>
                ))}

                {grades.length === 0 && !loading && (
                    <p className="text-gray-400">No grades found.</p>
                )}
            </div>
        </div>
    );
}
