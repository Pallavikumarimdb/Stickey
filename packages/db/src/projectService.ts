import prisma from './index';


export async function getProjectOwner(projectId: string): Promise<string | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { adminId: true },
    });

    return project?.adminId ?? null;
  } catch (error) {
    console.error("Failed to fetch project owner:", error);
    return null;
  }
}
