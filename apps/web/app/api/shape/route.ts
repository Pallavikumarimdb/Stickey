import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import client from "@repo/db/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomId, stroke } = await req.json();

  if (!roomId || !stroke) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    await client.shape.create({
      data: {
        message: JSON.stringify(stroke),
        userId: session.user.id,
        projectId: roomId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DB Save Stroke Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
