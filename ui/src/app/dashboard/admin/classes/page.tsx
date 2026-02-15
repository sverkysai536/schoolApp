"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { fetchWithAuth } from "@/utils/api";
import { Trash2, Settings, Plus } from "lucide-react";
import { ManageClassModal } from "./ManageClassModal";

export default function AdminClassesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newClassName, setNewClassName] = useState("");
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth("/admin/classes");
            if (res.ok) {
                const data = await res.json();
                setClasses(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async () => {
        if (!newClassName) return;
        try {
            console.log("Creating class:", newClassName);
            const res = await fetchWithAuth("/admin/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newClassName, teacher_id: null })
            });

            if (res.ok) {
                console.log("Class created successfully");
                setNewClassName("");
                fetchClasses();
            } else {
                const err = await res.json();
                console.error("Failed to create class:", err);
                alert("Failed to create class: " + (err.detail || "Unknown error"));
            }
        } catch (err) {
            console.error("Error creating class:", err);
            alert("Error creating class. Check console.");
        }
    };

    const handleDeleteClass = async (pk: string) => {
        if (!confirm("Are you sure you want to delete this class?")) return;
        try {
            await fetchWithAuth(`/admin/classes/${pk}`, {
                method: "DELETE"
            });
            fetchClasses();
        } catch (err) {
            console.error(err);
        }
    };

    const openManageModal = (pk: string) => {
        setSelectedClassId(pk);
        setIsManageModalOpen(true);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-white">Manage Classes</h1>

            {/* Create Class Section */}
            <Card className="mb-8 bg-black/60 border-white/10" glass>
                <CardContent className="p-6 flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1 text-gray-200">New Class Name</label>
                        <Input
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder="e.g. 10th Grade A"
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:bg-white/20"
                        />
                    </div>
                    <Button onClick={handleCreateClass} disabled={!newClassName}>
                        <Plus size={16} className="mr-2" /> Create Class
                    </Button>
                </CardContent>
            </Card>

            {/* Classes List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                    <Card key={cls.pk} className="bg-black/60 border-white/10 hover:bg-black/70 transition-colors" glass>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xl text-white">{cls.name}</CardTitle>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openManageModal(cls.pk)}
                                    className="p-2 hover:bg-white/10 rounded-full text-blue-300 transition-colors"
                                    title="Manage Class"
                                >
                                    <Settings size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClass(cls.pk)}
                                    className="p-2 hover:bg-white/10 rounded-full text-red-300 transition-colors"
                                    title="Delete Class"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-300 mb-2">
                                <span className="font-semibold text-white/80">Class Teacher:</span> {cls.teacher_id || "Unassigned"}
                            </p>
                            <p className="text-sm text-gray-300">
                                <span className="font-semibold text-white/80">Subjects:</span> {
                                    cls.subjects ?
                                        (typeof cls.subjects === 'string' ? JSON.parse(cls.subjects).length : cls.subjects.length)
                                        : 0
                                }
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {loading && <p className="text-center text-gray-400 mt-8">Loading classes...</p>}

            <ManageClassModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                classId={selectedClassId}
            />
        </div>
    );
}
