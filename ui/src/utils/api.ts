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
