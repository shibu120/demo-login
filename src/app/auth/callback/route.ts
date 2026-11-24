import * as client from "openid-client";
import { NextResponse } from "next/server";
import { getOidcConfig, REDIRECT_URI } from "@/lib/oidc";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  const incoming = new URL(request.url);

  // e.g. the user pressed "Cancel" on the Works Manager "Choose an account" screen
  const error = incoming.searchParams.get("error");
  if (error) {
    return new Response(`Sign-in failed: ${error} - ${incoming.searchParams.get("error_description") ?? ""}`, { status: 400 });
  }

  try {
    const config = await getOidcConfig();
    // must be exactly the registered return address + the query Works Manager added
    const currentUrl = new URL(REDIRECT_URI + incoming.search);

    const tokens = await client.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: session.codeVerifier,
      expectedState: session.state,
      expectedNonce: session.nonce,
      idTokenExpected: true,
    });

    // signature, issuer, audience, expiry and nonce were checked by openid-client
    const c = tokens.claims()!;
    const s = (v: unknown) => (v == null ? undefined : String(v));
    session.user = {
      sub: c.sub,
      name: s(c.name),
      employeeId: s(c.employee_id),
      email: s(c.email),
      teamId: s(c.team_id),
      userType: s(c.user_type),
    };
    session.idToken = tokens.id_token;
    session.refreshToken = tokens.refresh_token;
    session.checkedAt = Date.now();

    const returnTo = session.returnTo ?? "/";
    session.state = session.nonce = session.codeVerifier = session.returnTo = undefined;
    await session.save();
    return NextResponse.redirect(new URL(returnTo, process.env.APP_URL));
  } catch (err) {
    console.error("Works Manager sign-in failed", err);
    return new Response(`Sign-in failed: ${(err as Error).message}`, { status: 400 });
  }
}