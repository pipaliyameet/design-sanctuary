import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for 4K video / high-res CAD / drawings
  },
  fileFilter: (_req, file, cb) => {
    // Allow images, videos, documents, zip, dwg, pdf
    cb(null, true);
  },
});
