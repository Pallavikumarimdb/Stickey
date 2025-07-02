"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Star } from "lucide-react";
import { Dancing_Script } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const font = Dancing_Script({
    subsets: ["latin"],
    weight: ["600"],
});

export const ProjectSidebar = () => {
    const searchParams = useSearchParams();
    const favorite = searchParams.get("favorites");
    return (
        <div className="hidden lg:flex flex-col space-y-10 w-[206px] pl-5 pt-2 mr-5 bg-slate-200 rounded-md pr-4">
            <Link href="/">
                <div className="flex items-center">
                    <Image src="/logo.png" alt="Logo" height={70} width={70} />
                    <span
                        className={cn("font-extrabold text-3xl mt-2", font.className)}
                    >
                        Stickey
                    </span>
                </div>
            </Link>
            {/* <div>
               List of Projects/Organization
            </div> */}
            <div className="space-y-1 w-full">
                <Button
                    variant={favorite ? "ghost" : "secondary"}
                    asChild
                    size="lg"
                    className="font-normal justify-start px-2 w-full"
                >
                    <Link href="/">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Team Boards
                    </Link>
                </Button>
                <Button
                    variant={!favorite ? "ghost" : "secondary"}
                    asChild
                    size="lg"
                    className="font-normal justify-start px-2 w-full"
                >
                    <Link
                        href={{
                            pathname: "/",
                            query: {
                                favorites: "true",
                            },
                        }}
                    >
                        <Star className="h-4 w-4 mr-2" />
                        Favorite Boards
                    </Link>
                </Button>
            </div>
        </div>
    );
};