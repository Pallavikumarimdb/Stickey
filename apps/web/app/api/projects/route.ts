
import { NextResponse } from "next/server";
import { getUserProjects } from "server/project";


export async function GET() {
  const result = await getUserProjects();

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  return NextResponse.json({ project: result.project });
}


