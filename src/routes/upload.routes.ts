import { Router } from "express";
import multer from "multer";
import path from "path";
import { uploadProductImages } from "../controllers/upload.controller";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("uploads", "products"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, extension);
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9\.\-_]/g, "-");
    const timestamp = Date.now();
    cb(null, `${timestamp}-${safeName}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    cb(null, allowedTypes.includes(file.mimetype));
  },
});

router.post("/products", upload.array("images", 6), uploadProductImages);

export default router;
