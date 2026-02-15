"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Send, MessageSquare } from "lucide-react";

interface Message {
    sender_id: string;
    recipient_id: string;
    content: string;
    created_at: string;
}

interface User {
    pk: string;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
}

export default function ClassTeacherMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [recipients, setRecipients] = useState<User[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState<string>("");
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                // Decode token to get current user username/id
                const payload = JSON.parse(atob(token.split('.')[1] || "{}"));
                setCurrentUser(payload.sub);

                // Fetch messages
                const msgRes = await fetch("http://localhost:8000/messages", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (msgRes.ok) setMessages(await msgRes.json());

                // Fetch potential recipients (Parents)
                const recRes = await fetch("http://localhost:8000/messages/recipients", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (recRes.ok) {
                    const data = await recRes.json();
                    setRecipients(data);
                    // if (data.length > 0) setSelectedRecipient(data[0].pk);
                }

            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const sendMessage = async () => {
        if (!selectedRecipient || !newMessage) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8000/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ recipient_id: selectedRecipient, content: newMessage })
            });
            if (res.ok) {
                setNewMessage("");
                // Refresh messages
                const msgRes = await fetch("http://localhost:8000/messages", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (msgRes.ok) setMessages(await msgRes.json());
            }
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white drop-shadow-md">Parent Messaging</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                {/* Compose Area */}
                <Card glass className="md:col-span-1 p-4 flex flex-col gap-4 bg-black/60 border-white/10">
                    <h3 className="font-semibold text-white">New Message</h3>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">To:</label>
                        <select
                            className="w-full bg-white/10 border border-white/20 rounded p-2 text-white"
                            value={selectedRecipient}
                            onChange={(e) => setSelectedRecipient(e.target.value)}
                        >
                            <option value="" disabled>Select a Parent</option>
                            {recipients.map(r => (
                                <option key={r.pk} value={r.pk}>
                                    {r.first_name} {r.last_name} (Parent)
                                </option>
                            ))}
                        </select>
                    </div>

                    <textarea
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button onClick={sendMessage} disabled={!selectedRecipient || !newMessage}>
                        <Send size={16} className="mr-2" /> Send
                    </Button>
                </Card>

                {/* Message History */}
                <Card glass className="md:col-span-2 p-0 overflow-hidden flex flex-col bg-black/60 border-white/10">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h3 className="font-semibold text-white">Message History</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-10">No messages yet.</div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.sender_id === currentUser;
                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl p-3 ${isMe ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'}`}>
                                            <p className="text-xs opacity-70 mb-1">{isMe ? `To: ${msg.recipient_id}` : `From: ${msg.sender_id}`}</p>
                                            <p>{msg.content}</p>
                                            <p className="text-[10px] opacity-50 mt-1 text-right">{new Date(msg.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
