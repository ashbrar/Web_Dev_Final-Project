const router = require('express').Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Needed for deleting files
const authorization = require('../middleware/authorization');

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// 1. UPLOAD FILE
router.post('/upload', authorization, upload.single('file'), async (req, res) => {
    try {
        const { privacy } = req.body;
        const userId = req.user.id;

        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const newFile = await pool.query(
            "INSERT INTO files (filename, filepath, size, privacy, uploaded_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [req.file.originalname, req.file.path, req.file.size, privacy, userId]
        );

        res.json({ message: "File uploaded successfully", file: newFile.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

// 2. GET ALL PUBLIC FILES (For the Downloads Page)
router.get('/public', async (req, res) => {
    try {
        const publicFiles = await pool.query(
            "SELECT id, filename, size, uploaded_at, privacy FROM files WHERE privacy = 'public' ORDER BY uploaded_at DESC"
        );
        res.json(publicFiles.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

// 3. GET USER'S FILES (For My Files Dashboard)
router.get('/my-files', authorization, async (req, res) => {
    try {
        const userFiles = await pool.query(
            "SELECT * FROM files WHERE uploaded_by = $1 ORDER BY uploaded_at DESC",
            [req.user.id]
        );
        res.json(userFiles.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

// 4. DOWNLOAD FILE (Checks permissions)
router.get('/download/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const file = await pool.query("SELECT * FROM files WHERE id = $1", [id]);

        if (file.rows.length === 0) {
            return res.status(404).json("File not found");
        }

        const fileData = file.rows[0];

        // Construct the full path to the file on the hard drive
        const filePath = path.join(__dirname, '..', fileData.filepath);

        // Send the file to the browser
        res.download(filePath, fileData.filename);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

// 5. DELETE FILE (Only Owner can delete)
router.delete('/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if file exists and belongs to user
        const file = await pool.query("SELECT * FROM files WHERE id = $1 AND uploaded_by = $2", [id, userId]);

        if (file.rows.length === 0) {
            return res.status(403).json("You can only delete your own files.");
        }

        const filePath = path.join(__dirname, '..', file.rows[0].filepath);

        // Delete from Database
        await pool.query("DELETE FROM files WHERE id = $1", [id]);

        // Delete from "uploads" folder
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json("File deleted successfully");
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;