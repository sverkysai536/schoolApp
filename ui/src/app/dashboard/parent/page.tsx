"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ParentDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Parent Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Children</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">View progress, grades, and attendance for your kids.</p>
                        <Link href="/dashboard/parent/children">
                            <Button className="w-full">View Children</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Fees & Dues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">Check pending fees and payment history.</p>
                        <Link href="/dashboard/parent/fees">
                            <Button variant="secondary" className="w-full">Check Fees</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">Stay updated with class announcements.</p>
                        <Link href="/dashboard/parent/notifications">
                            <Button variant="secondary" className="w-full">View Notifications</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Academics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">View assignments and grades.</p>
                        <Link href="/dashboard/parent/academics">
                            <Button variant="secondary" className="w-full">View Academics</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
