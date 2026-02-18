"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function TeacherAssignmentsPage() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8000/teacher/assignments", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAssignments(data);
                }
            } catch (error) {
                console.error("Failed to fetch assignments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">My Subject Assignments</h1>
                <Button className="flex items-center gap-2" onClick={() => window.location.href = '/dashboard/teacher/assignments/create'}>
                    <Plus size={16} /> Create Assignment
                </Button>
            </div>

            <Card glass className="p-0 overflow-hidden border-white/10">
                {assignments.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                        {loading ? <p>Loading...</p> : (
                            <>
                                <p>No assignments created yet.</p>
                                <p className="text-sm mt-2">Click "Create Assignment" to post homework for your classes.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {assignments.map((assignment) => (
                            <div key={assignment.pk} className="p-4 hover:bg-white/5 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg text-white">{assignment.title}</h3>
                                        <p className="text-gray-400 text-sm mt-1">{assignment.description}</p>
                                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                            <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                                            {/* We could fetch class name here if we had it, or just show ID for now */}
                                            {/* <span>Class: {assignment.class_id}</span> */}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Future: Edit/Delete buttons */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
