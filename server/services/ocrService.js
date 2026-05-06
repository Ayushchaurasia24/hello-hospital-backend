import Tesseract from "tesseract.js";
import sharp from "sharp";
import fs from "fs";

export const extractTextFromImage = async (imagePath) => {
  try {
    const processedImagePath = imagePath + "-processed.jpg";

    // 🔥 Preprocess image
    await sharp(imagePath)
      .grayscale()         // remove colors
      .normalize()         // improve contrast
      .sharpen()           // make text clearer
      .toFile(processedImagePath);

    const result = await Tesseract.recognize(processedImagePath, "eng", {
      logger: (m) => console.log(m),
    });

    // delete processed image (optional)
    fs.unlinkSync(processedImagePath);

    return result.data.text;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
};