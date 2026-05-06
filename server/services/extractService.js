export const extractStructuredData = (text) => {
  const data = {};

  // 🧍 Patient Name
  const nameMatch = text.match(/name[:\s]+([A-Z\s]+?)(?:age|$)/i);
  if (nameMatch) {
    data.patientName = nameMatch[1].trim();
  }

  // 📅 Date (multi-strategy + cleanup)
  let dateMatch =
    text.match(/date[:\s]+([^\n]{5,20})/i) ||
    text.match(
      /\b\d{1,2}\s?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s?\d{4}\b/i
    );

  if (dateMatch) {
    let date = dateMatch[1] || dateMatch[0];

    // Fix OCR mistakes
    date = date
      .replace(/apz/i, "apr")
      .replace(/janv/i, "jan")
      .replace(/febr/i, "feb");

    // Keep only first 3 parts (DD MMM YYYY)
    const parts = date.split(" ").filter(Boolean);
    if (parts.length >= 3) {
      data.date = `${parts[0]} ${parts[1]} ${parts[2]}`;
    }
  }

  // 💰 Amount
  const amountMatch = text.match(/(total|amt|amount)[^\d]{0,10}(\d{2,6})/i);
  if (amountMatch) {
    data.amount = amountMatch[2];
  }

  // 💊 Medicines (context-based extraction)
  const lines = text.split("\n");
  let medicines = [];

  for (let line of lines) {
    const lower = line.toLowerCase();

    if (
      lower.includes("tablet") ||
      lower.includes("capsule") ||
      lower.includes("oral")
    ) {
      const match = line.match(/\b[A-Z]{4,}\b/);
      if (match) {
        medicines.push(match[0]);
      }
    }
  }

  // 🔁 Fallback (if no medicines found)
  if (medicines.length === 0) {
    const fallback = text.match(/\b[A-Z]{5,}\b/g);
    if (fallback) {
      medicines = fallback.slice(0, 3);
    }
  }

  // 🚫 Final filtering (remove obvious garbage)
  const blacklist = [
    "HOSPITAL",
    "MEDICAL",
    "SOCIETY",
    "PHARMACY",
    "BILL",
    "NAME",
    "DATE",
    "AMOUNT",
    "MADHYA",
    "PRADESH",
    "CHRISTIAN",
    "ROAD",
    "DISTRICT",
    "STATE",
  ];

  data.medicines = [...new Set(medicines)].filter(
    (word) =>
      !blacklist.includes(word) &&
      !word.includes("HOSP") &&
      !word.includes("MED") &&
      word.length < 15
  );

  return data;
};