import { NextRequest } from 'next/server';
import client from '@repo/db/client';

export async function GET(req: NextRequest, context: { params: { projectId: string } }) {
  const projectId = context.params.projectId;

  try {
    const shapes = await client.shape.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    return new Response(JSON.stringify({ shapes }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[GET_SHAPES_ERROR]', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch shapes.' }), { status: 500 });
  }
}
