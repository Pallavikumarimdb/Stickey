import client from "@repo/db/client";


export async function POST(req: Request) {

  const { roomId, strokeId } = await req.json();

  if (!roomId || !strokeId) {
    return new Response(JSON.stringify({ error: "Invalid data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await client.shape.deleteMany({
      where: {
        id: strokeId,
        projectId: roomId,
      },
    });

    return new Response(JSON.stringify({ message: "Stroke deleted" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting stroke:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
