# Secure File Hosting Web Application

A full-stack web application that allows users to register, log in, and securely upload/download files. Files can be marked as Public (visible to everyone) or Private (visible only to the owner).

## 🚀 Features
- **User Authentication:** Secure registration and login using JWT and Bcrypt.
- **File Uploads:** Support for .pdf and .mp4 files (Max 20MB).
- **Access Control:**
  - **Public:** Listed on the global download page.
  - **Private:** Visible only in the user's dashboard.
- **Dashboard:** Users can view, delete, and download their own files.

## 🛠 Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (Fetch API)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Security:** JSON Web Tokens (JWT), Password Hashing (Bcrypt)

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js installed
- PostgreSQL installed and running

### 2. Database Setup
1. Open **pgAdmin 4**.
2. Create a database named `filehosting_db`.
3. Open the **Query Tool** and run the following SQL:
   ```sql
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(50) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE files (
       id SERIAL PRIMARY KEY,
       filename VARCHAR(255) NOT NULL,
       filepath VARCHAR(255) NOT NULL,
       size BIGINT NOT NULL,
       privacy VARCHAR(10) CHECK (privacy IN ('public', 'private')) NOT NULL,
       uploaded_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
       uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );