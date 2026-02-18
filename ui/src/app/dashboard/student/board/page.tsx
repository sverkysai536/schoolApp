"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { getStudentNotifications } from "@/utils/api";

interface Notification {
    pk: string;
    title: string;
    message: string;
    created_at: string;
    sender_id: string;
}

export default function StudentBoardPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const studentId = typeof window !== 'undefined' ? localStorage.getItem('username') || '' : '';

    useEffect(() => {
        const fetchNotes = async () => {
            if (!studentId) return;
            try {
                const data = await getStudentNotifications(studentId);
                setNotifications(data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, [studentId]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Class Board</h1>
            <div className="space-y-4">
                {notifications.map((note) => (
                    <Card key={note.pk} className="border-white/10" glass>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg text-white">{note.title}</CardTitle>
                                <span className="text-xs text-gray-400">
                                    {new Date(note.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-300 whitespace-pre-wrap">{note.message}</p>
                            <p className="text-xs text-gray-500 mt-4">Posted by: {note.sender_id}</p>
                        </CardContent>
                    </Card>
                ))}

                {notifications.length === 0 && !loading && (
                    <div className="text-center p-8 text-gray-500">
                        No notifications posted yet.
                    </div>
                )}
            </div>
        </div>
    );
}
