import { NextResponse } from "next/server";
import { getUsers } from "@/lib/store";
export async function GET() {
  return NextResponse.json(getUsers());
}
