import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { authenticate } from "../middlewares/authenticate.js";

const uploadRouter = Router();

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "parkease/facilities",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "parkease/documents",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

uploadRouter.post("/image", uploadImage.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }
    return res.status(200).json({ url: req.file.path });
  } catch (error) {
    return res.status(500).json({ message: "Image upload failed", error: error.message });
  }
});

uploadRouter.post("/document", authenticate, uploadDocument.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }
    return res.status(200).json({ url: req.file.path });
  } catch (error) {
    return res.status(500).json({ message: "Document upload failed", error: error.message });
  }
});

export default uploadRouter;
