import { Wand2, Type, Image as ImageIcon, LayoutGrid, FileText, UserSquare, Shirt, Sparkles } from "lucide-react";
import { ToolType } from "./Editor";

interface SidebarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

export default function Sidebar({ activeTool, setActiveTool }: SidebarProps) {
  const tools = [
    { id: "tryon", icon: Shirt, label: "AI 换装" },
    { id: "character", icon: UserSquare, label: "人物与小红书" },
    { id: "edit", icon: Wand2, label: "AI 编辑" },
  ];

  return (
    <aside className="w-24 bg-white border-r border-stone-200 flex flex-col items-center py-8 gap-10 shadow-sm z-20">
      <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center shadow-md">
        <ImageIcon className="w-5 h-5 text-white" />
      </div>

      <nav className="flex flex-col gap-6 w-full px-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as ToolType)}
              className={`flex flex-col items-center justify-center py-4 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? "bg-stone-100 text-stone-900 shadow-sm"
                  : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
              }`}
              title={tool.label}
            >
              <Icon
                strokeWidth={isActive ? 2 : 1.5}
                className={`w-6 h-6 mb-2 transition-transform duration-300 ${isActive ? "scale-110 text-stone-900" : "group-hover:scale-110"}`}
              />
              <span className="text-[10px] font-medium tracking-widest uppercase text-center leading-tight">
                {tool.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
