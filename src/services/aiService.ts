import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeVesselBehavior = async (vesselData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this maritime vessel behavior for suspicious activity: ${JSON.stringify(vesselData)}. 
      Consider speed, heading, and proximity to restricted zones. 
      Return a JSON object with: 
      - riskScore (0-100)
      - status (Safe, Warning, Suspicious)
      - reasoning (brief explanation)
      - predictedNextAction (what the ship might do next)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            status: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            predictedNextAction: { type: Type.STRING }
          },
          required: ["riskScore", "status", "reasoning"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};

export const predictIllegalFishing = async (vesselHistory: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Examine this vessel's movement history for patterns indicative of illegal fishing (e.g., circular paths, sudden stops in protected areas): ${JSON.stringify(vesselHistory)}.
      Return a JSON object with:
      - illegalFishingProbability (0-1)
      - detectedPatterns (array of strings)
      - recommendation (string)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            illegalFishingProbability: { type: Type.NUMBER },
            detectedPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING }
          },
          required: ["illegalFishingProbability", "detectedPatterns"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Illegal fishing prediction failed:", error);
    return null;
  }
};
