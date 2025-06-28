"use client";

import { useAuth } from "@/lib/useAuth";
import { BoardList } from "./_components/board-list";

interface DashboardPageProps {
    searchParams: {
        search?: string;
        favorites?: string;
    };
}

const DashboardPage = ({ searchParams }: DashboardPageProps) => {
    const { userId} = useAuth();
    return (
        <div className="flex-1 h-[calc(100%-80px)] p-5">
            <BoardList userId={userId ?? ""} query={searchParams} />
        </div>
    );
};

export default DashboardPage;