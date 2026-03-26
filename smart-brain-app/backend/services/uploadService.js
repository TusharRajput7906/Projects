const multer = require('multer');
const ImageKit = require('imagekit');
const path = require('path');

// ── ImageKit client ────────────────────────────────────────────────────────────
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// ── Multer (memory storage — buffer passed directly to ImageKit) ───────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg|pdf|mp4|webm/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

// ── Upload buffer → ImageKit ───────────────────────────────────────────────────
const uploadToImageKit = (buffer, fileName, folder = 'smart-brain') => {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: buffer,           // Buffer
        fileName,
        folder,
        useUniqueFileName: true,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

// ── Delete from ImageKit ───────────────────────────────────────────────────────
const deleteFromImageKit = (fileId) => {
  return new Promise((resolve, reject) => {
    imagekit.deleteFile(fileId, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = { upload, uploadToImageKit, deleteFromImageKit, imagekit };
