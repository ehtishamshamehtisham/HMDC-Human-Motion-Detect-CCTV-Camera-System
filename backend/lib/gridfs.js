const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');

let gridFSBucket;

// Lazy initialization - gets GridFS bucket when needed
const getGridFS = () => {
  if (!gridFSBucket) {
    if (!mongoose.connection.db) {
      throw new Error('MongoDB not connected');
    }
    gridFSBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'recordings'
    });
    console.log("GridFS Bucket initialized");
  }
  return gridFSBucket;
};

// Upload file to GridFS
const uploadToGridFS = (filePath, filename, metadata = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = getGridFS().openUploadStream(filename, {
      metadata: metadata
    });
    
    fs.createReadStream(filePath)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve(uploadStream.id);
      });
  });
};

// Download file from GridFS
const downloadFromGridFS = (fileId, outputPath) => {
  return new Promise((resolve, reject) => {
    const downloadStream = getGridFS().openDownloadStream(fileId);
    const writeStream = fs.createWriteStream(outputPath);
    
    downloadStream
      .pipe(writeStream)
      .on('error', reject)
      .on('finish', resolve);
  });
};

// Get file stream for direct download
const getFileStream = (fileId) => {
  return getGridFS().openDownloadStream(fileId);
};

// Delete file from GridFS
const deleteFromGridFS = (fileId) => {
  return getGridFS().delete(fileId);
};

// Get file info
const getFileInfo = async (fileId) => {
  const files = await mongoose.connection.db.collection('recordings.files').findOne({ _id: fileId });
  return files;
};

// Keep initGridFS for compatibility (but it just calls getGridFS)
const initGridFS = () => {
  return getGridFS();
};

module.exports = {
  initGridFS,
  uploadToGridFS,
  downloadFromGridFS,
  getFileStream,
  deleteFromGridFS,
  getFileInfo
};