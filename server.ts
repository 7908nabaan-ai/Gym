import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gemini-powered Bodybuilding & Nutrition Analysis endpoint
app.post("/api/gemini/analyze-progress", async (req, res) => {
  try {
    const { userData, progressLogs, calculationResults, question } = req.body;

    const ai = getAi();
    const prompt = `
You are an elite, evidence-based Sports Scientist and IFBB Pro / Natural Bodybuilding Coach specializing in hypertrophy biomechanics and contest/offseason macronutrient periodization.

Review the following bodybuilder profile, historical progress data, and mathematical muscle growth / nutrition calculations:

### User Profile:
- Gender: ${userData?.gender || "male"}
- Age: ${userData?.age || 25}
- Height: ${userData?.heightCm || 178} cm (${((userData?.heightCm || 178) / 2.54 / 12).toFixed(1)} ft)
- Current Weight: ${userData?.currentWeightKg || 80} kg (${((userData?.currentWeightKg || 80) * 2.20462).toFixed(1)} lbs)
- Estimated Body Fat: ${userData?.bodyFatPercentage || 14}%
- Training Experience: ${userData?.trainingYears || 2} years (${userData?.experienceLevel || "intermediate"})
- Current Phase Goal: ${userData?.goal || "lean_bulk"} (Target: ${userData?.surplusDeficitPercent || 10}% surplus/deficit)
- Training Frequency: ${userData?.trainingDaysPerWeek || 5} days/week

### Calculated Metrics:
- Estimated BMR: ${calculationResults?.bmr || 1800} kcal
- TDEE: ${calculationResults?.tdee || 2600} kcal
- Target Calories: ${calculationResults?.targetCalories || 2850} kcal
- Daily Protein: ${calculationResults?.proteinGrams || 180}g (${calculationResults?.proteinPerKgLbm || 2.6}g/kg LBM)
- Daily Fats: ${calculationResults?.fatGrams || 70}g (${calculationResults?.fatPercentage || 22}% of calories)
- Daily Carbs: ${calculationResults?.carbGrams || 375}g
- Current FFMI: ${calculationResults?.ffmi || 21.5} (Normalized: ${calculationResults?.normalizedFfmi || 21.8})
- Estimated Casey Butt Natural Muscular Limit: ${calculationResults?.maxLeanMassKg || 82} kg LBM
- Projected 12-Week Muscle Growth Potential: +${calculationResults?.projectedMuscleGainKg || 1.4} kg pure lean tissue

### Recent Progress Logs (Last Entries):
${JSON.stringify(progressLogs?.slice(-10) || [], null, 2)}

${question ? `### Specific User Inquiry:\n"${question}"\n` : ""}

### Instructions:
Provide an expert, highly actionable, evidence-based breakdown containing:
1. **Hypertrophy Velocity & Potential Assessment**: Analyze their growth rate based on Alan Aragon & Lyle McDonald empirical models. State whether their current progression velocity matches their training age.
2. **Nutritional Architecture Critique**: Evaluate the P-ratio (nutrient partitioning), calorie buffer (+/- surplus accuracy), protein distribution timing (e.g. 40g threshold per meal across 4-5 feedings with leucine threshold), and carbohydrate replenishment for glycogen supercompensation.
3. **Volume Landmark & Progressive Overload Recommendations**: Prescribe optimal weekly direct working sets (MEV/MAV/MRV) and RIR (Reps in Reserve 1-3) target.
4. **Plateau Busting & Specific Next Steps**: 3-4 bullet points of high-leverage adjustments (e.g. mini-cut timing, deload frequency, sodium/water manipulation, refeed schedule).

Format clearly with bold headers and crisp bullet points.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({
      analysis: response.text,
      status: "success",
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate AI hypertrophy analysis",
      status: "error",
    });
  }
});

// Vite dev server or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bodybuilding Calculator Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
