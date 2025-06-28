"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectCard } from "./board-card";
import { CreateProjectButton } from "./create-project";
import { WhiteboardCard } from "./create-whiteboard";

interface BoardListProps {
  userId: string;
  query: {
    search?: string;
    favorites?: string;
  };
}

interface Project {
  id: string;
  title: string;
  bookmarked: boolean;
  createdAt: string;
  imageUrl: string;
  adminId: string;
  updatedAt: number;
}

export const BoardList = ({ userId }: BoardListProps) => {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useSearchParams();

  const favorites = params.get("favorites") === "true";
  const search = params.get("search")?.toLowerCase() || "";


  const handleFavoriteToggle = (projectId: string, isNowFavorite: boolean) => {
  setProjects((prev) =>
    prev?.map((project) =>
      project.id === projectId ? { ...project, bookmarked: isNowFavorite } : project
    ) ?? []
  );
};


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        setProjects(data.project || []);
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects?.filter((project) => {
    if (favorites && !project.bookmarked) return false;
    if (search && !project.title.toLowerCase().includes(search)) return false;
    return true;
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        {favorites ? "Favorite boards" : "Team boards"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mt-8 pb-10 border-b border-slate-200">
        <CreateProjectButton userId={userId} disabled={loading} />
        <WhiteboardCard
          onClick={() => {
            console.log("Create new whiteboard");
          }}
        />
      </div>

      <div className="pt-10 pb-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {loading
          ? [...Array(9)].map((_, i) => <ProjectCard.Skeleton key={i} />)
          : filteredProjects?.length
          ? filteredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} onFavoriteToggle={handleFavoriteToggle} />
            ))
          : (
              <div className="col-span-full text-center text-gray-500">
                No projects found
              </div>
            )
        }
      </div>
    </div>
  );
};

