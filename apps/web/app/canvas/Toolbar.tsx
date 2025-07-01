"use client";


import { Circle, Diamond, Eraser, MoveRight, Pencil, Square, TypeOutline } from "lucide-react";
import { ToolType } from "types/canvasTools";

export const Toolbar = ({
  tool,
  setTool,
}: {
  tool: ToolType;
  setTool: (t: ToolType) => void;
}) => {

  // const tools: ToolType[] = ["pencil", "rectangle", "circle", "arrow", "diamond", "text", "eraser"];

  const toolsIcon = [
    { name: "pencil", icon: Pencil },
    { name: "rectangle", icon: Square },
    { name: "circle", icon: Circle },
    { name: "arrow", icon: MoveRight },
    { name: "diamond", icon: Diamond },
    { name: "text", icon: TypeOutline},
    { name: "eraser", icon: Eraser },
  ];

  return (
    <div className="absolute top-4 justify-center item-center left-[30%] z-50 shadow px-4 py-2 rounded-md flex gap-6">
      {toolsIcon.map(({ name, icon: Icon }) => (
        <button
          key={name}
          onClick={() => setTool(name as ToolType)}
          className={`px-2 py-2 rounded-md ${tool === name ? "bg-slate-200 text-blue-800" : "bg-transparent"}`}
          title={name}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
};

