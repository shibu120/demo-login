import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { connection } from "next/server";

export type WmUser = {
  sub: string;          // Works Manager uid: use this as the permanent user key
  name?: string;
  employeeId?: string;
  email?: string;
  teamId?: string;
  userType?: string;
};

export type SessionData = {
  user?: WmUser;
  idToken?: string;     // kept for sign-out
  refreshToken?: string;   // used to ask Works Manager "still signed in?"
  checkedAt?: number;      // when we last asked
  // only while a sign-in is in progress:
  state?: string;
  nonce?: string;
  codeVerifier?: string;
  returnTo?: string;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "wmtest.session",   // any name except wm.*
  // id token + refresh token are ~8 KB sealed, over the 4 KB a single cookie allows,
  // so split across wmtest.session.0, .1, ...
  chunk: true,
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  // iron-session checks the cookie's expiry with Date.now(); this tells Next.js
  // the read happens at request time, not while prerendering.
  await connection();
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}