const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');

let gridFSBucket;

// Initialize GridFS Bucket
const initGridFS = () => {
  const db = mongoose.connection.db;
  gridFSBucket = new GridFSBucket(db, {
    bucketName: 'recordings'
  });
  return gridFSBucket;
};

// Upload file to GridFS
const uploadToGridFS = (filePath, filename, metadata = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = gridFSBucket.openUploadStream(filename, {
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
    const downloadStream = gridFSBucket.openDownloadStream(fileId);
    const writeStream = fs.createWriteStream(outputPath);
    
    downloadStream
      .pipe(writeStream)
      .on('error', reject)
      .on('finish', resolve);
  });
};

// Get file stream for direct download
const getFileStream = (fileId) => {
  return gridFSBucket.openDownloadStream(fileId);
};

// Delete file from GridFS
const deleteFromGridFS = (fileId) => {
  return gridFSBucket.delete(fileId);
};

// Get file info
const getFileInfo = async (fileId) => {
  const files = await mongoose.connection.db.collection('recordings.files').findOne({ _id: fileId });
  return files;
};

module.exports = {
  initGridFS,
  uploadToGridFS,
  downloadFromGridFS,
  getFileStream,
  deleteFromGridFS,
  getFileInfo
};