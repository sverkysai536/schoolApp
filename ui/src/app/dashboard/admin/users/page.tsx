"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

interface User {
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    phone?: string;
    class_id?: string;
    children_ids?: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUsername, setEditingUsername] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "student",
        first_name: "",
        last_name: "",
        phone: "",
        class_id: "",
        children_ids: ""
    });

    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:8000/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Old handleEdit removed/replaced by execution in render part
    // Keeping this clean


    // Helper functions replaced below

    const resetForm = () => {
        setFormData({
            username: "",
            email: "",
            password: "",
            role: "student",
            first_name: "",
            last_name: "",
            phone: "",
            class_id: "",
            children_ids: ""
        });
        setEditingUsername(null);
        setShowForm(false);
    };


    const handleCreate = () => {
        resetForm(); // Clears everything
        setShowForm(true); // Open create form
    };

    const handleEdit = (user: User) => {
        // If creating, stop creating
        setShowForm(false);

        setFormData({
            username: user.username,
            email: user.email,
            password: "",
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone || "",
            class_id: user.class_id || "",
            children_ids: user.children_ids || ""
        });
        setEditingUsername(user.username);
    };

    const handleCancelEdit = () => {
        setEditingUsername(null);
        setFormData({
            username: "",
            email: "",
            password: "",
            role: "student",
            first_name: "",
            last_name: "",
            phone: "",
            class_id: "",
            children_ids: ""
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = editingUsername
                ? `http://localhost:8000/admin/users/${editingUsername}`
                : "http://localhost:8000/admin/users";

            const method = editingUsername ? "PUT" : "POST";

            // Clean up empty strings for optional fields if PUT
            const bodyData: any = { ...formData };
            if (editingUsername && !bodyData.password) {
                delete bodyData.password; // Don't send empty password if not changing
            }

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });

            if (res.ok) {
                alert(editingUsername ? "User updated successfully" : "User created successfully");
                if (editingUsername) {
                    handleCancelEdit();
                } else {
                    resetForm();
                }
                fetchUsers();
            } else {
                const error = await res.json();
                alert(`Error ${editingUsername ? "updating" : "creating"} user: ` + error.detail);
            }
        } catch (error) {
            console.error("Error submitting form", error);
        } finally {
            setLoading(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState("");

    // Grouping Logic
    const groupedUsers = users.reduce((acc, user) => {
        // Filter first
        const term = searchTerm.toLowerCase();
        const matches =
            user.username.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.first_name.toLowerCase().includes(term) ||
            user.last_name.toLowerCase().includes(term);

        if (!matches) return acc;

        const role = user.role || 'other';
        if (!acc[role]) acc[role] = [];
        acc[role].push(user);
        return acc;
    }, {} as Record<string, User[]>);

    const roleOrder = ['admin', 'class_teacher', 'teacher', 'student', 'parent'];
    const roleLabels: Record<string, string> = {
        admin: 'Admins',
        class_teacher: 'Class Teachers',
        teacher: 'Subject Teachers',
        student: 'Students',
        parent: 'Parents',
        other: 'Others'
    };

    return (
        <div className="p-6">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Users</h1>
                <div className="space-x-4">
                    <Link href="/dashboard/admin">
                        <Button variant="secondary" className="bg-black hover:bg-gray-800 text-white border-white/10 shadow-lg">Back to Dashboard</Button>
                    </Link>
                    <Button onClick={() => {
                        if (showForm) resetForm();
                        else handleCreate();
                    }}>
                        {showForm ? "Cancel Creation" : "Create New User"}
                    </Button>
                </div>
            </div>

            <div className="mb-6">
                <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md bg-white/10 border-white/20 text-white placeholder-gray-400 focus:bg-white/20"
                />
            </div>

            {/* Create Form (Top) */}
            {showForm && (
                <Card className="mb-8 border-white/10" glass>
                    <CardHeader>
                        <CardTitle className="text-white">Create New User</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Reusing the same form fields structure effectively, 
                                 but mapped to formData state which is shared. 
                                 Since we only show this if showForm is true, and inline edit closes this, it works. */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    name="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                />
                                <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="bg-white/10 border-white/20 text-white placeholder-gray-400" />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                />
                                {/* Role Select */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="flex h-14 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                                    >
                                        <option value="admin" className="text-black">Admin</option>
                                        <option value="teacher" className="text-black">Subject Teacher</option>
                                        <option value="class_teacher" className="text-black">Class Teacher</option>
                                        <option value="student" className="text-black">Student</option>
                                        <option value="parent" className="text-black">Parent</option>
                                    </select>
                                </div>
                                <Input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required className="bg-white/10 border-white/20 text-white placeholder-gray-400" />
                                <Input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required className="bg-white/10 border-white/20 text-white placeholder-gray-400" />
                                <Input name="phone" placeholder="Phone (Optional)" value={formData.phone} onChange={handleChange} className="bg-white/10 border-white/20 text-white placeholder-gray-400" />
                                {formData.role === 'student' && (
                                    <Input name="class_id" placeholder="Class ID (e.g. 10A)" value={formData.class_id} onChange={handleChange} className="bg-white/10 border-white/20 text-white placeholder-gray-400" />
                                )}
                                {formData.role === 'parent' && (
                                    <Input name="children_ids" placeholder="Children IDs (comma separated)" value={formData.children_ids} onChange={handleChange} className="bg-white/10 border-white/20 text-white placeholder-gray-400" />
                                )}
                            </div>
                            <div className="flex gap-4">
                                <Button type="submit" isLoading={loading}>Create User</Button>
                                <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-8">
                {roleOrder.map(role => {
                    const roleUsers = groupedUsers[role];
                    if (!roleUsers || roleUsers.length === 0) return null;

                    return (
                        <section key={role} className="space-y-4">
                            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">{roleLabels[role] || role}</h2>
                            <div className="grid gap-4">
                                {roleUsers.map(user => {
                                    const isEditing = editingUsername === user.username;

                                    if (isEditing) {
                                        return (
                                            <Card key={user.username} className="p-6 border-white/20 bg-white/5" glass>
                                                <form onSubmit={handleSubmit} className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {/* Disabled Username */}
                                                        <Input
                                                            label="Username"
                                                            value={formData.username}
                                                            disabled
                                                            className="bg-white/5 border-white/10 text-gray-400"
                                                        />
                                                        <Input label="Email" name="email" value={formData.email} onChange={handleChange} required className="bg-white/10" />
                                                        <Input label="New Password (Optional)" name="password" type="password" value={formData.password} onChange={handleChange} className="bg-white/10" />

                                                        <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required className="bg-white/10" />
                                                        <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required className="bg-white/10" />
                                                        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} className="bg-white/10" />

                                                        {/* Role Locking? Usually keep it distinct, but admin can change */}
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-sm font-medium text-gray-300 ml-1">Role</label>
                                                            <select
                                                                name="role"
                                                                value={formData.role}
                                                                onChange={handleChange}
                                                                className="flex h-14 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                                                            >
                                                                <option value="admin" className="text-black">Admin</option>
                                                                <option value="teacher" className="text-black">Subject Teacher</option>
                                                                <option value="class_teacher" className="text-black">Class Teacher</option>
                                                                <option value="student" className="text-black">Student</option>
                                                                <option value="parent" className="text-black">Parent</option>
                                                            </select>
                                                        </div>

                                                        {formData.role === 'student' && (
                                                            <Input label="Class ID" name="class_id" value={formData.class_id} onChange={handleChange} className="bg-white/10" />
                                                        )}
                                                        {formData.role === 'parent' && (
                                                            <Input label="Children IDs" name="children_ids" value={formData.children_ids} onChange={handleChange} className="bg-white/10" />
                                                        )}
                                                    </div>
                                                    <div className="flex gap-4 mt-4">
                                                        <Button type="submit" isLoading={loading} size="sm">Save Changes</Button>
                                                        <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                                                    </div>
                                                </form>
                                            </Card>
                                        );
                                    }

                                    return (
                                        <Card key={user.username} className="flex flex-row items-center justify-between p-6 border-white/10" glass>
                                            <div>
                                                <h3 className="font-semibold text-lg text-white">{user.first_name} {user.last_name}</h3>
                                                <p className="text-sm text-gray-300">@{user.username} • <span className="uppercase text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded">{user.role}</span></p>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-sm text-gray-300 hidden md:block">{user.email}</div>
                                                <Button size="sm" variant="secondary" onClick={() => handleEdit(user)} className="bg-white/10 hover:bg-white/20 text-white border-white/10">
                                                    Edit
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}

                {/* Handle Other roles or empty states if needed */}
                {Object.keys(groupedUsers).length === 0 && (
                    <p className="text-center text-gray-400 mt-10">No users found.</p>
                )}
            </div>
        </div>
    );
}
