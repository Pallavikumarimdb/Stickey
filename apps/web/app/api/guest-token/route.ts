import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

export async function POST(req: NextRequest) {
  const guestId = `guest-${crypto.randomUUID()}`;

  const token = jwt.sign(
    {
      userId: guestId,
      userName: "Guest",
      isGuest: true,
      isAuthenticated: false,
    },
    JWT_SECRET,
    {
      expiresIn: "3h",
    }
  );

  return NextResponse.json({ token, guestId });
}
