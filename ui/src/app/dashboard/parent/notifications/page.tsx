"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { getChildNotifications, getChildren } from "@/utils/api";

interface Notification {
    pk: string;
    title: string;
    message: string;
    created_at: string;
    sender_id: string;
}

interface Child {
    username: string;
    first_name: string;
    last_name: string;
}

export default function ParentNotificationsPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<string>("");
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const parentId = typeof window !== 'undefined' ? localStorage.getItem('username') || '' : '';

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

    useEffect(() => {
        const fetchNotes = async () => {
            if (!selectedChild || !parentId) return;
            setLoading(true);
            try {
                const data = await getChildNotifications(parentId, selectedChild);
                setNotifications(data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, [selectedChild, parentId]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Class Notifications</h1>

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
                        No notifications found for this class.
                    </div>
                )}
            </div>
        </div>
    );
}
