"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Send, Bell } from "lucide-react";

interface Class {
    pk: string;
    name: string;
}

export default function TeacherNotifications() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
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
                    if (data.length > 0) setSelectedClass(data[0].pk); // Default select first
                }
            } catch (error) {
                console.error("Failed to fetch classes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const postNotification = async () => {
        if (!selectedClass || !title || !message) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8000/teacher/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    class_id: selectedClass,
                    title,
                    message
                })
            });
            if (res.ok) {
                setTitle("");
                setMessage("");
                alert("Notification posted successfully!");
            } else {
                alert("Failed to post notification");
            }
        } catch (error) {
            console.error("Failed to post", error);
            alert("Error posting notification");
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Post Notification</h1>

            <Card glass className="p-6 space-y-4 border-white/10">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="text-yellow-400" />
                    <h2 className="text-xl font-semibold text-white">New Announcement</h2>
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
                        placeholder="e.g. Test on Monday"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Message</label>
                    <textarea
                        className="w-full h-32 bg-black/50 border border-white/20 rounded p-2 text-white"
                        placeholder="Write your announcement here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                <Button onClick={postNotification} disabled={!selectedClass || !title || !message} className="w-full">
                    <Send size={16} className="mr-2" /> Post Notification
                </Button>
            </Card>
        </div>
    );
}
