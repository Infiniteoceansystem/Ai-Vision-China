import { forwardRef } from "react";
import { TextOverlay } from "./Editor";

interface WorkspaceProps {
  currentImage: string | null;
  texts: TextOverlay[];
  selectedTextId: string | null;
  onSelectText: (id: string | null) => void;
  onUpdateText: (id: string, updates: Partial<TextOverlay>) => void;
}

const Workspace = forwardRef<HTMLDivElement, WorkspaceProps>(
  (
    { currentImage, texts, selectedTextId, onSelectText, onUpdateText },
    ref
  ) => {
    return (
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onClick={() => onSelectText(null)}
      >
        {currentImage ? (
          <div
            ref={ref}
            className="relative shadow-2xl transition-all duration-500 ease-out"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              display: "inline-block",
            }}
          >
            <img
              src={currentImage}
              alt="Workspace"
              className="max-w-full max-h-[80vh] object-contain rounded-sm"
              crossOrigin="anonymous"
            />
            {texts.map((text) => (
              <div
                key={text.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectText(text.id);
                }}
                style={{
                  position: "absolute",
                  left: `${text.x}%`,
                  top: `${text.y}%`,
                  transform: "translate(-50%, -50%)",
                  fontSize: `${text.fontSize}px`,
                  color: text.color,
                  fontFamily: text.fontFamily,
                  cursor: "move",
                  whiteSpace: "pre-wrap",
                  textAlign: "center",
                  textShadow: "0px 2px 4px rgba(0,0,0,0.5)",
                }}
                className={`p-2 border-2 transition-colors ${
                  selectedTextId === text.id
                    ? "border-stone-400 bg-white/10 backdrop-blur-sm"
                    : "border-transparent hover:border-white/50"
                }`}
              >
                {text.text}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center max-w-md">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm border border-stone-100">
              <svg
                className="w-10 h-10 text-stone-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-2xl text-stone-800 mb-3">
              尚未选择图片
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              使用左侧的“搜索与生成”工具创建一张新的全身照，或点击右上角上传您自己的图片开始编辑。
            </p>
          </div>
        )}
      </div>
    );
  }
);

Workspace.displayName = "Workspace";
export default Workspace;
