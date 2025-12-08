const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');

// Import Routes
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files'); // This works now because we created the file above

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Use Routes
app.use('/api', authRoutes);      // http://localhost:5000/api/register
app.use('/api/files', fileRoutes); // http://localhost:5000/api/files/upload

// Test Route
app.get('/', (req, res) => {
    res.send('Secure File Hosting API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});