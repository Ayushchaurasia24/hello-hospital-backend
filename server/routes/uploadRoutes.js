import express from "express";
import multer from "multer";
import { extractTextFromImage } from "../services/ocrService.js";
import { classifyDocument } from "../services/classifyService.js";
import { extractStructuredData } from "../services/extractService.js";
import Document from "../models/Document.js";
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

      const savedDocument = await Document.create({
        fileName: file.filename,

        type: classification.type,

        confidence: classification.confidence,

        scores: classification.scores,

        cleanText,

        extractedData,
      });

      results.push(savedDocument);
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