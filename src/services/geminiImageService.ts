import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// 初始化 Gemini 客户端
// 注意：API Key 会在用户选择后自动通过 process.env.GEMINI_API_KEY 注入
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function createErrorPlaceholder(message: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f8d7da';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#721c24';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Image Generation Blocked', 256, 236);
    ctx.font = '14px sans-serif';
    ctx.fillText(message, 256, 276);
  }
  return canvas.toDataURL('image/png');
}

export async function generateImageWithGemini(
  prompt: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "1:4" | "1:8" | "4:1" | "8:1" = "1:1"
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K" // 默认使用 1K 分辨率
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_IMAGE_HATE,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_IMAGE_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      if (candidate.finishReason === 'PROHIBITED_CONTENT' || candidate.finishReason === 'SAFETY' || candidate.finishReason === 'IMAGE_SAFETY') {
        console.warn(`Image generation blocked: ${candidate.finishReason}`);
        return createErrorPlaceholder(`安全限制 (${candidate.finishReason})`);
      }
      throw new Error(`Image generation stopped due to: ${candidate.finishReason}`);
    }

    // 遍历响应部分以找到图像
    for (const part of candidate?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    throw new Error("未找到生成的图像");
  } catch (error) {
    console.error("Gemini 图像生成错误:", error);
    throw error;
  }
}
