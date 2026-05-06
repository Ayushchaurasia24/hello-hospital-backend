import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";

import redisConnection from "../config/redis.js";
import connectDB from "../config/db.js";

import { extractTextFromImage } from "../services/ocrService.js";
import { classifyDocument } from "../services/classifyService.js";
import { extractStructuredData } from "../services/extractService.js";

import Document from "../models/Document.js";

// 🚀 Connect MongoDB
connectDB();

const worker = new Worker(

  "document-processing",

  async (job) => {

    try {

      console.log(
        "🔥 Processing:",
        job.data.fileName
      );

      // OCR
      const text =
        await extractTextFromImage(
          job.data.filePath
        );

      // Clean text
      const cleanText = text
        .replace(/[^a-zA-Z0-9\s.:]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Classification
      const classification =
        classifyDocument(cleanText);

      // Structured extraction
      const extractedData =
        extractStructuredData(cleanText);

      // Save to Mongo
      const savedDocument =
        await Document.create({

          fileName: job.data.fileName,

          type: classification.type,

          confidence:
            classification.confidence,

          scores: classification.scores,

          cleanText,

          extractedData,
        });

      console.log(
        "✅ Saved To Mongo:",
        savedDocument._id
      );

    } catch (error) {

      console.error(
        "❌ Worker Error:",
        error
      );
    }
  },

  {
    connection: redisConnection,
  }
);

console.log("🚀 Worker started");