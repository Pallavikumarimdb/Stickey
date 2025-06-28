import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export const WhiteboardCard = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "col-span-1 w-48 h-48 bg-gradient-to-b from-[#fffcb0] to-[#fff89c] border border-[#f8f8a6] shadow-[0_4px_8px_rgba(0,0,0,0.15)] rounded-[2px] flex flex-col items-center justify-center transition-transform duration-200 hover:scale-[1.02] cursor-pointer",
      )}
    >
      <Pencil className="h-10 w-10 text-gray-800 mb-2" />
      <p className="text-sm text-gray-700 font-medium text-center">
        Start Drawing
      </p>
      <p className="text-xs text-gray-500 text-center mt-1">
        No login needed
      </p>
    </div>
  );
};
