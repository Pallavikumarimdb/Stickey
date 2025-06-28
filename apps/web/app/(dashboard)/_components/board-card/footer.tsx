import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface FooterProps {
    title: string;
    createdAtLabel: string;
    isFavorite: boolean;
    onClick: () => void;
    disabled: boolean;
}

export const Footer = ({
    isFavorite,
    title,
    createdAtLabel,
    onClick,
    disabled,
}: FooterProps) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
    };
    return (
        <div className="relative p-2 bg-slate-300">
            <p className="text-[16px] font-bold truncate max-w-[calc(100%-20px)]">
                {title}
            </p>
            <p className=" transition-opacity text-[11px] text-muted-foreground truncate">
                 {createdAtLabel}
            </p>
            <button
                disabled={disabled}
                onClick={handleClick}
                className={cn(
                    " transition absolute top-3 right-3 text-muted-foreground hover:text-blue-600",
                    disabled && "cursor-not-allowed opacity-75"
                )}
            >
                <Star
                    className={cn(
                        "h-4 w-4",
                        isFavorite && "fill-blue-600 text-blue-600"
                    )}
                />
            </button>
        </div>
    );
};