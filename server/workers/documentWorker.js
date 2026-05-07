import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";

import redisConnection from "../config/redis.js";
import connectDB from "../config/db.js";

import { extractTextFromImage } from "../services/ocrService.js";
import { classifyDocument } from "../services/classifyService.js";
import { extractStructuredData } from "../services/extractService.js";

import Document from "../models/Document.js";

// ================= DB CONNECT =================
connectDB();

// ================= WORKER =================
const worker = new Worker(

  "document-processing",

  async (job) => {

    try {

      console.log(
        "🔥 Processing:",
        job.data.fileName
      );

      // 🟡 Mark Processing
      await Document.findByIdAndUpdate(

        job.data.documentId,

        {
          status: "processing",
        }
      );

      // ================= OCR =================
      const text =
        await extractTextFromImage(
          job.data.filePath
        );

      // ================= CLEAN TEXT =================
      const cleanText = text
        .replace(/[^a-zA-Z0-9\s.:]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // ================= CLASSIFICATION =================
      const classification =
        classifyDocument(cleanText);

      // ================= STRUCTURED EXTRACTION =================
      const extractedData =
        extractStructuredData(cleanText);

      // ================= UPDATE DOC =================
      const updatedDocument =
        await Document.findByIdAndUpdate(

          job.data.documentId,

          {
            type: classification.type,

            confidence:
              classification.confidence,

            scores:
              classification.scores,

            cleanText,

            extractedData,

            status: "completed",
          },

          {
            new: true,
          }
        );

      console.log(
        "✅ Saved:",
        updatedDocument._id
      );

    } catch (error) {

      console.error(
        "❌ Worker Error:",
        error
      );

      // 🔴 Mark Failed
      if (job?.data?.documentId) {

        await Document.findByIdAndUpdate(

          job.data.documentId,

          {
            status: "failed",
          }
        );
      }
    }
  },

  // ================= REDIS =================
  {
    connection: redisConnection,
  }
);

console.log("🚀 Worker started");