"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { getChildren } from "@/utils/api";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Child {
    username: string; // Used as ID
    first_name: string;
    last_name: string;
    email: string;
    class_id?: string;
}

export default function ParentChildrenPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const parentId = typeof window !== 'undefined' ? localStorage.getItem('username') || '' : '';

    useEffect(() => {
        const fetchChildren = async () => {
            if (!parentId) return;
            try {
                const data = await getChildren(parentId);
                setChildren(data);
            } catch (error) {
                console.error("Failed to fetch children", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChildren();
    }, [parentId]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Children</h1>
            <div className="grid gap-6">
                {children.map(child => (
                    <Card key={child.username} className="border-white/10" glass>
                        <CardHeader>
                            <CardTitle className="text-white">{child.first_name} {child.last_name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-gray-300 space-y-2">
                                <p><strong>Username:</strong> {child.username}</p>
                                <p><strong>Class:</strong> {child.class_id || 'N/A'}</p>
                                <p><strong>Email:</strong> {child.email}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <Link href="/dashboard/parent/academics">
                                    <Button variant="secondary" size="sm" className="w-full">View Academics</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {children.length === 0 && !loading && (
                    <p className="text-gray-400">No children linked to your account.</p>
                )}
            </div>
        </div>
    );
}
