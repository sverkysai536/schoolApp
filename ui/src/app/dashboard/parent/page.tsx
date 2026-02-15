"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ParentDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Parent Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Children</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">View progress, grades, and attendance for your kids.</p>
                        <Button>View Children</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Fees & Dues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">Check pending fees and payment history.</p>
                        <Button variant="secondary">Check Fees</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
