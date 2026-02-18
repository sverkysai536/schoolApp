"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function StudentDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Grades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">View your latest grades and feedback.</p>
                        <Link href="/dashboard/student/grades">
                            <Button className="w-full">View Grades</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">Check due dates and submit work.</p>
                        <Link href="/dashboard/student/assignments">
                            <Button variant="secondary" className="w-full">View Assignments</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Class Board</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">See class notifications and ask questions.</p>
                        <Link href="/dashboard/student/board">
                            <Button variant="secondary" className="w-full">Go to Board</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
