import { useState, useRef } from "react";
import Sidebar from "./Sidebar";
import Workspace from "./Workspace";
import PropertiesPanel from "./PropertiesPanel";
import { generateMultipleImages, editImage, generateHighEndPrompt } from "../services/gemini";
import { X, Loader2, FileText } from "lucide-react";
import { createCollage } from "../utils/collage";
import { flipImage, cropImageTo9x16 } from "../utils/image";
import html2canvas from "html2canvas";

export type ToolType = "tryon" | "character" | "edit" | "text" | "collage" | "prompt";

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

export default function Editor() {
  const [activeTool, setActiveTool] = useState<ToolType>("tryon");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [texts, setTexts] = useState<TextOverlay[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [promptCategory, setPromptCategory] = useState("电商展示 (E-commerce)");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const workspaceRef = useRef<HTMLDivElement>(null);

  const [isCharacterExpanded, setIsCharacterExpanded] = useState(true);

  const handleGenerate = async (prompts: string[], references?: any, seed?: number) => {
    setIsLoading(true);
    setIsCharacterExpanded(false); // Shrink panel when generating
    setLoadingMessage("正在使用网络搜索生成图像...");
    try {
      const imgs = await generateMultipleImages(prompts, references, seed);
      setGeneratedImages(prev => [...prev, ...imgs]);
      setCurrentImage(imgs[0]);
      setTexts([]); // Clear texts on new image
    } catch (error) {
      console.error(error);
      alert("生成图像失败，请重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (prompt: string, referenceImage?: string) => {
    if (!currentImage) return;
    setIsLoading(true);
    setLoadingMessage("正在应用 AI 编辑...");
    try {
      const img = await editImage(currentImage, prompt, referenceImage);
      setGeneratedImages(prev => [...prev, img]);
      setCurrentImage(img);
    } catch (error) {
      console.error(error);
      alert("编辑图像失败，请重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlipImage = async (horizontal: boolean, vertical: boolean) => {
    if (!currentImage) return;
    setIsLoading(true);
    setLoadingMessage("正在翻转图像...");
    try {
      const img = await flipImage(currentImage, horizontal, vertical);
      setGeneratedImages(prev => [...prev, img]);
      setCurrentImage(img);
    } catch (error) {
      console.error(error);
      alert("翻转图像失败，请重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddText = () => {
    const newText: TextOverlay = {
      id: Date.now().toString(),
      text: "双击以编辑",
      x: 50,
      y: 50,
      fontSize: 32,
      color: "#1c1917",
      fontFamily: "Cormorant Garamond",
    };
    setTexts([...texts, newText]);
    setSelectedTextId(newText.id);
  };

  const handleAddSpecificText = (text: string) => {
    const newText: TextOverlay = {
      id: Date.now().toString(),
      text: text,
      x: 50,
      y: 50,
      fontSize: 24,
      color: "#1c1917",
      fontFamily: "Inter",
    };
    setTexts([...texts, newText]);
    setSelectedTextId(newText.id);
    setActiveTool("edit");
  };

  const handleUpdateText = (id: string, updates: Partial<TextOverlay>) => {
    setTexts(texts.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleDeleteText = (id: string) => {
    setTexts(texts.filter((t) => t.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  const handleGeneratePrompt = async () => {
    if (!currentImage) return;
    
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
    }

    setIsPromptLoading(true);
    try {
      const prompt = await generateHighEndPrompt(currentImage, promptCategory);
      setGeneratedPrompt(prompt);
      setActiveTool("edit");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "提示词生成失败，请重试。");
    } finally {
      setIsPromptLoading(false);
    }
  };

  const handleExport = async () => {
    if (!currentImage) return;
    
    if (texts.length > 0 && workspaceRef.current) {
      try {
        const canvas = await html2canvas(workspaceRef.current, {
          useCORS: true,
          backgroundColor: null,
          allowTaint: true,
          scale: 4, // 增加缩放比例以导出高清图片
        });
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "studio-export.png";
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Export failed", error);
        alert("导出图像失败。");
      }
    } else {
      const link = document.createElement("a");
      link.download = "studio-export.png";
      link.href = currentImage;
      link.click();
    }
  };

  const handleCreateCollage = async (type: '2x2' | '1x2' | '2x1', selectedImages: string[]) => {
    if (selectedImages.length === 0) return;
    setIsLoading(true);
    setLoadingMessage("正在生成拼图...");
    try {
      const collage = await createCollage(selectedImages, type);
      setGeneratedImages(prev => [...prev, collage]);
      setCurrentImage(collage);
      setActiveTool("edit"); // Switch to edit mode after collage
    } catch (error) {
      console.error(error);
      alert("拼图生成失败，请重试。");
    } finally {
      setIsLoading(false);
    }
  };

  // Hide main when character panel is expanded
  const shouldHideMain = activeTool === "character" && isCharacterExpanded && !isLoading;

  return (
    <div className="flex h-screen bg-[#fafaf9] text-stone-900 font-sans overflow-hidden">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />

      <main className={`flex-1 flex flex-col relative transition-all duration-500 ${shouldHideMain ? 'hidden' : 'flex'}`}>
        <header className="h-16 border-b border-stone-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-10">
          <h2 className="font-serif text-lg font-medium text-stone-800 tracking-wide">
            工作区
          </h2>
          <div className="flex items-center gap-4">
            <label className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-full cursor-pointer transition-colors shadow-sm">
              上传图片
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const result = e.target?.result as string;
                      setCurrentImage(result);
                      setGeneratedImages(prev => [...prev, result]);
                      setTexts([]);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            {generatedImages.length > 1 && (
              <button
                onClick={() => {
                  generatedImages.forEach((img, index) => {
                    const link = document.createElement("a");
                    link.download = `studio-export-${index + 1}.png`;
                    link.href = img;
                    link.click();
                  });
                }}
                className="px-5 py-2 bg-stone-100 text-stone-800 text-sm font-medium rounded-full hover:bg-stone-200 transition-colors shadow-sm"
              >
                一键下载全部
              </button>
            )}
            <button
              onClick={() => {
                setActiveTool("edit");
              }}
              disabled={!currentImage}
              className="px-5 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-full hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              生成高级提示词
            </button>
            <button
              onClick={handleExport}
              disabled={!currentImage}
              className="px-5 py-2 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              下载当前图片
            </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden bg-[#fafaf9] flex flex-col items-center justify-center p-8">
          <Workspace
            ref={workspaceRef}
            currentImage={currentImage}
            texts={texts}
            selectedTextId={selectedTextId}
            onSelectText={setSelectedTextId}
            onUpdateText={handleUpdateText}
          />

          {generatedImages.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 bg-white/90 p-3 rounded-2xl backdrop-blur-md border border-stone-200 shadow-xl max-w-[80%] overflow-x-auto custom-scrollbar">
              {generatedImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(img)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${currentImage === img ? 'border-stone-900 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Generated ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <div className="w-12 h-12 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin mb-6"></div>
              <p className="text-stone-800 font-serif text-lg tracking-wide animate-pulse">
                {loadingMessage}
              </p>
            </div>
          )}

          {/* Prompt Loading Overlay */}
          {isPromptLoading && (
            <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-sm text-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <h3 className="text-lg font-bold text-stone-800">正在生成高级提示词</h3>
                <p className="text-sm text-stone-500 leading-relaxed">正在分析图片并生成专业提示词...</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <PropertiesPanel
        activeTool={activeTool}
        onGenerate={handleGenerate}
        onEdit={handleEdit}
        onAddText={handleAddText}
        onAddSpecificText={handleAddSpecificText}
        texts={texts}
        selectedTextId={selectedTextId}
        onUpdateText={handleUpdateText}
        onDeleteText={handleDeleteText}
        hasImage={!!currentImage}
        currentImage={currentImage}
        generatedImages={generatedImages}
        onCreateCollage={handleCreateCollage}
        onFlipImage={handleFlipImage}
        promptCategory={promptCategory}
        setPromptCategory={setPromptCategory}
        generatedPrompt={generatedPrompt}
        isPromptLoading={isPromptLoading}
        onGeneratePrompt={handleGeneratePrompt}
        isLoading={isLoading}
        isCharacterExpanded={isCharacterExpanded}
        setIsCharacterExpanded={setIsCharacterExpanded}
      />
    </div>
  );
}
