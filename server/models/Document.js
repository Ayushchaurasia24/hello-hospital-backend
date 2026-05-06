import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    fileName: String,

    type: [String],

    confidence: Object,

    scores: Object,

    cleanText: String,

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