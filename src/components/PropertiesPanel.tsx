import React, { useState } from "react";
import { ToolType, TextOverlay, GeneratedImage } from "./Editor";
import { 
  Wand2, Type, Trash2, Plus, Upload, Sparkles, LayoutGrid, FileText, UserSquare, Shirt, 
  ChevronDown, ChevronUp, Camera, User, Move, Focus, Maximize2, Minimize2, 
  ArrowDownLeft, ArrowUpRight, UserCheck, Zap, Image as ImageIcon,
  Coffee, Eye, Smile, RotateCcw
} from "lucide-react";
import { generateCopywriting } from "../services/gemini";

interface PropertiesPanelProps {
  activeTool: ToolType;
  onGenerate: (prompts: string[], references?: any, seed?: number) => void;
  onEdit: (prompt: string, referenceImage?: string) => void;
  onAddText: () => void;
  onAddSpecificText: (text: string) => void;
  texts: TextOverlay[];
  selectedTextId: string | null;
  onUpdateText: (id: string, updates: Partial<TextOverlay>) => void;
  onDeleteText: (id: string) => void;
  hasImage: boolean;
  currentImage: string | null;
  generatedImages: GeneratedImage[];
  onCreateCollage: (type: '2x2' | '1x2' | '2x1', images: string[]) => void;
  onFlipImage: (horizontal: boolean, vertical: boolean) => void;
  promptCategory: string;
  setPromptCategory: (category: string) => void;
  generatedPrompt: string;
  isPromptLoading: boolean;
  onGeneratePrompt: () => void;
  isLoading: boolean;
  isCharacterExpanded: boolean;
  setIsCharacterExpanded: (expanded: boolean) => void;
}

export default function PropertiesPanel({
  activeTool,
  onGenerate,
  onEdit,
  onAddText,
  onAddSpecificText,
  texts,
  selectedTextId,
  onUpdateText,
  onDeleteText,
  hasImage,
  currentImage,
  generatedImages,
  onCreateCollage,
  onFlipImage,
  promptCategory,
  setPromptCategory,
  generatedPrompt,
  isPromptLoading,
  onGeneratePrompt,
  isLoading,
  isCharacterExpanded,
  setIsCharacterExpanded,
}: PropertiesPanelProps) {
  const isCharacterActive = activeTool === "character" || activeTool === "tryon";
  const shouldExpand = isCharacterActive && isCharacterExpanded && !isLoading;

  return (
    <aside className={`bg-white border-l border-stone-200 flex flex-col h-full overflow-y-auto shadow-sm z-20 transition-all duration-500 ease-in-out ${shouldExpand ? 'flex-1' : 'w-80'}`}>
      <header className="h-16 border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 bg-white/95 backdrop-blur z-10">
        <h2 className="font-serif text-lg font-medium text-stone-800 tracking-wide flex items-center gap-2">
          {(activeTool === "tryon" || activeTool === "character") && (
            <>
              <UserSquare className="w-4 h-4" /> AI 模特换装
            </>
          )}
          {activeTool === "edit" && (
            <>
              <Wand2 className="w-4 h-4" /> AI 编辑
            </>
          )}
        </h2>
        {(activeTool === "tryon" || activeTool === "character") && (
          <button 
            onClick={() => setIsCharacterExpanded(!isCharacterExpanded)}
            className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
          >
            {shouldExpand ? "收起面板" : "展开面板"}
          </button>
        )}
      </header>

      <div className="p-8 flex-1">
        {activeTool === "tryon" && <CharacterPanel onGenerate={onGenerate} isExpanded={shouldExpand} />}
        {activeTool === "character" && <CharacterPanel onGenerate={onGenerate} isExpanded={shouldExpand} />}
        {activeTool === "edit" && (
          <EditPanel 
            onEdit={onEdit} 
            hasImage={hasImage} 
            onFlipImage={onFlipImage} 
            generatedImages={generatedImages} 
            onCreateCollage={onCreateCollage} 
            currentImage={currentImage}
            onAddText={onAddText}
            onAddSpecificText={onAddSpecificText}
            texts={texts}
            selectedTextId={selectedTextId}
            onUpdateText={onUpdateText}
            onDeleteText={onDeleteText}
            promptCategory={promptCategory}
            setPromptCategory={setPromptCategory}
            generatedPrompt={generatedPrompt}
            isPromptLoading={isPromptLoading}
            onGeneratePrompt={onGeneratePrompt}
          />
        )}
      </div>
    </aside>
  );
}

function PromptPanel({ 
  hasImage, 
  promptCategory, 
  setPromptCategory, 
  generatedPrompt,
  isPromptLoading,
  onGeneratePrompt
}: { 
  hasImage: boolean; 
  promptCategory: string; 
  setPromptCategory: (cat: string) => void;
  generatedPrompt: string;
  isPromptLoading: boolean;
  onGeneratePrompt: () => void;
}) {
  const categories = [
    "电商展示 (E-commerce)",
    "社交媒体 (Social Media)",
    "艺术写真 (Artistic Portrait)"
  ];

  const videoPrompt = generatedPrompt.replace('### 🎬 视频动态提示词', '').trim();

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
        <h3 className="text-sm font-bold text-stone-800 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          视频动态提示词生成
        </h3>
        <p className="text-sm text-stone-500 leading-relaxed mb-4">
          一键根据您当前选择的图片，生成适合 Kling、Sora、Runway 等 AI 视频工具的高级动态提示词。
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">选择风格种类</label>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
              <input 
                type="radio" 
                name="promptCategory" 
                value={cat} 
                checked={promptCategory === cat}
                onChange={(e) => setPromptCategory(e.target.value)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-stone-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {!hasImage ? (
        <div className="text-center p-6 bg-stone-50 rounded-2xl border border-stone-100 border-dashed">
          <p className="text-sm text-stone-500">
            请先在左侧生成或上传一张图片，然后再生成提示词。
          </p>
        </div>
      ) : (
        <button
          onClick={onGeneratePrompt}
          disabled={isPromptLoading}
          className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPromptLoading ? "生成中..." : "一键生成提示词"}
        </button>
      )}

      {generatedPrompt && (
        <div className="mt-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                视频动态提示词
              </label>
              <button
                onClick={() => navigator.clipboard.writeText(videoPrompt)}
                className="text-[10px] font-medium text-stone-500 hover:text-stone-900 transition-colors bg-stone-100 px-2 py-1 rounded-md"
              >
                复制
              </button>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-xs text-stone-300 whitespace-pre-wrap leading-relaxed shadow-inner font-mono max-h-64 overflow-y-auto">
              {videoPrompt}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 定义可视化选项 - 小红书张力风格 (增强动态与表情)
const POSE_OPTIONS = [
  { id: "walking", label: "自信大步", icon: Zap, desc: "大步流星，面部带轻盈自信的微笑，发丝飞扬" },
  { id: "turn", label: "灵动回眸", icon: UserCheck, desc: "转身瞬间回头，眼神灵动有神，充满情绪张力" },
  { id: "gesture", label: "张力手势", icon: Sparkles, desc: "手部轻抚脸颊或整理衣领，眼神清冷高级，富有细节" },
  { id: "street", label: "随性街拍", icon: Camera, desc: "自然行走中被抓拍，表情自然放松，充满生活气息" },
  { id: "lean", label: "高级感侧影", icon: Maximize2, desc: "身体微侧，展现优美曲线，眼神温柔而坚定" },
  { id: "sunglasses", label: "调整墨镜", icon: Eye, desc: "手部轻触墨镜边缘，眼神酷飒，充满时尚态度" },
  { id: "laughing", label: "开怀大笑", icon: Smile, desc: "极具感染力的笑容，展现真实、自然的情绪瞬间" },
];

const ANGLE_OPTIONS = [
  { id: "full", label: "全景视角", icon: Maximize2, desc: "展示全身搭配及环境" },
  { id: "medium", label: "中景视角", icon: LayoutGrid, desc: "膝盖以上的半身构图" },
  { id: "side", label: "侧向视角", icon: ArrowUpRight, desc: "增加画面深度和时尚感" },
  { id: "high", label: "高角度俯拍", icon: ArrowDownLeft, desc: "具有艺术感和空间感的视角" },
  { id: "back", label: "背面视角", icon: UserCheck, desc: "展示服装背面设计细节" },
  { id: "eye-level", label: "平视视线", icon: Eye, desc: "与模特视线齐平，亲切、真实且自然" },
];

const PLACEMENT_OPTIONS = [
  { id: "center", label: "居中", icon: Focus },
  { id: "left", label: "靠左", icon: ArrowDownLeft },
  { id: "right", label: "靠右", icon: ArrowUpRight },
];

function CharacterPanel({ onGenerate, isExpanded }: { onGenerate: (prompts: string[], references?: any, seed?: number) => void, isExpanded?: boolean }) {
    const [formData, setFormData] = useState({
    gender: "女性",
    ageCategory: "青少年",
    ageValue: 18,
    ethnicity: "亚洲人",
    height: 165,
    count: 4,
    imageSettings: Array(50).fill(null).map((_, i) => ({
      pose: POSE_OPTIONS[i % POSE_OPTIONS.length].label,
      poseId: POSE_OPTIONS[i % POSE_OPTIONS.length].id,
      cameraAngle: ANGLE_OPTIONS[i % ANGLE_OPTIONS.length].label,
      angleId: ANGLE_OPTIONS[i % ANGLE_OPTIONS.length].id,
      placement: "居中"
    }))
  });

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const [clothingImage, setClothingImage] = useState<string | null>(null);
  const [lowerBodyImage, setLowerBodyImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setter(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    
    if (e.target.name === 'count') {
      const newCount = Number(value);
      if (newCount > formData.imageSettings.length) {
        // 动态增加配置数组
        const additionalSettings = Array(newCount - formData.imageSettings.length).fill(null).map((_, i) => {
          const idx = formData.imageSettings.length + i;
          return {
            pose: POSE_OPTIONS[idx % POSE_OPTIONS.length].label,
            poseId: POSE_OPTIONS[idx % POSE_OPTIONS.length].id,
            cameraAngle: ANGLE_OPTIONS[idx % ANGLE_OPTIONS.length].label,
            angleId: ANGLE_OPTIONS[idx % ANGLE_OPTIONS.length].id,
            placement: "居中"
          };
        });
        setFormData({ 
          ...formData, 
          count: newCount, 
          imageSettings: [...formData.imageSettings, ...additionalSettings] 
        });
        return;
      }
    }
    
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clothingImage || !modelImage) {
      alert("请上传服装图和场景/模特参考图");
      return;
    }

    const prompts: string[] = [];
    let basePrompt = `A vibrant, high-energy street photography shot.
Subject: A ${formData.ageValue}-year-old ${formData.ethnicity} ${formData.gender} model with a natural, expressive look.
Task: 
1. Virtual Try-On: The model MUST wear the exact clothing item shown in the clothing reference image. If the item is a full-body piece (like a dress), do NOT add any additional pants or jeans.
${lowerBodyImage ? '2. Virtual Try-On (Lower Body): The model MUST wear the exact lower-body clothing item shown in the lower-body clothing reference image. Do not substitute it with jeans or any other item.' : '2. Outfit Completion: If the clothing reference is only an upper-body item, automatically design a matching lower-body item. CRITICAL: Maintain strict consistency for this lower-body item across all images in this set. If you choose a specific style (e.g., a black skirt), use that exact same style for all generated images.'}
3. Model Consistency: The model's face and body type should match the model reference image, but with a more relaxed, candid vibe.
4. Environment: Place the model in a vibrant urban environment or the exact setting shown in the background reference image. The lighting should be natural, as if captured during a walk in the city.
5. Style: Street snap style, candid moment, natural sunlight, urban aesthetic, vivid colors, eye-catching composition.
6. Consistency & Safety: Ensure the model\'s outfit is perfectly consistent across all images. No unexpected items like jeans should appear if they are not part of the original design. Adhere strictly to safety guidelines; the content must be professional and high-end.`;

    for (let i = 0; i < formData.count; i++) {
      const setting = formData.imageSettings[i];
      prompts.push(basePrompt + `
Camera Angle: ${setting.cameraAngle} view, candid street photography style.
Pose & Expression: ${setting.pose}. The model should look natural and spontaneous, as if they are genuinely enjoying their time in the city.
Placement: The model is positioned at the ${setting.placement} of the frame.
Vibe: Spontaneous, eye-catching, natural, urban fashion.`);
    }

    // Pass modelImage as model reference
    onGenerate(prompts, { clothing: clothingImage, lowerBody: lowerBodyImage || undefined, model: modelImage, background: backgroundImage || undefined, logo: logoImage || undefined }, Math.floor(Math.random() * 1000000));
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-6 ${isExpanded ? 'max-w-4xl mx-auto' : ''}`}>
      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
        <h3 className="text-sm font-bold text-stone-800 mb-2 flex items-center gap-2">
          <UserSquare className="w-4 h-4 text-indigo-500" />
          AI 模特换装 (场景连贯)
        </h3>
        <p className="text-sm text-stone-500 leading-relaxed mb-4">
          提供服装图和场景/模特参考图。AI 将参考图的氛围感和光影，生成连贯的多角度换装模特图。步骤已极简，无需繁琐设置。
        </p>
      </div>

      <div className={`grid gap-6 ${isExpanded ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Left Column / Top Section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">服装图 (上身必填)</label>
                {clothingImage ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-stone-200">
                    <img src={clothingImage} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setClothingImage(null)} className="absolute top-1 right-1 p-1 bg-white/80 text-stone-600 rounded-full"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="w-full h-24 border border-dashed border-stone-300 hover:border-stone-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white/50 transition-colors">
                    <Upload className="w-4 h-4 text-stone-400 mb-1" />
                    <span className="text-[10px] text-stone-500 text-center px-2">上传上装</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setClothingImage)} />
                  </label>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">下装图 (可选)</label>
                {lowerBodyImage ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-stone-200">
                    <img src={lowerBodyImage} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setLowerBodyImage(null)} className="absolute top-1 right-1 p-1 bg-white/80 text-stone-600 rounded-full"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="w-full h-24 border border-dashed border-stone-300 hover:border-stone-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white/50 transition-colors">
                    <Upload className="w-4 h-4 text-stone-400 mb-1" />
                    <span className="text-[10px] text-stone-500 text-center px-2">上传下装</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setLowerBodyImage)} />
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">模特图 (必填)</label>
                {modelImage ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-stone-200">
                    <img src={modelImage} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setModelImage(null)} className="absolute top-1 right-1 p-1 bg-white/80 text-stone-600 rounded-full"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="w-full h-24 border border-dashed border-stone-300 hover:border-stone-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white/50 transition-colors">
                    <Upload className="w-4 h-4 text-stone-400 mb-1" />
                    <span className="text-[10px] text-stone-500 text-center px-2">上传模特图</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setModelImage)} />
                  </label>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">背景图 (可选)</label>
                {backgroundImage ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-stone-200">
                    <img src={backgroundImage} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setBackgroundImage(null)} className="absolute top-1 right-1 p-1 bg-white/80 text-stone-600 rounded-full"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="w-full h-24 border border-dashed border-stone-300 hover:border-stone-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white/50 transition-colors">
                    <Upload className="w-4 h-4 text-stone-400 mb-1" />
                    <span className="text-[10px] text-stone-500 text-center px-2">上传背景图</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setBackgroundImage)} />
                  </label>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">商标细节图 (可选)</label>
                {logoImage ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-stone-200">
                    <img src={logoImage} className="w-full h-full object-contain bg-stone-100" />
                    <button type="button" onClick={() => setLogoImage(null)} className="absolute top-1 right-1 p-1 bg-white/80 text-stone-600 rounded-full"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="w-full h-24 border border-dashed border-stone-300 hover:border-stone-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white/50 transition-colors">
                    <Upload className="w-4 h-4 text-stone-400 mb-1" />
                    <span className="text-[10px] text-stone-500 text-center px-2">上传商标/Logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setLogoImage)} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column / Bottom Section */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="性别" name="gender" value={formData.gender} onChange={handleChange} options={["女性", "男性", "非二元性别"]} />
            <SelectField label="年龄段" name="ageCategory" value={formData.ageCategory} onChange={handleChange} options={["儿童", "青少年", "成年", "老年"]} />
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">具体年龄 (岁)</label>
              <input type="number" name="ageValue" value={formData.ageValue} onChange={handleChange} className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm" />
            </div>
            <SelectField label="人种" name="ethnicity" value={formData.ethnicity} onChange={handleChange} options={["亚洲人", "白人", "黑人", "西班牙裔", "中东人", "混血"]} />
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">模特身高 (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">生成数量</label>
              <input type="number" name="count" min="1" value={formData.count} onChange={handleChange} className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm" />
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-auto pt-4">
            <button type="submit" className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-xl shadow-md mt-2 transition-transform active:scale-[0.98]">
              一键生成连贯换装图 ({formData.count}张)
            </button>
          </div>
        </div>
      </div>

      {/* 街拍灵感配置面板 - 紧凑且自然 */}
      <div className="flex flex-col gap-6 mt-6 border-t border-stone-200 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                街拍灵感配置 <span className="text-stone-400 font-normal text-sm">/ Street Snap</span>
              </h2>
            </div>
            <p className="text-[10px] text-stone-500">捕捉让人眼前一亮的效果，赋予 AI 模特真实的都市张力。</p>
          </div>
          <button 
            type="button"
            onClick={() => {
              const newSettings = [...formData.imageSettings];
              newSettings.forEach((s, i) => {
                s.pose = POSE_OPTIONS[i % POSE_OPTIONS.length].label;
                s.poseId = POSE_OPTIONS[i % POSE_OPTIONS.length].id;
                s.cameraAngle = ANGLE_OPTIONS[i % ANGLE_OPTIONS.length].label;
                s.angleId = ANGLE_OPTIONS[i % ANGLE_OPTIONS.length].id;
              });
              setFormData({ ...formData, imageSettings: newSettings });
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-stone-800 transition-all active:scale-95"
          >
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> 
            智能分配视角
          </button>
        </div>
        
        <div className={`grid gap-4 ${isExpanded ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {formData.imageSettings.slice(0, formData.count).map((setting, idx) => {
            const isExpandedCard = expandedIndex === idx;
            
            return (
              <div key={idx} className={`group relative border rounded-2xl overflow-hidden transition-all duration-300 ${isExpandedCard ? 'border-stone-900 shadow-lg bg-white col-span-full' : 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-md'}`}>
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpandedCard ? null : idx)}
                  className={`relative z-10 w-full px-5 py-4 flex items-center justify-between transition-all ${isExpandedCard ? 'bg-stone-900 text-white' : 'hover:bg-stone-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isExpandedCard ? 'bg-white text-stone-900' : 'bg-stone-100 text-stone-400'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-tight">{setting.cameraAngle}</span>
                        <span className={`text-[10px] ${isExpandedCard ? 'text-stone-500' : 'text-stone-300'}`}>|</span>
                        <span className="text-xs font-medium">{setting.pose}</span>
                      </div>
                      <span className={`text-[9px] font-medium uppercase tracking-widest ${isExpandedCard ? 'text-stone-400' : 'text-stone-500'}`}>
                        {setting.placement}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpandedCard ? 'text-white rotate-180' : 'text-stone-400'}`} />
                </button>
                
                {isExpandedCard && (
                  <div className="relative z-10 p-6 space-y-8 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* 视角选择 */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                          视角选择 <span className="text-stone-300">/ Angle</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {ANGLE_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                const newSettings = [...formData.imageSettings];
                                newSettings[idx].cameraAngle = opt.label;
                                newSettings[idx].angleId = opt.id;
                                setFormData({ ...formData, imageSettings: newSettings });
                              }}
                              className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${setting.angleId === opt.id ? 'border-stone-900 bg-stone-50 shadow-sm' : 'border-stone-100 bg-white hover:border-stone-300'}`}
                            >
                              <opt.icon className={`w-4 h-4 ${setting.angleId === opt.id ? 'text-stone-900' : 'text-stone-300'}`} />
                              <span className={`text-[10px] font-bold ${setting.angleId === opt.id ? 'text-stone-900' : 'text-stone-500'}`}>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 动作选择 */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                          动作灵感 <span className="text-stone-300">/ Pose</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {POSE_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                const newSettings = [...formData.imageSettings];
                                newSettings[idx].pose = opt.label;
                                newSettings[idx].poseId = opt.id;
                                setFormData({ ...formData, imageSettings: newSettings });
                              }}
                              className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${setting.poseId === opt.id ? 'border-stone-900 bg-stone-50 shadow-sm' : 'border-stone-100 bg-white hover:border-stone-300'}`}
                            >
                              <opt.icon className={`w-4 h-4 ${setting.poseId === opt.id ? 'text-stone-900' : 'text-stone-300'}`} />
                              <span className={`text-[10px] font-bold ${setting.poseId === opt.id ? 'text-stone-900' : 'text-stone-500'}`}>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 位置选择 */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                          构图位置 <span className="text-stone-300">/ Placement</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {PLACEMENT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                const newSettings = [...formData.imageSettings];
                                newSettings[idx].placement = opt.label;
                                setFormData({ ...formData, imageSettings: newSettings });
                              }}
                              className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${setting.placement === opt.label ? 'border-stone-900 bg-stone-50 shadow-sm' : 'border-stone-100 bg-white hover:border-stone-300'}`}
                            >
                              <div className="w-full aspect-[4/3] bg-stone-100 rounded-lg relative overflow-hidden border border-stone-200">
                                <div className={`absolute top-1/2 -translate-y-1/2 w-1/3 h-3/4 rounded-md transition-all duration-300 ${opt.id === 'left' ? 'left-1' : opt.id === 'right' ? 'right-1' : 'left-1/2 -translate-x-1/2'} ${setting.placement === opt.label ? 'bg-stone-900' : 'bg-stone-300'}`}></div>
                              </div>
                              <span className={`text-[9px] font-bold ${setting.placement === opt.label ? 'text-stone-900' : 'text-stone-500'}`}>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
}

function EditPanel({
  onEdit,
  hasImage,
  onFlipImage,
  generatedImages,
  onCreateCollage,
  currentImage,
  onAddText,
  onAddSpecificText,
  texts,
  selectedTextId,
  onUpdateText,
  onDeleteText,
  promptCategory,
  setPromptCategory,
  generatedPrompt,
  isPromptLoading,
  onGeneratePrompt,
}: {
  onEdit: (prompt: string, referenceImage?: string) => void;
  hasImage: boolean;
  onFlipImage: (horizontal: boolean, vertical: boolean) => void;
  generatedImages: GeneratedImage[];
  onCreateCollage: (type: '2x2' | '1x2' | '2x1', images: string[]) => void;
  currentImage: string | null;
  onAddText: () => void;
  onAddSpecificText: (text: string) => void;
  texts: TextOverlay[];
  selectedTextId: string | null;
  onUpdateText: (id: string, updates: Partial<TextOverlay>) => void;
  onDeleteText: (id: string) => void;
  promptCategory: string;
  setPromptCategory: (cat: string) => void;
  generatedPrompt: string;
  isPromptLoading: boolean;
  onGeneratePrompt: () => void;
}) {
  const [editPrompt, setEditPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<'tune' | 'collage' | 'text' | 'prompt'>('tune');

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim()) return;
    
    const finalPrompt = `请根据以下要求对这张图片进行微调和修改，保持原图的主体结构和画质（必须是4K超高清分辨率）：\n${editPrompt}`;
    onEdit(finalPrompt);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex bg-stone-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('tune')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'tune' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          微调
        </button>
        <button
          onClick={() => setActiveTab('collage')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'collage' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          拼图
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'text' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          文案
        </button>
        <button
          onClick={() => setActiveTab('prompt')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'prompt' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          提示词
        </button>
      </div>

      {activeTab === 'tune' ? (
        <>
          {!hasImage ? (
            <div className="text-sm text-stone-500 text-center mt-10 font-serif italic">
              请先生成或上传一张图片，然后再使用基础调整和AI微调。
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">
                  基础调整
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onFlipImage(true, false)}
                    className="py-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-sm font-medium rounded-xl transition-colors shadow-sm"
                  >
                    水平翻转
                  </button>
                  <button
                    onClick={() => onFlipImage(false, true)}
                    className="py-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-sm font-medium rounded-xl transition-colors shadow-sm"
                  >
                    垂直翻转
                  </button>
                </div>
              </div>

              <div className="w-full h-px bg-stone-200"></div>

              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    AI 局部微调 / 风格修改
                  </label>
                  <p className="text-xs text-stone-500 mb-1">
                    对当前图片不满意？输入您的修改要求（例如：换成红色的裙子、背景换成海滩、让人物笑一下）。
                  </p>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="请输入您的修改要求..."
                    className="w-full h-32 bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!editPrompt.trim()}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-md"
                >
                  应用 AI 微调
                </button>
              </form>
            </div>
          )}
        </>
      ) : activeTab === 'collage' ? (
        <CollagePanel generatedImages={generatedImages} onCreateCollage={onCreateCollage} />
      ) : activeTab === 'text' ? (
        <TextAndCopywritingPanel
          currentImage={currentImage}
          onAddText={onAddText}
          onAddSpecificText={onAddSpecificText}
          texts={texts}
          selectedTextId={selectedTextId}
          onUpdateText={onUpdateText}
          onDeleteText={onDeleteText}
          hasImage={hasImage}
        />
      ) : (
        <PromptPanel 
          hasImage={hasImage} 
          promptCategory={promptCategory} 
          setPromptCategory={setPromptCategory} 
          generatedPrompt={generatedPrompt}
          isPromptLoading={isPromptLoading}
          onGeneratePrompt={onGeneratePrompt}
        />
      )}
    </div>
  );
}

function TextAndCopywritingPanel({
  currentImage,
  onAddText,
  onAddSpecificText,
  texts,
  selectedTextId,
  onUpdateText,
  onDeleteText,
  hasImage,
}: any) {
  const [context, setContext] = useState("");
  const [copywriting, setCopywriting] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [platform, setPlatform] = useState("小红书");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateCopywriting(currentImage, context, platform);
      setCopywriting(result);
    } catch (error) {
      console.error(error);
      alert("生成文案失败，请重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasImage) {
    return (
      <div className="text-sm text-stone-500 text-center mt-10 font-serif italic">
        请先生成或上传一张图片，然后再使用文案与叠加功能。
      </div>
    );
  }

  const selectedText = texts.find((t: TextOverlay) => t.id === selectedTextId);

  return (
    <div className="flex flex-col gap-8">
      {/* 文案生成部分 */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-stone-800 font-serif text-lg">
          <Sparkles className="w-5 h-5 text-stone-600" />
          <h3>智能文案生成</h3>
        </div>
        
        <SelectField
          label="文案风格/平台"
          name="platform"
          value={platform}
          onChange={(e: any) => setPlatform(e.target.value)}
          options={["小红书", "抖音", "独立站", "电商"]}
        />

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">
            补充信息 (可选)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="例如：这件衣服很显瘦，适合微胖女孩，价格只要99..."
            className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-800 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 resize-none h-20 placeholder:text-stone-400 transition-all"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              生成中...
            </>
          ) : (
            "生成文案"
          )}
        </button>

        {copywriting && (
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">
                生成结果
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onAddSpecificText(copywriting)}
                  className="text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  添加到图片
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(copywriting)}
                  className="text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  复制
                </button>
              </div>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm text-stone-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto shadow-inner">
              {copywriting}
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-stone-200 w-full"></div>

      {/* 文本叠加部分 */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-stone-800 font-serif text-lg">
          <Type className="w-5 h-5 text-stone-600" />
          <h3>图片文本叠加</h3>
        </div>

        <button
          onClick={onAddText}
          className="w-full py-4 border border-dashed border-stone-300 hover:border-stone-500 hover:bg-stone-50 text-stone-600 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> 添加自定义文本
        </button>

        {selectedText ? (
          <div className="flex flex-col gap-6 border-t border-stone-200 pt-6">
            <h3 className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">
              编辑选中的文本
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-stone-500">内容</label>
              <textarea
                value={selectedText.text}
                onChange={(e) =>
                  onUpdateText(selectedText.id, { text: e.target.value })
                }
                className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-800 focus:outline-none focus:border-stone-400 transition-all resize-none h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-stone-500">字体大小</label>
                <input
                  type="number"
                  value={selectedText.fontSize}
                  onChange={(e) =>
                    onUpdateText(selectedText.id, {
                      fontSize: Number(e.target.value),
                    })
                  }
                  className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-800 focus:outline-none focus:border-stone-400 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-stone-500">颜色</label>
                <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl p-2 transition-all">
                  <input
                    type="color"
                    value={selectedText.color}
                    onChange={(e) =>
                      onUpdateText(selectedText.id, { color: e.target.value })
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none p-0"
                  />
                  <span className="text-xs text-stone-600 uppercase font-medium">
                    {selectedText.color}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-stone-500">字体</label>
              <select
                value={selectedText.fontFamily}
                onChange={(e) =>
                  onUpdateText(selectedText.id, { fontFamily: e.target.value })
                }
                className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-800 focus:outline-none focus:border-stone-400 transition-all"
              >
                <option value="Cormorant Garamond">Cormorant Garamond (Serif)</option>
                <option value="Inter">Inter (Sans)</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
              </select>
            </div>

            <button
              onClick={() => onDeleteText(selectedText.id)}
              className="mt-2 py-3 text-red-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> 删除图层
            </button>
          </div>
        ) : (
          texts.length > 0 && (
            <div className="text-sm text-stone-500 text-center mt-2 font-serif italic">
              在画布上选择一个文本图层以编辑其属性。
            </div>
          )
        )}
      </div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, disabled }: any) {
  return (
    <div className={`flex flex-col gap-2 ${disabled ? 'opacity-50' : ''}`}>
      <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-800 focus:outline-none focus:border-stone-400 appearance-none transition-all disabled:cursor-not-allowed"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function CollagePanel({ generatedImages, onCreateCollage }: { generatedImages: GeneratedImage[], onCreateCollage: (type: '2x2' | '1x2' | '2x1', images: string[]) => void }) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [collageType, setCollageType] = useState<'2x2' | '1x2' | '2x1'>('2x2');

  const toggleImage = (img: string) => {
    if (selectedImages.includes(img)) {
      setSelectedImages(selectedImages.filter(i => i !== img));
    } else {
      const maxImages = collageType === '2x2' ? 4 : 2;
      if (selectedImages.length < maxImages) {
        setSelectedImages([...selectedImages, img]);
      } else {
        alert(`当前拼图模式最多只能选择 ${maxImages} 张图片`);
      }
    }
  };

  const handleTypeChange = (type: '2x2' | '1x2' | '2x1') => {
    setCollageType(type);
    const maxImages = type === '2x2' ? 4 : 2;
    if (selectedImages.length > maxImages) {
      setSelectedImages(selectedImages.slice(0, maxImages));
    }
  };

  if (generatedImages.length === 0) {
    return (
      <div className="text-sm text-stone-500 text-center mt-10 font-serif italic">
        请先生成一些图片，然后再使用拼图功能。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">
          选择拼图模式
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleTypeChange('2x2')}
            className={`py-2 text-xs font-medium rounded-xl border transition-all ${collageType === '2x2' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}
          >
            四宫格
          </button>
          <button
            onClick={() => handleTypeChange('1x2')}
            className={`py-2 text-xs font-medium rounded-xl border transition-all ${collageType === '1x2' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}
          >
            左右拼接
          </button>
          <button
            onClick={() => handleTypeChange('2x1')}
            className={`py-2 text-xs font-medium rounded-xl border transition-all ${collageType === '2x1' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}
          >
            上下拼接
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">
          选择图片 ({selectedImages.length}/{collageType === '2x2' ? 4 : 2})
        </label>
        <div className="grid grid-cols-2 gap-3">
          {generatedImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => toggleImage(img.url)}
              className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${selectedImages.includes(img.url) ? 'border-stone-900 scale-95 shadow-md' : 'border-transparent hover:scale-95'}`}
            >
              <img src={img.url} alt={`Generated ${idx + 1}`} className="w-full h-full object-cover" />
              {selectedImages.includes(img.url) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {selectedImages.indexOf(img.url) + 1}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onCreateCollage(collageType, selectedImages)}
        disabled={selectedImages.length === 0}
        className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
      >
        <LayoutGrid className="w-4 h-4" /> 生成拼图
      </button>
    </div>
  );
}
