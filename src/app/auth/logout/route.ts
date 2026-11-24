import * as client from "openid-client";
import { NextResponse } from "next/server";
import { getOidcConfig, POST_LOGOUT_URI } from "@/lib/oidc";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  const idToken = session.idToken;
  session.destroy(); // sign out of this app

  // then sign out of Works Manager (and so of every other app)
  const config = await getOidcConfig();
  const url = client.buildEndSessionUrl(config, {
    post_logout_redirect_uri: POST_LOGOUT_URI,
    ...(idToken ? { id_token_hint: idToken } : {}),
  });
  return NextResponse.redirect(url, 303); // 303 = follow with GET
}