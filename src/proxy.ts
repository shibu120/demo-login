import * as client from "openid-client";
import { getIronSession } from "iron-session";
import { NextResponse, type NextRequest } from "next/server";
import { getOidcConfig } from "@/lib/oidc";
import { sessionOptions, type SessionData } from "@/lib/session";

// Ask Works Manager on EVERY page load / navigation, so a Works Manager sign-out is noticed on the very next click.
// (Background prefetches are skipped by the matcher below.) Raise this, e.g. to 60_000, to ask at most once a minute
// when the app gets busy - but then a Works Manager sign-out can take up to that long to show here.
const CHECK_EVERY_MS = 0;

type Tokens = Awaited<ReturnType<typeof client.refreshTokenGrant>>;

// The browser often sends several requests at once (page + prefetches). Without this,
// each would spend the same refresh token; Works Manager rotates it, so all but the
// first would get invalid_grant and wrongly sign the user out. Requests carrying the
// same refresh token share one call, and the answer is kept briefly for stragglers
// that still carry the old cookie.
const inFlight = new Map<string, Promise<Tokens>>();
const SHARE_RESULT_MS = 30_000;

function refreshOnce(refreshToken: string): Promise<Tokens> {
  let pending = inFlight.get(refreshToken);
  if (!pending) {
    pending = getOidcConfig().then((config) => client.refreshTokenGrant(config, refreshToken));
    inFlight.set(refreshToken, pending);
    const forget = () => setTimeout(() => inFlight.delete(refreshToken), SHARE_RESULT_MS);
    pending.then(forget, forget);
  }
  return pending;
}

// Runs before every matched page (Next.js 16 name for middleware).
export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  // not signed in, or checked recently: nothing to do
  if (!session.user || !session.refreshToken) return response;
  if (Date.now() - (session.checkedAt ?? 0) < CHECK_EVERY_MS) return response;

  try {
    // Works Manager answers only while the employee's Works Manager login is still active
    const tokens = await refreshOnce(session.refreshToken);
    session.refreshToken = tokens.refresh_token ?? session.refreshToken; // a new one is issued each time
    session.idToken = tokens.id_token ?? session.idToken;
    session.checkedAt = Date.now();
    await session.save();
    console.log(`[wm-check] ${session.user.sub}: still signed in to Works Manager`);
    return response;
  } catch (err) {
    if ((err as { error?: string }).error === "invalid_grant") {
      console.log(`[wm-check] ${session.user.sub}: Works Manager session ended, signing out`);
      // signed out of Works Manager (or 12 h passed / account locked): sign out here too
      const out = NextResponse.redirect(new URL("/", request.url));
      // destroy() clears every chunk cookie, not just the base name
      (await getIronSession<SessionData>(request, out, sessionOptions)).destroy();
      return out;
    }
    // Works Manager unreachable: keep the session and try again next time
    console.error("Works Manager check failed", err);
    return response;
  }
}

export const config = {
  matcher: [
    {
      // every page except the sign-in routes and static files...
      source: "/((?!auth/|_next/|favicon.ico).*)",
      // ...and except <Link> prefetches (made in the background, not by the user)
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
