"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, KeyRound } from "lucide-react";
import styles from "./dashboard.module.css";
import Image from "next/image";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [role, setRole] = useState<string | null>(null);

    React.useEffect(() => {
        setRole(localStorage.getItem("role"));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/login");
    };

    // Determine background image based on role
    // Student -> Animals
    // Everyone else -> Kids
    const isStudent = pathname?.includes("/dashboard/student");
    const bgImage = isStudent ? "/school_animals_background.png" : "/school_kids_background.png";

    return (
        <div className={styles.container}>
            {/* Background Image */}
            <div
                className={styles.bgContainer}
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    transition: 'background-image 0.5s ease-in-out'
                }}
            />

            <div className={styles.contentWrapper}>
                <aside className={styles.sidebar}>
                    <div className={styles.logo}>Vikas School</div>
                    <nav className={styles.nav}>
                        {/* Nav items could be dynamic based on role */}
                        <div className={styles.navItem} onClick={() => router.push(`/dashboard/${role === 'class_teacher' ? 'class-teacher' : role || ''}`)}>Dashboard</div>

                        {role === 'admin' && (
                            <div className={styles.navItem} onClick={() => router.push('/dashboard/admin/users')}>Users</div>
                        )}

                        {/* Teacher & Class Teacher Shared Links (Subject Teaching) */}
                        {(role === 'teacher' || role === 'class_teacher') && (
                            <>
                                <div className={styles.navItemHeader}>Teaching</div>
                                <div className={styles.navItem} onClick={() => router.push('/dashboard/teacher')}>My Subjects</div>
                                <div className={styles.navItem} onClick={() => router.push('/dashboard/teacher/assignments')}>Subject Assignments</div>
                            </>
                        )}

                        {/* Class Teacher Specific Links */}
                        {role === 'class_teacher' && (
                            <>
                                <div className={styles.navItemHeader}>Class Management</div>
                                <div className={styles.navItem} onClick={() => router.push('/dashboard/class-teacher')}>Overview</div>
                                <div className={styles.navItem} onClick={() => router.push('/dashboard/class-teacher/assignments')}>Assignments</div>
                                <div className={styles.navItem} onClick={() => router.push('/dashboard/class-teacher/messages')}>Messages</div>
                                <div className={styles.navItem} onClick={() => router.push('/dashboard/class-teacher/forum')}>Forum</div>
                            </>
                        )}

                        {/* Parent Specific Links */}
                        {role === 'parent' && (
                            <>
                                <div className={styles.navItemHeader}>My Children</div>
                                <div className={styles.navItem} onClick={() => router.push('/dashboard/parent')}>Dashboard</div>
                                <div className={styles.navItem} onClick={() => router.push('/dashboard/parent/messages')}>Messages</div>
                            </>
                        )}
                        <div className={styles.navItem} onClick={() => setIsChangePasswordOpen(true)}>
                            Change Password
                        </div>
                    </nav>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <LogOut size={18} /> Logout
                    </button>
                </aside>
                <main className={styles.main}>
                    {children}
                </main>
            </div>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>
    );
}
