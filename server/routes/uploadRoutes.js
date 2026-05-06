import express from "express";
import multer from "multer";
import { extractTextFromImage } from "../services/ocrService.js";
import { classifyDocument } from "../services/classifyService.js";
import { extractStructuredData } from "../services/extractService.js";
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "server/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/", upload.array("files", 10), async (req, res) => {
  try {
    const files = req.files;

    let results = [];

    for (let file of files) {
      const text = await extractTextFromImage(file.path);

      const cleanText = text
        .replace(/[^a-zA-Z0-9\s.:]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const classification = classifyDocument(cleanText);

      const extractedData = extractStructuredData(cleanText);

      results.push({
        fileName: file.filename,
        ...classification,
        extractedData, // 🔥 NEW
        cleanText,
      });
    }

    res.json({
      message: "Files processed successfully",
      results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;