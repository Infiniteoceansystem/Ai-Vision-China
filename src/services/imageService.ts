import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

let ai: GoogleGenAI;
function getAi() {
  if (!ai) {
    const apiKey = (window as any).process?.env?.API_KEY || (window as any).process?.env?.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key is missing");
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

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

export async function generateModelPerspective(
  prompt: string,
  modelImage: string
): Promise<string> {
  const response = await getAi().models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          text: `Based on the provided image, generate a new perspective: ${prompt}`,
        },
        {
          inlineData: {
            data: modelImage.split(',')[1],
            mimeType: 'image/jpeg',
          },
        },
      ],
    },
    config: {
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

  for (const part of candidate?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/jpeg;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export async function applyVirtualTryOn(
  modelImage: string,
  clothingImage: string,
  guidelines?: string
): Promise<string> {
  const response = await getAi().models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          text: `Apply the clothing from the second image onto the person in the first image. ${guidelines || ''}`,
        },
        {
          inlineData: {
            data: modelImage.split(',')[1],
            mimeType: 'image/jpeg',
          },
        },
        {
          inlineData: {
            data: clothingImage.split(',')[1],
            mimeType: 'image/jpeg',
          },
        },
      ],
    },
    config: {
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

  for (const part of candidate?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/jpeg;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export async function upscaleImage(imageUrl: string): Promise<string> {
  const response = await getAi().models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          text: 'Upscale this image to 4K resolution.',
        },
        {
          inlineData: {
            data: imageUrl.split(',')[1],
            mimeType: 'image/jpeg',
          },
        },
      ],
    },
    config: {
      imageConfig: {
        imageSize: "4K"
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
    }
  });
  
  const candidate = response.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
    if (candidate.finishReason === 'PROHIBITED_CONTENT' || candidate.finishReason === 'SAFETY' || candidate.finishReason === 'IMAGE_SAFETY') {
      console.warn(`Image generation blocked: ${candidate.finishReason}`);
      return createErrorPlaceholder(`安全限制 (${candidate.finishReason})`);
    }
    throw new Error(`Image generation stopped due to: ${candidate.finishReason}`);
  }

  for (const part of candidate?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/jpeg;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}
