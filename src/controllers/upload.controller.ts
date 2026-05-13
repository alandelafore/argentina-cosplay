import fs from "fs";
import path from "path";
import { Request, Response } from "express";

const uploadDir = path.resolve("uploads", "products");

export function ensureUploadDirectory() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

export function uploadProductImages(req: Request, res: Response) {
  if (!req.files || !Array.isArray(req.files)) {
    return res.status(400).json({ message: "No se recibieron imágenes" });
  }

  const urls = (req.files as Express.Multer.File[]).map((file) => {
    const relativePath = `/uploads/products/${file.filename}`;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    return `${baseUrl}${relativePath}`;
  });

  return res.status(201).json({ urls });
}
