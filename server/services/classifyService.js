export const classifyDocument = (text) => {
  const lowerText = text.toLowerCase();

  // 🔥 Keyword dictionary
  const categories = {
    Bill: ["bill", "amount", "total", "gst", "pharmacy", "invoice", "amt"],
    "Lab Report": ["test", "report", "hemoglobin", "range", "result", "lab"],
    Prescription: ["prescription", "tablet", "dosage", "doctor", "oral", "medicine"],
    Receipt: ["payment", "paid", "transaction", "receipt"],
    "Discharge Summary": ["discharge", "admitted", "diagnosis", "treatment"],
  };

  let scores = {};
  let totalMatches = 0;

  // Initialize scores
  for (let category in categories) {
    scores[category] = 0;
  }

  // 🔍 Score calculation
  for (let category in categories) {
    for (let keyword of categories[category]) {
      if (lowerText.includes(keyword)) {
        scores[category] += 1;
        totalMatches += 1;
      }
    }
  }

  // 🎯 Multi-label selection (threshold based)
  const THRESHOLD = 2;

  let matchedCategories = Object.entries(scores)
    .filter(([_, score]) => score >= THRESHOLD)
    .sort((a, b) => b[1] - a[1]) // sort by score desc
    .map(([category]) => category);

  // ⚠️ fallback if no strong match
  if (matchedCategories.length === 0) {
    let best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

    if (best[1] === 0) {
      return {
        type: ["Unknown"],
        confidence: {},
      };
    }

    matchedCategories = [best[0]];
  }

  // 📊 Confidence calculation (nice for demo)
  let confidence = {};
  for (let category of matchedCategories) {
    confidence[category] = (
      scores[category] / (totalMatches || 1)
    ).toFixed(2);
  }

  return {
    type: matchedCategories,   // 🔥 MULTI LABEL
    confidence,                // 🔥 BONUS (very impressive)
    scores                     // optional (debugging)
  };
};