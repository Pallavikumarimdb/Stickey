"use server";

import client from "@repo/db/client";
import z from "zod";
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/auth';
import { cookies } from 'next/headers';



export async function joinProject(data: { id: string }) {
  try {
    const project = await client.project.findUnique({
      where: { id: data.id },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    const session = await getServerSession(authOptions);
    const cookieToken = session?.accessToken;

    if (!cookieToken) {
      console.error("Access Token not found");
      return;
    }

    (await cookies()).set("accessToken", cookieToken, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    });

    return {
      success: true,
      project: project,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid Project code format" };
    }
    console.error("Failed to join Project:", error);
    return { success: false, error: "Failed to join Project" };
  }
}

export async function createProject(data: { title: string }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || !user.id) {
      return { success: false, error: "User not found" };
    }

    const project = await client.project.create({
      data: {
        adminId: user.id,
        title: data.title,
      },
    });

    return {
      success: true,
      project,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid Project name format",
        errorMessage: error.message,
      };
    }
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function getProject(data: { id: string }) {
  try {
    const project = await client.project.findUnique({
      where: { id: data.id },
      include: { Shape: true },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    const session = await getServerSession(authOptions);
    const cookieToken = session?.accessToken;

    if (!cookieToken) {
      console.error("Access Token not found in Get Project server action");
      return;
    }

    (await cookies()).set("accessToken", cookieToken, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    });

    return {
      success: true,
      project: project,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid project code format" };
    }
    console.error("Failed to join project:", error);
    return { success: false, error: "Failed to join project" };
  }
}

export async function deleteProject(data: { id: string }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Authentication required" };
    }

    const project = await client.project.findUnique({
      where: { id: data.id },
      include: { admin: true },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    if (project.adminId !== session.user.id) {
      return {
        success: false,
        error: "Unauthorized User - Only project admin can delete the project",
      };
    }

    await client.shape.deleteMany({
      where: { projectId: project.id },
    });

    await client.project.delete({
      where: { id: project.id },
    });

    return { success: true, message: "Project deleted successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid Project name format" };
    }
    console.error("Failed to delete project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}

export async function getUserProjects() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || !user.id) {
      return { success: false, error: "User not authenticated" };
    }

    const userId = user.id;

    const projects = await client.project.findMany({
      where: { adminId: userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        Bookmark: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    const formatted = projects.map((project) => ({
      ...project,
      bookmarked: project.Bookmark.length > 0,
    }));

    return { success: true, project: formatted };
  } catch (error) {
    console.error("Failed to fetch user projects:", error);
    return { success: false, error: "Failed to fetch user projects" };
  }
}



export async function onFavorite({ projectId }: { projectId: string }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  await client.bookmark.create({
    data: {
      projectId,
      userId,
    },
  });
}


export async function onUnFavorite({ projectId }: { projectId: string }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  await client.bookmark.delete({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });
}


export async function isBookmarked({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) {
  const bookmark = await client.bookmark.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  return !!bookmark;
}