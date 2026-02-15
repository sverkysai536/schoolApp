"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Send } from "lucide-react";

export default function ClassTeacherForum() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);

    React.useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8000/class-teacher/forum", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Failed to fetch forum posts", error);
        }
    };

    const postToForum = async () => {
        if (!title || !message) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8000/class-teacher/forum", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ title, message })
            });

            if (res.ok) {
                alert("Posted to school forum successfully!");
                setTitle("");
                setMessage("");
                fetchPosts(); // Refresh list
            } else {
                alert("Failed to post.");
            }
        } catch (error) {
            console.error("Failed to post to forum", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">School Forum</h1>
            <Card glass className="mb-8">
                <CardHeader>
                    <CardTitle>Create New Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Announcement Title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                        <textarea
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Write your announcement here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={postToForum} disabled={loading || !title || !message} isLoading={loading}>
                            <Send size={16} className="mr-2" /> Post Announcement
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <h2 className="text-2xl font-bold text-white mb-4">Recent Announcements</h2>
            <div className="space-y-4">
                {posts.map((post) => (
                    <Card key={post.pk} glass>
                        <CardHeader>
                            <CardTitle>{post.title}</CardTitle>
                            <p className="text-sm text-gray-400">
                                Posted on {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString()}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-200 whitespace-pre-wrap">{post.message}</p>
                        </CardContent>
                    </Card>
                ))}
                {posts.length === 0 && (
                    <p className="text-center text-gray-400">No announcements yet.</p>
                )}
            </div>
        </div>
    );
}
