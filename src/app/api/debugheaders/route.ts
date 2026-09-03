// TEMP diagnostic route — deleted after use, not part of the app.
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json(Object.fromEntries(req.headers));
}
