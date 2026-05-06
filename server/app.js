import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});