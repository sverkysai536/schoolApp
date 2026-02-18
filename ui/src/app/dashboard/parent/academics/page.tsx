"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { getChildAssignments, getChildGrades, getChildren } from "@/utils/api";

interface Assignment {
    pk: string;
    title: string;
    description: string;
    due_date: string;
    class_id: string;
}

interface Grade {
    pk: string;
    assignment_id: string;
    score: number;
    feedback?: string;
    graded_by: string;
}

interface Child {
    username: string;
    first_name: string;
    last_name: string;
}

export default function ParentAcademicsPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<string>("");
    const [activeTab, setActiveTab] = useState<'assignments' | 'grades'>('assignments');

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(false);

    const parentId = typeof window !== 'undefined' ? localStorage.getItem('username') || '' : '';

    // Fetch Children
    useEffect(() => {
        const fetchChildren = async () => {
            if (!parentId) return;
            try {
                const data = await getChildren(parentId);
                setChildren(data);
                if (data.length > 0) setSelectedChild(data[0].username);
            } catch (error) {
                console.error("Failed to fetch children", error);
            }
        };
        fetchChildren();
    }, [parentId]);

    // Fetch Data for Selected Child
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedChild || !parentId) return;
            setLoading(true);
            try {
                // Fetch both for simplicity
                const [asmData, grData] = await Promise.all([
                    getChildAssignments(parentId, selectedChild),
                    getChildGrades(parentId, selectedChild)
                ]);

                console.log("Assignments:", asmData); // Debug
                console.log("Grades:", grData);       // Debug

                setAssignments(asmData);
                setGrades(grData);
            } catch (error) {
                console.error("Failed to fetch academic data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedChild, parentId]);

    // Helper to get assignment title for a grade
    const getAssignmentTitle = (grade: Grade) => {
        // Find assignment by PK
        // Ensure both grade.assignment_id and a.pk are compared as strings
        const asm = assignments.find(a => String(a.pk) === String(grade.assignment_id));
        return asm ? asm.title : `Unknown (${grade.assignment_id})`;
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Academics</h1>

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

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('assignments')}
                    className={`pb-2 px-4 ${activeTab === 'assignments' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}
                >
                    Assignments
                </button>
                <button
                    onClick={() => setActiveTab('grades')}
                    className={`pb-2 px-4 ${activeTab === 'grades' ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}
                >
                    Grades
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {loading && <p className="text-gray-400">Loading...</p>}

                {!loading && activeTab === 'assignments' && (
                    <>
                        {assignments.length === 0 ? (
                            <p className="text-gray-500">No assignments found.</p>
                        ) : (
                            assignments.map(asm => (
                                <Card key={asm.pk} className="border-white/10" glass>
                                    <CardHeader>
                                        <div className="flex justify-between">
                                            <CardTitle className="text-lg text-white">{asm.title}</CardTitle>
                                            <span className="text-sm text-gray-400">Due: {new Date(asm.due_date).toLocaleDateString()}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-300">{asm.description}</p>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </>
                )}

                {!loading && activeTab === 'grades' && (
                    <>
                        {grades.length === 0 ? (
                            <p className="text-gray-500">No grades posted yet.</p>
                        ) : (
                            <Card className="border-white/10" glass>
                                <CardContent className="p-0">
                                    <table className="w-full text-left text-gray-300">
                                        <thead className="bg-white/5">
                                            <tr>
                                                <th className="p-4">Assignment</th>
                                                <th className="p-4">Score</th>
                                                <th className="p-4">Feedback</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {grades.map(grade => (
                                                <tr key={grade.pk} className="border-t border-white/5">
                                                    <td className="p-4 text-white font-medium">{getAssignmentTitle(grade)}</td>
                                                    <td className="p-4 text-green-400 font-bold">{grade.score}</td>
                                                    <td className="p-4 text-gray-400 italic">"{grade.feedback || 'No feedback'}"</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
