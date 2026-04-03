import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/digilocker/client";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/error?msg=no_code", req.url));

  const accessToken = await exchangeCode(code);
  const res = NextResponse.redirect(new URL("/wallet?digilocker=connected", req.url));
  res.cookies.set("digilocker_token", accessToken, { httpOnly: true, secure: true, maxAge: 3600 });
  return res;
}
