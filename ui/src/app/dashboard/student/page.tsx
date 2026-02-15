"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
                        <Button>View Grades</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">Check due dates and submit work.</p>
                        <Button variant="secondary">View Assignments</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Class Board</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">See class notifications and ask questions.</p>
                        <Button variant="secondary">Go to Board</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
