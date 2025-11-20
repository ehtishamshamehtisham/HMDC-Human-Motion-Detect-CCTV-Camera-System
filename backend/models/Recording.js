// backend/models/Recording.js
/*const mongoose = require('mongoose');

module.exports = mongoose.model('Recording', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  device: { type: mongoose.Schema.Types.ObjectId, ref: "Device", default: null },
  filename: String,
  originalName: String,
  path: String,
  size: Number,
  mimeType: String,
  timestamp: { type: Date, default: Date.now }
}));*/


// backend/models/Recording.js
/*const mongoose = require("mongoose");

const RecordingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cameraId: { type: String },
  fileName: { type: String, required: true }, // R2 object key
  originalName: { type: String },
  size: { type: Number },
  mimeType: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Recording", RecordingSchema);*/


const mongoose = require("mongoose");

const RecordingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cameraId: { type: String },
  originalName: { type: String, required: true },
  fileName: { type: String }, // GridFS filename
  fileId: { type: mongoose.Schema.Types.ObjectId }, // GridFS file ID
  size: { type: Number },
  mimeType: { type: String },
  duration: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Recording", RecordingSchema);
