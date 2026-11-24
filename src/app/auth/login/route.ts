import * as client from "openid-client";
import { NextResponse } from "next/server";
import { getOidcConfig, REDIRECT_URI, SCOPES } from "@/lib/oidc";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const config = await getOidcConfig();
  const session = await getSession();

  // PKCE + state + nonce: random values remembered in the session, checked on the way back
  const codeVerifier = client.randomPKCECodeVerifier();
  const state = client.randomState();
  const nonce = client.randomNonce();

  const returnTo = new URL(request.url).searchParams.get("returnTo");
  session.codeVerifier = codeVerifier;
  session.state = state;
  session.nonce = nonce;
  session.returnTo = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
  await session.save();

  const url = client.buildAuthorizationUrl(config, {
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge: await client.calculatePKCECodeChallenge(codeVerifier),
    code_challenge_method: "S256",
    state,
    nonce,
  });
  return NextResponse.redirect(url);
}