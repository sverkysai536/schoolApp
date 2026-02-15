"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card glass className="bg-black/60 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Manage Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-300">Create and manage students, teachers, and parents.</p>
                        <Link href="/dashboard/admin/users">
                            <Button className="w-full">Go to Users</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card glass className="bg-black/60 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-300">Manage classes and assign teachers.</p>
                        <Link href="/dashboard/admin/classes">
                            <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/10">View Classes</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card glass className="bg-black/60 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-300">Post fee structures and dues.</p>
                        <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/10">Manage Fees</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
