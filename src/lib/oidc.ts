import * as client from "openid-client";

export const REDIRECT_URI = `${process.env.APP_URL}/auth/callback`;
export const POST_LOGOUT_URI = `${process.env.APP_URL}/`;
export const SCOPES = "openid profile email wm offline_access";

let config: Promise<client.Configuration> | undefined;

/** Reads http://localhost:5163/.well-known/openid-configuration once and keeps it. */
export function getOidcConfig(): Promise<client.Configuration> {
  config ??= client
    .discovery(
      new URL(process.env.WM_ISSUER!),
      process.env.WM_CLIENT_ID!,
      process.env.WM_CLIENT_SECRET!,
      undefined,
      // Works Manager runs on plain http locally. NEVER allow this in production.
      process.env.NODE_ENV === "production" ? undefined : { execute: [client.allowInsecureRequests] },
    )
    .catch((err) => {
      config = undefined; // try again next time (e.g. Works Manager was not running)
      throw err;
    });
  return config;
}