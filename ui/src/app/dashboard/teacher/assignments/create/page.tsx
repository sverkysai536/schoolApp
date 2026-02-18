"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { BookOpen, Calendar, AlignLeft, Send } from "lucide-react";

interface Class {
    pk: string;
    name: string;
}

export default function CreateAssignment() {
    const router = useRouter();
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8000/teacher/classes", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setClasses(data);
                    if (data.length > 0) setSelectedClass(data[0].pk);
                }
            } catch (error) {
                console.error("Failed to fetch classes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const createAssignment = async () => {
        if (!selectedClass || !title || !description || !dueDate) return;
        try {
            const token = localStorage.getItem("token");
            // API expects datetime, handle iso string
            const dueDateTime = new Date(dueDate).toISOString();

            const res = await fetch("http://localhost:8000/teacher/assignments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    class_id: selectedClass,
                    title,
                    description,
                    due_date: dueDateTime
                })
            });
            if (res.ok) {
                alert("Assignment created successfully!");
                router.push("/dashboard/teacher/assignments");
            } else {
                alert("Failed to create assignment");
            }
        } catch (error) {
            console.error("Failed to create", error);
            alert("Error creating assignment");
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Create Assignment</h1>

            <Card glass className="p-6 space-y-4 border-white/10">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">New Assignment Details</h2>
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Select Class</label>
                    <select
                        className="w-full bg-black/50 border border-white/20 rounded p-2 text-white"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="" disabled>Select a Class</option>
                        {classes.map(c => (
                            <option key={c.pk} value={c.pk}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Title</label>
                    <input
                        type="text"
                        className="w-full bg-black/50 border border-white/20 rounded p-2 text-white"
                        placeholder="e.g. Chapter 5 Exercises"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Due Date</label>
                    <input
                        type="datetime-local"
                        className="w-full bg-black/50 border border-white/20 rounded p-2 text-white"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Description</label>
                    <textarea
                        className="w-full h-32 bg-black/50 border border-white/20 rounded p-2 text-white"
                        placeholder="Detailed instructions..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => router.back()} className="w-1/3">
                        Cancel
                    </Button>
                    <Button onClick={createAssignment} disabled={!selectedClass || !title} className="w-2/3">
                        <Send size={16} className="mr-2" /> Create Assignment
                    </Button>
                </div>
            </Card>
        </div>
    );
}
