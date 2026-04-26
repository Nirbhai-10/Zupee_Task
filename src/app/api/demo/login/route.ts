import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Magic demo entry. Sets the `bharosa_demo` cookie so the app layout
 * surfaces a "Demo mode" badge with a reset button, then redirects to
 * Anjali's dashboard. No real auth — Phase 1's RLS-off demo policies
 * mean the seeded user is read/write-able with the anon key.
 *
 * Production replacement: swap for a Supabase magic-link sign-in once
 * proper auth ships.
 */
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const target = `${origin}/home?demo=1`;
  const response = NextResponse.redirect(target);
  response.cookies.set("bharosa_demo", "anjali", {
    httpOnly: false, // readable on the client so the badge can render via cookie sniffing
    sameSite: "lax",
    secure: target.startsWith("https://"),
    path: "/",
    maxAge: 60 * 60 * 24, // 24h
  });
  return response;
}

export async function POST(req: Request) {
  return GET(req);
}
