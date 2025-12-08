const API_URL = "http://localhost:5000/api";

// --- AUTHENTICATION ---

async function register() {
    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            // Save token and redirect
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.user.username);
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("message").innerText = data.error || "Registration failed";
        }
    } catch (err) {
        console.error(err);
        document.getElementById("message").innerText = "Server Error";
    }
}

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            // Save token and redirect
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.user.username);
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("message").innerText = data.error || "Login failed";
        }
    } catch (err) {
        console.error(err);
        document.getElementById("message").innerText = "Server Error";
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "index.html";
}

// --- DASHBOARD FUNCTIONS ---

async function uploadFile() {
    const fileInput = document.getElementById("file-input");
    const privacy = document.getElementById("privacy-setting").value;
    const token = localStorage.getItem("token");

    if (fileInput.files.length === 0) {
        alert("Please select a file!");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("privacy", privacy);

    try {
        const res = await fetch(`${API_URL}/files/upload`, {
            method: "POST",
            headers: { "token": token }, // Send token for auth
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById("upload-message").innerText = "File uploaded successfully!";
            document.getElementById("upload-message").style.color = "green";
            loadDashboard(); // Refresh lists
        } else {
            document.getElementById("upload-message").innerText = "Error: " + (data.error || "Upload failed");
            document.getElementById("upload-message").style.color = "red";
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadDashboard() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    document.getElementById("username-display").innerText = `Hello, ${username}`;

    // 1. Load My Files
    const myFilesRes = await fetch(`${API_URL}/files/my-files`, {
        headers: { "token": token }
    });
    const myFiles = await myFilesRes.json();
    const myFilesList = document.getElementById("my-files-list");
    myFilesList.innerHTML = ""; // Clear list

    myFiles.forEach(file => {
        const li = document.createElement("li");
        li.className = "file-item";
        li.innerHTML = `
            <span>${file.filename} (${file.privacy})</span>
            <div>
                <a href="${API_URL}/files/download/${file.id}" class="btn-download" target="_blank">Download</a>
                <button onclick="deleteFile(${file.id})" class="btn-delete">Delete</button>
            </div>
        `;
        myFilesList.appendChild(li);
    });

    // 2. Load Public Files
    const publicFilesRes = await fetch(`${API_URL}/files/public`);
    const publicFiles = await publicFilesRes.json();
    const publicFilesList = document.getElementById("public-files-list");
    publicFilesList.innerHTML = "";

    publicFiles.forEach(file => {
        const li = document.createElement("li");
        li.className = "file-item";
        li.innerHTML = `
            <span>${file.filename} - ${(file.size / 1024).toFixed(2)} KB</span>
            <a href="${API_URL}/files/download/${file.id}" class="btn-download" target="_blank">Download</a>
        `;
        publicFilesList.appendChild(li);
    });
}

async function deleteFile(id) {
    if (!confirm("Are you sure you want to delete this file?")) return;

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_URL}/files/${id}`, {
            method: "DELETE",
            headers: { "token": token }
        });

        if (res.ok) {
            loadDashboard(); // Refresh list
        } else {
            alert("Failed to delete file");
        }
    } catch (err) {
        console.error(err);
    }
}

// Toggle Forms
function showRegister() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
}
function showLogin() {
    document.getElementById("register-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
}