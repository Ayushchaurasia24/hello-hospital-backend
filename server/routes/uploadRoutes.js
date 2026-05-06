import express from "express";
import multer from "multer";
import { extractTextFromImage } from "../services/ocrService.js";
import { classifyDocument } from "../services/classifyService.js";
import { extractStructuredData } from "../services/extractService.js";
import Document from "../models/Document.js";
import documentQueue from "../queues/documentQueue.js";

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

    for (let file of files) {

      // 🚀 ADD JOB TO QUEUE
      await documentQueue.add("process-document", {
        fileName: file.filename,
        filePath: file.path,
      });

      console.log("✅ Job Added:", file.filename);
    }

    res.json({
      message: "Files added to processing queue",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

router.get("/documents", async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;