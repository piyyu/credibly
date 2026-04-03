import { NextResponse } from "next/server";
import { getDigiLockerAuthURL } from "@/lib/digilocker/client";

export function GET() {
  return NextResponse.redirect(getDigiLockerAuthURL());
}
