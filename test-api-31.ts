import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key");
    return;
  }
  const ai = new GoogleGenAI({ apiKey });

  // Create a dummy 1x1 image
  const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: dummyBase64,
              mimeType: "image/png",
            }
          },
          { text: "Image 1: Clothing reference." },
          {
            inlineData: {
              data: dummyBase64,
              mimeType: "image/png",
            }
          },
          { text: "Image 2: Style reference." },
          { text: "Generate a person wearing the clothing in Image 1 with the style of Image 2." }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
          imageSize: "4K"
        },
        tools: [],
        toolConfig: {
          functionCallingConfig: {
            mode: "NONE"
          }
        }
      }
    });
    console.log("Success:", response.candidates?.[0]?.finishReason);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

test();
