"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { fetchWithAuth } from "@/utils/api";
import { X, Trash2, Plus } from "lucide-react";
import styles from "./ManageClassModal.module.css";

interface ManageClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string | null;
}

export function ManageClassModal({ isOpen, onClose, classId }: ManageClassModalProps) {
    const [classData, setClassData] = useState<any>(null);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [newSubject, setNewSubject] = useState("");

    useEffect(() => {
        if (isOpen && classId) {
            fetchData();
            fetchTeachers();
        }
    }, [isOpen, classId]);

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetchWithAuth(`/admin/classes/${classId}`);
            if (res.ok) {
                const data = await res.json();
                // Parse JSON strings for subjects and subject_teachers
                if (data.subjects && typeof data.subjects === 'string') {
                    try { data.subjects = JSON.parse(data.subjects); } catch { }
                } else if (!data.subjects) {
                    data.subjects = [];
                }

                if (data.subject_teachers && typeof data.subject_teachers === 'string') {
                    try { data.subject_teachers = JSON.parse(data.subject_teachers); } catch { }
                } else if (!data.subject_teachers) {
                    data.subject_teachers = {};
                }

                setClassData(data);
            } else {
                setError("Failed to fetch class details");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await fetchWithAuth("/admin/users?role=teacher");
            if (res.ok) {
                const data = await res.json();
                setTeachers(data);
            }
            // Also need class teachers? Or generic teachers can be class teachers?
            // Assuming any teacher can be assigned. 
            // If strict Role.CLASS_TEACHER check is needed, we might need a separate fetch.
            // For now, let's fetch all teachers.
            // The prompt implies "list of the teacher" which likely means Role.TEACHER.
            // But for "Class Teacher" role, maybe we need Role.CLASS_TEACHER?
            // Let's fetch both or generic query.
            const res2 = await fetchWithAuth("/admin/users?role=class_teacher");
            if (res2.ok) {
                const data2 = await res2.json();
                setTeachers(prev => [...prev, ...data2]); // Merge
            }
        } catch (err) {
            console.error("Failed to fetch teachers", err);
        }
    };

    const handleUpdateClassTeacher = async (teacherId: string) => {
        try {
            await fetchWithAuth(`/admin/classes/${classId}/class-teacher`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacher_id: teacherId })
            });
            fetchData(); // Refresh
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleAddSubject = async () => {
        if (!newSubject) return;
        try {
            await fetchWithAuth(`/admin/classes/${classId}/subjects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject_name: newSubject })
            });
            setNewSubject("");
            fetchData();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleAssignSubjectTeacher = async (subject: string, teacherId: string) => {
        try {
            await fetchWithAuth(`/admin/classes/${classId}/subjects/${subject}/teacher`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacher_id: teacherId })
            });
            fetchData();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <Card className={styles.modal} glass>
                <button onClick={onClose} className={styles.closeBtn}>
                    <X size={20} />
                </button>
                <CardHeader>
                    <CardTitle>Manage Class: {classData?.name || "Loading..."}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading && <p className="text-center text-gray-400">Loading details...</p>}

                    {!loading && classData && (
                        <>
                            {/* Class Teacher Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Class Teacher</label>
                                <select
                                    className="w-full p-2 rounded-md border bg-transparent"
                                    value={classData.teacher_id || ""}
                                    onChange={(e) => handleUpdateClassTeacher(e.target.value)}
                                >
                                    <option value="">Select Class Teacher</option>
                                    {teachers.filter(t => t.role === 'class_teacher').map((t: any) => (
                                        <option key={t.pk} value={t.pk}>
                                            {t.first_name} {t.last_name} ({t.username})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Subjects Section */}
                            <div className="space-y-4 border-t pt-4">
                                <h3 className="font-semibold">Subjects & Teachers</h3>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="New Subject Name"
                                        value={newSubject}
                                        onChange={(e) => setNewSubject(e.target.value)}
                                    />
                                    <Button onClick={handleAddSubject} size="sm"><Plus size={16} /></Button>
                                </div>

                                <div className="space-y-3">
                                    {classData.subjects && classData.subjects.map((subject: string) => (
                                        <div key={subject} className="flex items-center gap-4 bg-white/5 p-3 rounded-md">
                                            <span className="font-medium min-w-[100px]">{subject}</span>
                                            <select
                                                className="flex-1 p-2 rounded-md border bg-transparent text-sm"
                                                value={classData.subject_teachers?.[subject] || ""}
                                                onChange={(e) => handleAssignSubjectTeacher(subject, e.target.value)}
                                            >
                                                <option value="">Assign Teacher</option>
                                                {teachers.filter(t => t.role === 'teacher').map((t: any) => (
                                                    <option key={t.pk} value={t.pk}>
                                                        {t.first_name} {t.last_name} ({t.username})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                    {(!classData.subjects || classData.subjects.length === 0) && (
                                        <p className="text-sm text-gray-500 italic">No subjects added yet.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {error && <div className={styles.error}>{error}</div>}
                </CardContent>
            </Card>
        </div>
    );
}

// Remove the old return statement target
const _old_return = null; 
