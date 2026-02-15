"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Users, BookOpen, MessageSquare } from "lucide-react";

interface DashboardStats {
    class_name: string;
    student_count: number;
    assignment_count: number;
}

export default function ClassTeacherDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8000/class-teacher/dashboard", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="p-8">
                <Card glass className="p-6">
                    <div className="text-white">Loading dashboard...</div>
                </Card>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-8">
                <Card glass className="p-6 border-red-500/30 bg-red-500/10">
                    <div className="text-white">Failed to load dashboard. Ensure you are assigned to a class.</div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Class: {stats.class_name}</h1>
            <p className="text-gray-400 mb-8">Manage your class, assignments, and communications.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card glass className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-blue-500/20 text-blue-400">
                        <Users size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Total Students</p>
                        <h3 className="text-2xl font-bold text-white">{stats.student_count}</h3>
                    </div>
                </Card>

                <Card glass className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-purple-500/20 text-purple-400">
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Assignments</p>
                        <h3 className="text-2xl font-bold text-white">{stats.assignment_count}</h3>
                    </div>
                </Card>

                <Card glass className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-green-500/20 text-green-400">
                        <MessageSquare size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Communications</p>
                        <h3 className="text-2xl font-bold text-white">Active</h3>
                    </div>
                </Card>
            </div>
        </div>
    );
}
