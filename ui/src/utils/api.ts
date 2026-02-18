const API_URL = "http://localhost:8000";

export async function login(username: string, password: string): Promise<any> {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Login failed");
    }

    return res.json();
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : "",
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = "/login";
    }

    return res;
}

export async function updatePassword(oldPassword: string, newPassword: string) {
    const res = await fetchWithAuth("/update-password", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to update password");
    }

    return res.json();
}

// Fee Management APIs
// Fee Management APIs
export async function getFeeStructures() {
    const res = await fetch(`${API_URL}/admin/fee-structures`);
    if (!res.ok) throw new Error("Failed to fetch fee structures");
    return res.json();
}

export async function createOrUpdateFeeStructure(data: { class_id: string; amount: number; academic_year: string; due_date: string }) {
    const res = await fetch(`${API_URL}/admin/fee-structures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to save fee structure");
    return res.json();
}

export async function getClassFees(classId: string) {
    const res = await fetch(`${API_URL}/admin/classes/${classId}/fees`);
    if (!res.ok) throw new Error("Failed to fetch class fees");
    return res.json();
}

// Unified update for discount and payment
export async function updateStudentFee(data: { pk?: string; student_id?: string; academic_year?: string; paid_amount?: number; discount_amount?: number }) {
    const res = await fetch(`${API_URL}/admin/student-fees`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update student fee");
    return res.json();
}

export async function getChildFees(parentId: string, childId: string) {
    const res = await fetch(`${API_URL}/parent/children/${childId}/fees?parent_id=${parentId}`);
    if (!res.ok) throw new Error("Failed to fetch child fees");
    return res.json();
}

export async function getChildren(parentId: string) {
    const res = await fetch(`${API_URL}/parent/children?parent_id=${parentId}`);
    if (!res.ok) throw new Error("Failed to fetch children");
    return res.json();
}

export async function getChildNotifications(parentId: string, childId: string) {
    const res = await fetch(`${API_URL}/parent/children/${childId}/notifications?parent_id=${parentId}`);
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
}

// Teacher Grading
export async function getTeacherAssignments() {
    const res = await fetchWithAuth("/teacher/assignments");
    if (!res.ok) throw new Error("Failed to fetch assignments");
    return res.json();
}

export async function getClassStudents(classId: string) {
    const res = await fetchWithAuth(`/teacher/classes/${classId}/students`);
    if (!res.ok) throw new Error("Failed to fetch students");
    return res.json();
}

export async function getAssignmentGrades(assignmentId: string) {
    const res = await fetchWithAuth(`/teacher/assignments/${assignmentId}/grades`);
    if (!res.ok) throw new Error("Failed to fetch grades");
    return res.json();
}

export async function postGrade(data: { student_id: string; assignment_id: string; score: number; feedback?: string }) {
    const res = await fetchWithAuth("/teacher/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to save grade");
    return res.json();
}

// Parent Academics
export async function getChildAssignments(parentId: string, childId: string) {
    const res = await fetch(`${API_URL}/parent/children/${childId}/assignments?parent_id=${parentId}`);
    if (!res.ok) throw new Error("Failed to fetch assignments");
    return res.json();
}

export async function getChildGrades(parentId: string, childId: string) {
    const res = await fetch(`${API_URL}/parent/children/${childId}/grades?parent_id=${parentId}`);
    if (!res.ok) throw new Error("Failed to fetch grades");
    return res.json();
}

// Student Dashboard APIs
export async function getStudentAssignments(studentId: string) {
    const res = await fetch(`${API_URL}/student/assignments?student_id=${studentId}`);
    if (!res.ok) throw new Error("Failed to fetch assignments");
    return res.json();
}

export async function getStudentGrades(studentId: string) {
    const res = await fetch(`${API_URL}/student/grades?student_id=${studentId}`);
    if (!res.ok) throw new Error("Failed to fetch grades");
    return res.json();
}

export async function getStudentNotifications(studentId: string) {
    const res = await fetch(`${API_URL}/student/notifications?student_id=${studentId}`);
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
}
