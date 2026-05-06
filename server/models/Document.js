import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    fileName: String,

    type: [String],

    confidence: Object,

    scores: Object,

    cleanText: String,

    status: {
      type: String,
      enum: [
        "queued",
        "processing",
        "completed",
        "failed",
      ],
      default: "queued",
    },

    extractedData: {
      patientName: String,
      date: String,
      amount: String,
      medicines: [String],
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;