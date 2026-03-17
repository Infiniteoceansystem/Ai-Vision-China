import { GoogleGenAI } from "@google/genai";

async function getBase64FromUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) return url;
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlobUrl(base64: string): string {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const blob = new Blob([u8arr], { type: mime });
  return URL.createObjectURL(blob);
}

async function compressImage(base64Str: string, maxWidth: number = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = base64Str;
  });
}

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  baseDelayMs: number = 3000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt >= maxRetries) {
        throw error;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Unreachable");
}

export async function generateMultipleImages(
  prompts: string[], 
  references: { clothing?: string, lowerClothing?: string, style?: string, model?: string, logo?: string, background?: string } = {}, 
  baseSeed?: number
): Promise<string[]> {
  const apiKey = (window as any).process?.env?.API_KEY || (window as any).process?.env?.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key is missing");

  const ai = new GoogleGenAI({ apiKey });

  let clothingBase64 = references.clothing ? await getBase64FromUrl(references.clothing) : null;
  let lowerClothingBase64 = references.lowerClothing ? await getBase64FromUrl(references.lowerClothing) : null;
  let styleBase64 = references.style ? await getBase64FromUrl(references.style) : null;
  let modelBase64 = references.model ? await getBase64FromUrl(references.model) : null;
  let logoBase64 = references.logo ? await getBase64FromUrl(references.logo) : null;
  let backgroundBase64 = references.background ? await getBase64FromUrl(references.background) : null;

  if (clothingBase64) clothingBase64 = await compressImage(clothingBase64, 512);
  if (lowerClothingBase64) lowerClothingBase64 = await compressImage(lowerClothingBase64, 512);
  if (styleBase64) styleBase64 = await compressImage(styleBase64, 512);
  if (modelBase64) modelBase64 = await compressImage(modelBase64, 512);
  if (logoBase64) logoBase64 = await compressImage(logoBase64, 512);
  if (backgroundBase64) backgroundBase64 = await compressImage(backgroundBase64, 512);

  const tasks = prompts.map((prompt, index) => {
    const parts: any[] = [];
    let imageIndex = 1;

    const addPart = (base64: string | null, instruction: string) => {
      if (base64) {
        const match = base64.match(/^data:(.*?);base64,(.+)$/);
        if (match) {
          parts.push({ text: `Image ${imageIndex}: ${instruction}` });
          parts.push({
            inlineData: {
              data: match[2],
              mimeType: match[1],
            },
          });
          imageIndex++;
        }
      }
    };

    addPart(modelBase64, "Model reference: Use this person's face, body type, and pose as the base.");
    addPart(clothingBase64, "Upper clothing reference: The model MUST wear this exact upper-body clothing item. Ensure the fit and fabric look realistic.");
    addPart(lowerClothingBase64, "Lower clothing reference: The model MUST wear this exact lower-body clothing item. Ensure the fit and fabric look realistic.");
    addPart(backgroundBase64, "Background reference: Place the model in this exact background environment.");
    addPart(logoBase64, "Detail reference: Include this logo/pattern exactly as shown on the clothing.");
    addPart(styleBase64, "Style reference: Imitate the lighting, color grading, and overall atmosphere.");

    const finalPrompt = imageIndex > 1 
      ? `Generate a high-quality, realistic street photography style image based on the references. Ensure the subject looks natural, casual, and modest (safe-for-work). Pay special attention to realistic and naturally posed hands. The overall vibe should be like a candid, everyday lifestyle photo.\n\nPrompt: ${prompt}`
      : `Generate a high-quality, realistic street photography style image. Ensure the subject looks natural, casual, and modest (safe-for-work). Pay special attention to realistic and naturally posed hands. The overall vibe should be like a candid, everyday lifestyle photo.\n\nPrompt: ${prompt}`;

    parts.push({ text: finalPrompt });

    return async () => {
      try {
        const config: any = {
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
        };

        const response = await withRetry(() => ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: { parts },
          config,
        }));
        
        const candidate = response.candidates?.[0];
        if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
          if (candidate.finishReason === 'PROHIBITED_CONTENT' || candidate.finishReason === 'SAFETY' || candidate.finishReason === 'IMAGE_SAFETY') {
            throw new Error(`生成被拒绝：图片或提示词触发了安全限制 (${candidate.finishReason})。请尝试更换参考图（避免暴露、血腥等内容）或调整提示词。`);
          }
          throw new Error(`Image generation stopped due to: ${candidate.finishReason}`);
        }

        for (const part of candidate?.content?.parts || []) {
          if (part.inlineData) {
            const base64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            return base64ToBlobUrl(base64);
          }
        }
        
        throw new Error("No inlineData found in response: " + JSON.stringify({
          finishReason: candidate?.finishReason,
          parts: candidate?.content?.parts?.map(p => Object.keys(p))
        }));
      } catch (e) {
        console.error("Image generation error:", e);
        throw e;
      }
    };
  });

  // Process all tasks concurrently but with a slight stagger to avoid hitting rate limits simultaneously
  const results = await Promise.all(tasks.map(async (task, index) => {
    if (index > 0) {
      await new Promise(resolve => setTimeout(resolve, index * 1500)); // Stagger by 1.5s
    }
    return task();
  }));
  
  const validResults = results.filter(Boolean) as string[];
  if (validResults.length === 0) throw new Error("No images generated");
  return validResults;
}

export async function generateHighEndPrompt(
  imageUrl: string,
  category: string
): Promise<string> {
  const apiKey = (window as any).process?.env?.API_KEY || (window as any).process?.env?.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key is missing");

  const ai = new GoogleGenAI({ apiKey });
  let imageBase64 = await getBase64FromUrl(imageUrl);
  
  // Compress the image before sending to the text model to prevent 503 Deadline Exceeded
  imageBase64 = await compressImage(imageBase64, 1024);

  const match = imageBase64.match(/^data:(.*?);base64,(.+)$/);
  if (!match) throw new Error("Invalid image format");

  const promptText = `请深度分析这张图片，并为 "${category}" 风格生成专业的高级 AI 视频动态提示词。
请基于这张具体的图片，提供一段提示词（请全部使用中文输出，并且只输出一段话，不需要多复杂）：

视频动态提示词 (Image-to-Video)：重点描述这张图片中的人物应该如何动起来。描述相机的运动，人物的动作（例如：头发在风中飘动、轻微的呼吸、向前走），以及环境的动态。
【重要安全与质量约束】：
1. 动作必须像日常街拍一样自然、随性。
2. 手部动作保持简单真实（如自然下垂、插兜、拿咖啡或手机等），避免复杂的手指交叉或不自然的扭曲。
3. 内容必须是完全健康、日常的穿搭展示（SFW），风格清新得体，避免任何敏感、暴露或令人不适的暗示。
4. 不要产生转身、大幅度跑跳等容易有破绽的动作。

请严格按照以下格式输出（全部使用中文）：

### 🎬 视频动态提示词
(在这里填写中文视频提示词，一段话)`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: match[2],
            mimeType: match[1],
          }
        },
        { text: promptText }
      ]
    }
  });

  return response.text || "生成失败，请重试。";
}

export async function editImage(imageUrl: string, prompt: string, referenceImage?: string): Promise<string> {
  const apiKey = (window as any).process?.env?.API_KEY || (window as any).process?.env?.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const parts: any[] = [];
  
  let base64Image = await getBase64FromUrl(imageUrl);
  base64Image = await compressImage(base64Image, 1024); // Compress to prevent 503 errors
  const match = base64Image.match(/^data:(.*?);base64,(.+)$/);
  if (!match) throw new Error("Invalid image format");
  parts.push({
    inlineData: {
      data: match[2],
      mimeType: match[1],
    },
  });

  if (referenceImage) {
    let refBase64 = await getBase64FromUrl(referenceImage);
    refBase64 = await compressImage(refBase64, 1024);
    const refMatch = refBase64.match(/^data:(.*?);base64,(.+)$/);
    if (refMatch) {
      parts.push({
        inlineData: {
          data: refMatch[2],
          mimeType: refMatch[1],
        },
      });
    }
  }

  const finalPrompt = `Edit the image based on the following instructions. Ensure the result is a high-quality, realistic street photography style image. Keep the subject looking natural, casual, and modest (safe-for-work), with realistic and naturally posed hands.\n\nInstructions: ${prompt}`;
  parts.push({ text: finalPrompt });

  const response = await withRetry(() => ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts },
    config: {
      imageConfig: {
        imageSize: "4K"
      },
      tools: []
    }
  }));

  const candidate = response.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
    if (candidate.finishReason === 'PROHIBITED_CONTENT' || candidate.finishReason === 'SAFETY' || candidate.finishReason === 'IMAGE_SAFETY') {
      throw new Error(`生成被拒绝：图片或提示词触发了安全限制 (${candidate.finishReason})。请尝试更换参考图（避免暴露、血腥等内容）或调整提示词。`);
    }
    throw new Error(`Image generation stopped due to: ${candidate.finishReason}`);
  }

  for (const part of candidate?.content?.parts || []) {
    if (part.inlineData) {
      const base64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      return base64ToBlobUrl(base64);
    }
  }
  
  throw new Error("No inlineData found in response: " + JSON.stringify({
    finishReason: candidate?.finishReason,
    parts: candidate?.content?.parts?.map(p => Object.keys(p))
  }));
}

export async function generateCopywriting(image: string | null, context: string, platform: string): Promise<string> {
  const apiKey = (window as any).process?.env?.API_KEY || (window as any).process?.env?.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const parts: any[] = [];
  if (image) {
    const base64Image = await getBase64FromUrl(image);
    const match = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          data: match[2],
          mimeType: match[1],
        },
      });
    }
  }
  
  let platformPrompt = "";
  switch (platform) {
    case "小红书":
      platformPrompt = "小红书风格的爆款文案。要求：\n1. 标题吸引人（带emoji，让人有点击欲望）\n2. 正文分段清晰，语气活泼、真实、种草（可以使用“绝绝子”、“姐妹们”等词汇，但不要过度）\n3. 突出亮点和细节\n4. 最后带上相关的热门话题标签（#标签）。";
      break;
    case "抖音":
      platformPrompt = "抖音短视频/图文风格的文案。要求：\n1. 开头要有强烈的悬念或痛点共鸣，抓住眼球（前3秒黄金法则）\n2. 语言口语化、接地气、有节奏感\n3. 引导互动（如“评论区告诉我”、“点赞收藏”）\n4. 包含热门标签。";
      break;
    case "独立站":
      platformPrompt = "品牌独立站（DTC）风格的文案。要求：\n1. 语气高级、优雅、专业，体现品牌调性与质感\n2. 强调设计理念、材质工艺或独特的生活方式\n3. 结构严谨，适合作为商品详情页的描述或品牌故事\n4. 结尾带有清晰的行动号召（Call to Action）。";
      break;
    case "电商":
      platformPrompt = "传统电商（如淘宝/天猫/京东）风格的带货文案。要求：\n1. 核心卖点前置，直击消费者需求\n2. 强调性价比、促销信息或实用功能\n3. 语言极具煽动性和紧迫感（如“限时特惠”、“手慢无”）\n4. 条理清晰，方便快速阅读。";
      break;
    default:
      platformPrompt = "适合该图片的优质文案。";
  }

  parts.push({ text: `请根据这张图片（如果有）和以下上下文，生成一段${platformPrompt}\n\n上下文：${context}` });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
  });

  return response.text || "";
}
