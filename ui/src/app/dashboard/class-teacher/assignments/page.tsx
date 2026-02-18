"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function ClassTeacherAssignmentsPage() {
    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-white">Class Assignments Overview</h1>
            <p className="text-gray-400">View all assignments posted to your class by subject teachers.</p>

            <Card glass className="p-0 overflow-hidden border-white/10">
                <div className="p-6 text-center text-gray-400">
                    <p>No active assignments for this class.</p>
                </div>
            </Card>
        </div>
    );
}
