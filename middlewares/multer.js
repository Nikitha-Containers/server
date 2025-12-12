import multer from "multer";
import path from "path";
import fs from "fs";

const uploadFolder = "uploads";

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const dateObj = new Date();
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const seconds = String(dateObj.getSeconds()).padStart(2, "0");

    const component = file.fieldname;

    const originalName = file.originalname.replace(/\s+/g, "-");

    const finalName = `${day}-${month}-${year}_${hours}-${minutes}-${seconds}-${component}-${originalName}`;
    cb(null, finalName);
  },
});

export const uploadComp = multer({ storage });
