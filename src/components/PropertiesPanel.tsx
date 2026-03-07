import React, { useState } from "react";
import { ToolType, TextOverlay } from "./Editor";
import { Wand2, Type, Trash2, Plus, Upload, Sparkles, LayoutGrid, FileText, UserSquare, Shirt } from "lucide-react";
import { generateCopywriting } from "../services/gemini";

interface PropertiesPanelProps {
  activeTool: ToolType;
  onGenerate: (prompts: string[], clothingImage?: string, styleImage?: string, seed?: number) => void;
  onEdit: (prompt: string, referenceImage?: string) => void;
  onAddText: () => void;
  onAddSpecificText: (text: string) => void;
  texts: TextOverlay[];
  selectedTextId: string | null;
  onUpdateText: (id: string, updates: Partial<TextOverlay>) => void;
  onDeleteText: (id: string) => void;
  hasImage: boolean;
  currentImage: string | null;
  generatedImages: string[];
  onCreateCollage: (type: '2x2' | '1x2' | '2x1', images: string[]) => void;
  onFlipImage: (horizontal: boolean, vertical: boolean) => void;
  promptCategory: string;
  setPromptCategory: (category: string) => void;
  generatedPrompt: string;
  isPromptLoading: boolean;
  onGeneratePrompt: () => void;
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
}: PropertiesPanelProps) {
  return (
    <aside className="w-80 bg-white border-l border-stone-200 flex flex-col h-full overflow-y-auto shadow-sm z-20">
      <header className="h-16 border-b border-stone-200 flex items-center px-8 sticky top-0 bg-white/95 backdrop-blur z-10">
        <h2 className="font-serif text-lg font-medium text-stone-800 tracking-wide flex items-center gap-2">
          {activeTool === "tryon" && (
            <>
              <Shirt className="w-4 h-4" /> AI 换装
            </>
          )}
          {activeTool === "character" && (
            <>
              <UserSquare className="w-4 h-4" /> 人物与小红书
            </>
          )}
          {activeTool === "edit" && (
            <>
              <Wand2 className="w-4 h-4" /> AI 编辑
            </>
          )}
          {activeTool === "text" && (
            <>
              <Type className="w-4 h-4" /> 文案与叠加
            </>
          )}
          {activeTool === "collage" && (
            <>
              <LayoutGrid className="w-4 h-4" /> 拼图
            </>
          )}
          {activeTool === "prompt" && (
            <>
              <FileText className="w-4 h-4" /> 高级提示词
            </>
          )}
        </h2>
      </header>

      <div className="p-8 flex-1">
        {activeTool === "tryon" && <TryonPanel onGenerate={onGenerate} />}
        {activeTool === "character" && <CharacterPanel onGenerate={onGenerate} />}
        {activeTool === "edit" && <EditPanel onEdit={onEdit} hasImage={hasImage} onFlipImage={onFlipImage} />}
        {activeTool === "text" && (
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
        )}
        {activeTool === "collage" && (
          <CollagePanel generatedImages={generatedImages} onCreateCollage={onCreateCollage} />
        )}
        {activeTool === "prompt" && (
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
    "艺术写真 (Artistic Portrait)",
    "赛博朋克/未来感 (Cyberpunk/Sci-Fi)",
    "极简高级 (Minimalist High-end)",
    "复古胶片 (Vintage Film)",
    "二次元/动漫 (Anime/Manga)"
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
        <h3 className="text-sm font-bold text-stone-800 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          高级提示词生成
        </h3>
        <p className="text-sm text-stone-500 leading-relaxed mb-4">
          一键根据您当前选择的图片，生成适合 Midjourney (图像生成) 以及 Kling、Sora、Runway (视频动态生成) 的高级英文提示词。
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
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">
              生成结果
            </label>
            <button
              onClick={() => navigator.clipboard.writeText(generatedPrompt)}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              复制全部
            </button>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm text-stone-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto shadow-inner font-mono">
            {generatedPrompt}
          </div>
        </div>
      )}
    </div>
  );
}

function TryonPanel({ onGenerate }: { onGenerate: (prompts: string[], clothingImage?: string, styleImage?: string, seed?: number) => void }) {
  const [clothingImage, setClothingImage] = useState<string | null>(null);
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [watermarkMode, setWatermarkMode] = useState("去除水印");
  const [count, setCount] = useState(4);

  const handleClothingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setClothingImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleStyleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setStyleImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clothingImage || !styleImage) {
      alert("请上传服装图和意向风格图");
      return;
    }
    const prompts: string[] = [];
    let basePrompt = `请严格让人物穿上我提供的服装参考图中的衣服。【意向风格要求】请严格模仿我提供的意向风格图中的人物姿势、摄影风格、光影效果和整体氛围。`;
    
    if (watermarkMode === "去除水印") {
      basePrompt += `请务必去除原图中的任何水印、文字或标识，保持画面干净。`;
    } else {
      basePrompt += `请保留原图中的水印或文字标识。`;
    }
    
    basePrompt += `请生成一张高质量、逼真的全身照。`;
    
    for (let i = 0; i < count; i++) {
      prompts.push(basePrompt + `\n(Variation ${i + 1}: 请在保持服装和风格一致的前提下，让模特的微表情和细节产生自然变化。)`);
    }
    onGenerate(prompts, clothingImage, styleImage, Math.floor(Math.random() * 1000000));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
        <h3 className="text-sm font-bold text-stone-800 mb-2 flex items-center gap-2">
          <Shirt className="w-4 h-4 text-indigo-500" />
          AI 换装
        </h3>
        <p className="text-sm text-stone-500 leading-relaxed mb-4">
          上传服装图和意向风格图，AI 将直接为您生成换装后的模特图。
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">服装图 (必填)</label>
          {clothingImage ? (
            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-stone-200">
              <img src={clothingImage} className="w-full h-full object-cover" />
              <button type="button" onClick={() => setClothingImage(null)} className="absolute top-1.5 right-1.5 p-1.5 bg-white/80 text-stone-600 rounded-full"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <label className="w-full h-32 border border-dashed border-stone-300 hover:border-stone-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white/50">
              <Upload className="w-4 h-4 text-stone-400 mb-1" />
              <span className="text-[10px] text-stone-500">上传服装</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleClothingUpload} />
            </label>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">意向风格图 (必填)</label>
          {styleImage ? (
            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-stone-200">
              <img src={styleImage} className="w-full h-full object-cover" />
              <button type="button" onClick={() => setStyleImage(null)} className="absolute top-1.5 right-1.5 p-1.5 bg-white/80 text-stone-600 rounded-full"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <label className="w-full h-32 border border-dashed border-stone-300 hover:border-stone-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white/50">
              <Upload className="w-4 h-4 text-stone-400 mb-1" />
              <span className="text-[10px] text-stone-500">上传风格图</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleStyleUpload} />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">水印处理</label>
          <select value={watermarkMode} onChange={(e) => setWatermarkMode(e.target.value)} className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm">
            <option value="去除水印">去除水印</option>
            <option value="保留水印">保留水印</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">生成数量</label>
          <input type="number" min="1" max="10" value={count} onChange={(e) => setCount(Number(e.target.value))} className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm" />
        </div>
      </div>

      <button type="submit" className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-xl shadow-md">
        一键换装 ({count}张)
      </button>
    </form>
  );
}

function CharacterPanel({ onGenerate }: { onGenerate: (prompts: string[], clothingImage?: string, styleImage?: string, seed?: number) => void }) {
  const [formData, setFormData] = useState({
    gender: "女性",
    age: "青年",
    ethnicity: "亚洲人",
    style: "街头服饰",
    setting: "极简纯色背景",
    generationStyle: "小红书爆款网感",
    count: 4,
    consistent: true,
  });
  const [clothingImage, setClothingImage] = useState<string | null>(null);

  const handleClothingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setClothingImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompts: string[] = [];
    let basePrompt = "";

    if (formData.generationStyle === "小红书爆款网感") {
      basePrompt = `请深度分析我提供的服装款式、材质和调性。使用网络搜索（特别是小红书OOTD、穿搭博主素材）来寻找最适合这件衣服的搭配灵感。
请生成一张极具“小红书爆款”风格的高质量、逼真全身照（必须是4K超高清分辨率）。
人物特征：${formData.age}、${formData.ethnicity}、${formData.gender}。
背景环境：${formData.setting}。`;
      if (clothingImage) {
        basePrompt += `\n请严格让人物穿上我提供的服装参考图中的衣服。`;
      } else {
        basePrompt += `\n服装款式：${formData.style}。`;
      }
      basePrompt += `\n要求：
1. 风格必须是小红书热门的网感穿搭（如：老钱风、辣妹风、极简高级感、韩系慵懒风等）。
2. 【背景要求】背景必须简洁、干净，不能过于复杂抢眼，可以适当虚化（景深效果），以最大程度突出人物的服装款式和材质。
3. 人物姿势要自然、松弛、有表现力（如：对镜自拍、走路抓拍、不露脸氛围感）。`;
    } else {
      basePrompt = `请生成一张高质量、逼真的全身照（必须是4K超高清分辨率）。人物特征：${formData.age}、${formData.ethnicity}、${formData.gender}。`;
      if (clothingImage) {
        basePrompt += `请严格让人物穿上我提供的服装参考图中的衣服。`;
      } else {
        basePrompt += `服装款式：${formData.style}。`;
      }
      basePrompt += `背景环境：${formData.setting}。
【背景要求】背景必须简洁、干净，不能过于复杂抢眼，可以适当虚化（景深效果），以最大程度突出人物的服装款式和材质。`;
    }

    if (formData.age === "儿童" || formData.age === "青少年") {
      basePrompt += "\n【长相与表情要求：人物长相必须非常精致、好看，有那种极高颜值、非常讨喜的小孩/青少年的感觉。表情需自然生动、带有童趣。】";
    } else {
      basePrompt += "\n【长相要求：人物长相必须非常精致、好看，有极高的颜值和气质。】";
    }

    const angles = ["正面平视", "侧面半身", "稍微仰拍", "稍微俯拍", "全身远景", "特写近景", "不经意的抓拍", "回眸一笑", "坐姿", "走路抓拍"];
    
    for (let i = 0; i < formData.count; i++) {
      prompts.push(basePrompt + `\n(Variation ${i + 1}: 拍摄视角：${angles[i % angles.length]}。请让模特的姿势产生自然变化。)`);
    }

    const seed = formData.consistent ? Math.floor(Math.random() * 1000000) : undefined;
    onGenerate(prompts, clothingImage || undefined, undefined, seed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
        <h3 className="text-sm font-bold text-stone-800 mb-2 flex items-center gap-2">
          <UserSquare className="w-4 h-4 text-indigo-500" />
          人物与小红书风格
        </h3>
        <p className="text-sm text-stone-500 leading-relaxed mb-4">
          根据您设定的人物特征和场景，生成专属模特。可选择生成小红书爆款网感大片，或常规高质量照片。
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">服装图 (可选)</label>
        {clothingImage ? (
          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-stone-200">
            <img src={clothingImage} className="w-full h-full object-cover" />
            <button type="button" onClick={() => setClothingImage(null)} className="absolute top-1.5 right-1.5 p-1.5 bg-white/80 text-stone-600 rounded-full"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <label className="w-full h-32 border border-dashed border-stone-300 hover:border-stone-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white/50">
            <Upload className="w-4 h-4 text-stone-400 mb-1" />
            <span className="text-[10px] text-stone-500">上传服装 (可选)</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleClothingUpload} />
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField label="性别" name="gender" value={formData.gender} onChange={handleChange} options={["女性", "男性", "非二元性别"]} />
        <SelectField label="年龄" name="age" value={formData.age} onChange={handleChange} options={["儿童", "青少年", "青年", "成年", "老年"]} />
        <SelectField label="人种" name="ethnicity" value={formData.ethnicity} onChange={handleChange} options={["亚洲人", "白人", "黑人", "西班牙裔", "中东人", "混血"]} />
        {!clothingImage && (
          <SelectField label="服装款式" name="style" value={formData.style} onChange={handleChange} options={["街头服饰", "休闲装", "正装", "复古装", "运动装", "极简主义"]} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField label="背景环境" name="setting" value={formData.setting} onChange={handleChange} options={["极简纯色背景", "简约咖啡馆角落", "干净的城市街道", "极简工作室", "自然风景(虚化)", "高级灰调室内"]} />
        <SelectField label="生成风格" name="generationStyle" value={formData.generationStyle} onChange={handleChange} options={["小红书爆款网感", "常规高质量"]} />
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            name="consistent" 
            checked={formData.consistent} 
            onChange={handleChange}
            className="w-4 h-4 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500"
          />
          <span className="text-sm text-stone-700 font-medium">保持人物与场景连贯一致</span>
        </label>
        <p className="text-xs text-stone-500 ml-6">
          勾选后，多张图片将使用相同的模特和背景，仅改变拍摄视角和姿势。
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">生成数量 (4K超高清)</label>
        <input type="number" name="count" min="1" max="10" value={formData.count} onChange={handleChange} className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm" />
      </div>

      <button type="submit" className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-xl shadow-md">
        生成人物图 ({formData.count}张)
      </button>
    </form>
  );
}

function EditPanel({
  onEdit,
  hasImage,
  onFlipImage,
}: {
  onEdit: (prompt: string, referenceImage?: string) => void;
  hasImage: boolean;
  onFlipImage: (horizontal: boolean, vertical: boolean) => void;
}) {
  if (!hasImage) {
    return (
      <div className="text-sm text-stone-500 text-center mt-10 font-serif italic">
        请先生成或上传一张图片，然后再使用基础调整。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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

function CollagePanel({ generatedImages, onCreateCollage }: { generatedImages: string[], onCreateCollage: (type: '2x2' | '1x2' | '2x1', images: string[]) => void }) {
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
              key={idx}
              onClick={() => toggleImage(img)}
              className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${selectedImages.includes(img) ? 'border-stone-900 scale-95 shadow-md' : 'border-transparent hover:scale-95'}`}
            >
              <img src={img} alt={`Generated ${idx + 1}`} className="w-full h-full object-cover" />
              {selectedImages.includes(img) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {selectedImages.indexOf(img) + 1}
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
