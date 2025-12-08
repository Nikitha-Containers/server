import multer from "multer";
import path from "path";
import fs from "fs";

const UploadFol = "uploads/componnets";

if (!fs.existsSync(UploadFol)) {
  fs.mkdirSync(UploadFol, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, res, cb) => cb(null, UploadFol),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const uploadComp = multer({
  storage,
});
