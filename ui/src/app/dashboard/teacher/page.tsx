"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function TeacherDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">Manage your assigned classes and student lists.</p>
                        <Button>View Classes</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">Create and grade assignments.</p>
                        <Button variant="secondary">Manage Assignments</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">Post updates to students and parents.</p>
                        <Button variant="secondary" onClick={() => window.location.href = '/dashboard/teacher/notifications'}>Post Notification</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Gradebook</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">Grade assignments and provide feedback.</p>
                        <Link href="/dashboard/teacher/grades">
                            <Button variant="secondary" className="w-full">Manage Grades</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
