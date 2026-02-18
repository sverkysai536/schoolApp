"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getTeacherAssignments, getClassStudents, getAssignmentGrades, postGrade } from "@/utils/api";

interface Assignment {
    pk: string;
    title: string;
    class_id: string;
}

interface Student {
    pk: string;
    first_name: string;
    last_name: string;
    username: string;
}

interface Grade {
    pk: string;
    student_id: string;
    assignment_id: string;
    score: number;
    feedback?: string;
}

export default function GradebookPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<string>("");

    // Derived state
    const [currentClassId, setCurrentClassId] = useState<string>("");

    const [students, setStudents] = useState<Student[]>([]);
    const [grades, setGrades] = useState<Record<string, Grade>>({}); // Map student_id -> Grade
    const [loadingInfo, setLoadingInfo] = useState(false);

    // Form states for current editing
    const [scores, setScores] = useState<Record<string, string>>({}); // student_id -> score input
    const [feedbacks, setFeedbacks] = useState<Record<string, string>>({}); // student_id -> feedback input

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const data = await getTeacherAssignments();
                setAssignments(data);
            } catch (error) {
                console.error("Failed to fetch assignments", error);
            }
        };
        fetchAssignments();
    }, []);

    useEffect(() => {
        if (!selectedAssignment) return;

        const loadData = async () => {
            setLoadingInfo(true);
            try {
                // 1. Find assignment to get class_id
                const asm = assignments.find(a => a.pk === selectedAssignment);
                if (!asm) return;
                setCurrentClassId(asm.class_id);

                // 2. Fetch Students
                const stData = await getClassStudents(asm.class_id);
                setStudents(stData);

                // 3. Fetch Existing Grades
                const gData = await getAssignmentGrades(selectedAssignment);
                const gMap: Record<string, Grade> = {};
                const sMap: Record<string, string> = {}; // Init scores
                const fMap: Record<string, string> = {}; // Init feedbacks

                gData.forEach((g: Grade) => {
                    gMap[g.student_id] = g;
                    sMap[g.student_id] = g.score.toString();
                    fMap[g.student_id] = g.feedback || "";
                });

                setGrades(gMap);
                setScores(sMap);
                setFeedbacks(fMap);

            } catch (error) {
                console.error("Failed to load gradebook data", error);
            } finally {
                setLoadingInfo(false);
            }
        };
        loadData();
    }, [selectedAssignment, assignments]);

    const handleScoreChange = (studentId: string, val: string) => {
        setScores(prev => ({ ...prev, [studentId]: val }));
    };

    const handleFeedbackChange = (studentId: string, val: string) => {
        setFeedbacks(prev => ({ ...prev, [studentId]: val }));
    };

    const handleSave = async (studentId: string) => {
        const scoreVal = parseFloat(scores[studentId]);
        if (isNaN(scoreVal)) {
            alert("Please enter a valid numeric score");
            return;
        }

        try {
            const savedGrade = await postGrade({
                student_id: studentId,
                assignment_id: selectedAssignment,
                score: scoreVal,
                feedback: feedbacks[studentId]
            });

            // Update local state
            setGrades(prev => ({ ...prev, [studentId]: savedGrade }));
            alert("Grade saved!");
        } catch (error) {
            alert("Failed to save grade: " + error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Gradebook</h1>

            {/* Assignment Selector */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-400 mb-2">Select Assignment</label>
                <select
                    className="w-full max-w-md bg-white/10 border border-white/20 rounded p-2 text-white"
                    value={selectedAssignment}
                    onChange={(e) => setSelectedAssignment(e.target.value)}
                >
                    <option value="" className="text-black">-- Choose Assignment --</option>
                    {assignments.map(a => (
                        <option key={a.pk} value={a.pk} className="text-black">
                            {a.title} ({a.class_id})
                        </option>
                    ))}
                </select>
            </div>

            {selectedAssignment && (
                <Card className="border-white/10" glass>
                    <CardHeader>
                        <CardTitle className="text-white">Grading: {assignments.find(a => a.pk === selectedAssignment)?.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingInfo ? (
                            <p className="text-gray-400">Loading student list...</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-gray-300">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="p-3">Student Name</th>
                                            <th className="p-3">Score</th>
                                            <th className="p-3">Feedback</th>
                                            <th className="p-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(student => (
                                            <tr key={student.pk} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="p-3 font-medium text-white">
                                                    {student.first_name} {student.last_name}
                                                    <span className="block text-xs text-gray-500 font-mono">{student.username}</span>
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        type="number"
                                                        className="w-24 bg-white/10 border-white/20 text-white"
                                                        value={scores[student.pk] || ""}
                                                        onChange={(e) => handleScoreChange(student.pk, e.target.value)}
                                                        placeholder="0-100"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        type="text"
                                                        className="bg-white/10 border-white/20 text-white"
                                                        value={feedbacks[student.pk] || ""}
                                                        onChange={(e) => handleFeedbackChange(student.pk, e.target.value)}
                                                        placeholder="Feedback..."
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Button size="sm" onClick={() => handleSave(student.pk)}>
                                                        Save
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {students.length === 0 && (
                                    <p className="p-4 text-center text-gray-500">No students found in this class.</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
