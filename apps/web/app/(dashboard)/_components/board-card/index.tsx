"use client";


import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Overlay } from "./overlay";
import { Footer } from "./footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Actions } from "@/components/actions";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { onFavorite, onUnFavorite } from "server/project"
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import img from "public/1.svg"

interface ProjectCardProps {
    id: string;
    title: string;
    adminId: string;
    createdAt: string;
    imageUrl: string;
    bookmarked: boolean;
    onFavoriteToggle?: (projectId: string, isFavorite: boolean) => void;
}

export const ProjectCard = ({
    id,
    title,
    imageUrl,
    adminId,
    createdAt,
    bookmarked,
    onFavoriteToggle, 

}: ProjectCardProps) => {

    const [isFavorite, setIsFavorite] = useState(bookmarked);
    const [pending, startTransition] = useTransition();

    const colors = ["bg-yellow-200", "bg-pink-200", "bg-green-200", "bg-blue-100"];
    const color = colors[Math.floor(Math.random() * colors.length)];

const toggleFavorite = () => {
    startTransition(() => {
        const fn = isFavorite ? onUnFavorite : onFavorite;

        fn({ projectId: id })
            .then(() => {
                const newVal = !isFavorite;
                setIsFavorite(newVal);
                onFavoriteToggle?.(id, newVal);
                toast.success(newVal ? "Added to favorites" : "Removed from favorites");
            })
            .catch(() => {
                toast.error("Action failed");
            });
    });
};



    return (
        <div
            className={cn(
                "relative w-48 h-52 rounded-[8px] shadow-md overflow-hidden group",
                color
            )}
        >
            <div className="absolute top-1 right-1 z-20">
                <Actions
                    id={id}
                    title={title}
                    side="bottom"
                    sideOffset={-15}
                    alignOffset={22}
                >
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="outline-none"
                    >
                        <MoreHorizontal
                            className="text-black hover:scale-105"
                            size={20}
                        />
                    </button>
                </Actions>
            </div>

            <Link href={`/board/${id}`} className="block w-full h-full">
                <div className="flex flex-col justify-between h-full relative">
                    <div className="relative flex-1 w-full">
                        <Image
                            src={img}
                            alt={title}
                            fill
                            className="object-cover rounded-none"
                        />
                        <Overlay />
                    </div>

                    <div className="z-10">
                        <Footer
                            isFavorite={isFavorite}
                            title={title}
                            createdAtLabel={formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                            onClick={toggleFavorite}
                            disabled={pending}
                        />
                    </div>
                </div>
            </Link>
        </div>

    );
};

ProjectCard.Skeleton = function BoardCardSkeleton() {
    return (
        <div className="aspect-[100/127] rounded-lg overflow-hidden animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]">
            <Skeleton className="w-full h-full" />
        </div>
    );
};