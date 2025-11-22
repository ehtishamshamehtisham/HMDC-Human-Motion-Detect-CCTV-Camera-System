const express = require("express");
const multer = require("multer");
const os = require("os");
const fs = require("fs");
const path = require("path");

const Recording = require("../models/Recording");
const { authMiddleware } = require("../middleware/auth");
const { 
  initGridFS, 
  uploadToGridFS, 
  getFileStream, 
  deleteFromGridFS 
} = require("../lib/gridfs");

const router = express.Router();

// Initialize GridFS when routes load
//initGridFS();

// Multer temp storage
const upload = multer({ dest: os.tmpdir() });

// POST /api/recordings/upload - Upload to GridFS
router.post("/upload", authMiddleware, upload.single("recording"), async (req, res) => {
  let tempPath = req.file.path;
  
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    const userId = req.user.id;
    const cameraId = req.body.cameraId || "unknown";
    const originalName = req.file.originalname || "recording.webm";

    // Upload to GridFS
    const fileId = await uploadToGridFS(
      tempPath, 
      originalName, 
      { 
        userId: userId,
        cameraId: cameraId,
        uploadDate: new Date()
      }
    );

    // Save metadata to Recording collection
    const recording = new Recording({
      user: userId,
      cameraId: cameraId,
      originalName: originalName,
      fileName: originalName,
      fileId: fileId,
      size: req.file.size,
      mimeType: req.file.mimetype,
      timestamp: new Date()
    });

    await recording.save();

    // Cleanup temp file
    try { fs.unlinkSync(tempPath); } catch(e) {}

    res.json({ 
      success: true, 
      recording: {
        id: recording._id,
        originalName: recording.originalName,
        size: recording.size,
        timestamp: recording.timestamp
      }
    });
  } catch (err) {
    // Cleanup temp file on error
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch(e) {}
    }
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// GET /api/recordings - List recordings
router.get("/", authMiddleware, async (req, res) => {
  try {
    const recordings = await Recording.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .select('originalName size timestamp cameraId');
    
    res.json(recordings);
  } catch (err) {
    console.error("List recordings error:", err);
    res.status(500).json({ message: "Error fetching recordings" });
  }
});


// ... your existing routes ...

// GET /api/recordings/storage/usage - Check storage usage
router.get("/storage/usage", authMiddleware, async (req, res) => {
  try {
    const result = await Recording.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: null, totalSize: { $sum: "$size" } } }
    ]);
    
    const totalSize = result[0]?.totalSize || 0;
    const percentage = (totalSize / (512 * 1024 * 1024)) * 100; // 512MB in bytes
    
    res.json({
      used: totalSize,
      usedMB: (totalSize / (1024 * 1024)).toFixed(2),
      maxMB: 512,
      percentage: percentage.toFixed(2)
    });
  } catch (err) {
    console.error("Storage usage error:", err);
    res.status(500).json({ message: "Error checking storage" });
  }
});

// ... your other routes con


// GET /api/recordings/download/:id - Download recording
router.get("/download/:id", authMiddleware, async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    
    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }
    
    if (recording.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!recording.fileId) {
      return res.status(404).json({ message: "File not found" });
    }

    // Set download headers
    res.setHeader('Content-Type', recording.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${recording.originalName}"`);

    // Stream file from GridFS
    const downloadStream = getFileStream(recording.fileId);
    
    downloadStream.on('error', (err) => {
      console.error('Download stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming file' });
      }
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Download failed" });
  }
});

// DELETE /api/recordings/:id - Delete recording
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    
    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }
    
    if (recording.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete from GridFS
    if (recording.fileId) {
      try {
        await deleteFromGridFS(recording.fileId);
      } catch (err) {
        console.warn("Could not delete from GridFS:", err.message);
      }
    }

    // Delete from Recording collection
    await Recording.findByIdAndDelete(req.params.id);

    res.json({ message: "Recording deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// GET /api/recordings/stream/:id - Stream recording (for web playback)
router.get("/stream/:id", authMiddleware, async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    
    if (!recording || !recording.fileId) {
      return res.status(404).json({ message: "Recording not found" });
    }
    
    if (recording.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Set streaming headers
    res.setHeader('Content-Type', recording.mimeType || 'video/mp4');
    res.setHeader('Content-Disposition', `inline; filename="${recording.originalName}"`);

    // Stream from GridFS
    const downloadStream = getFileStream(recording.fileId);
    downloadStream.pipe(res);
  } catch (err) {
    console.error("Stream error:", err);
    res.status(500).json({ message: "Stream failed" });
  }
});

module.exports = router;