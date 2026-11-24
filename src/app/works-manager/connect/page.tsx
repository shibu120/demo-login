"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";

// Cookie names we'll look for (case-insensitive). Adjust to match :8080.
const UID_KEYS = ["uid", "user_id", "userid", "id", "sub"];
const NAME_KEYS = [
  "firstname",
  "first_name",
  "fname",
  "givenname",
  "given_name",
  "name",
  "username",
  "user_name",
];

type Session = { uid: string; firstName: string };

const subscribe = () => () => {};
const getCookieString = () =>
  typeof document === "undefined" ? "" : document.cookie;
const getServerCookieString = () => "";

function parseCookies(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  for (const part of raw.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(value);
    } catch {
      out[key] = value;
    }
  }
  return out;
}

function pick(cookies: Record<string, string>, keys: string[]): string | null {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(cookies)) lower[k.toLowerCase()] = v;
  for (const k of keys) {
    if (lower[k] != null && lower[k] !== "") return lower[k];
  }
  return null;
}

function extractSession(cookies: Record<string, string>): Session | null {
  let uid = pick(cookies, UID_KEYS);
  let firstName = pick(cookies, NAME_KEYS);

  if (!uid || !firstName) {
    for (const value of Object.values(cookies)) {
      if (!value || (value[0] !== "{" && value[0] !== "%")) continue;
      try {
        const obj = JSON.parse(value);
        if (!uid) uid = obj.uid ?? obj.user_id ?? obj.id ?? obj.sub ?? uid;
        if (!firstName)
          firstName =
            obj.firstName ?? obj.first_name ?? obj.name ?? obj.givenName ?? firstName;
      } catch {
        /* not JSON */
      }
    }
  }

  if (!uid) return null;
  return { uid: String(uid), firstName: firstName ? String(firstName) : "" };
}

export default function WorksManagerConnectPage() {
  const router = useRouter();

  const cookieString = useSyncExternalStore(
    subscribe,
    getCookieString,
    getServerCookieString,
  );
  const cookies = useMemo(() => parseCookies(cookieString), [cookieString]);
  const session = useMemo(() => extractSession(cookies), [cookies]);
  const cookieNames = Object.keys(cookies);

  function cancel() {
    router.push("/login");
  }

  function approve() {
    if (!session) return;
    const params = new URLSearchParams({
      via: "works-manager",
      uid: session.uid,
      firstName: session.firstName,
    });
    router.push(`/login?${params.toString()}`);
  }

  const initial = session?.firstName
    ? session.firstName.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="flex min-h-full flex-1 justify-center bg-white">
      <div className="w-full max-w-[420px] px-10 pb-10 pt-14">
        <div className="flex justify-center">
          <Image
            src="/works-manager-logo.png"
            alt="Works Manager"
            width={40}
            height={40}
            priority
            className="h-9 w-9"
          />
        </div>

        {session ? (
          <>
            <h1 className="mt-4 text-center text-[22px] font-normal leading-7 text-[#202124]">
              Sign in
            </h1>
            <p className="mt-2 text-center text-[15px] text-[#5f6368]">
              to continue to Works Manager
            </p>

            <div className="mt-8 flex justify-center">
              <div className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-[#dadce0] py-1.5 pl-1.5 pr-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1b2749] text-xs font-medium text-white">
                  {initial}
                </span>
                <span className="truncate text-sm text-[#3c4043]">
                  {session.firstName || "Works Manager user"}
                  <span className="ml-1.5 font-mono text-[13px] text-[#80868b]">
                    · {session.uid}
                  </span>
                </span>
              </div>
            </div>

            <p className="mt-8 text-[13px] leading-5 text-[#5f6368]">
              To continue, Works Manager will share your name and user ID (UID)
              with this application. Only approve if you trust it.
            </p>

            <div className="mt-10 flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={cancel}
                className="rounded-md px-4 py-2 text-sm font-medium text-[#1b2749] transition-colors hover:bg-[#f1f3f8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={approve}
                className="rounded-md bg-[#8a2433] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#741f2b] focus:outline-none focus:ring-2 focus:ring-[#8a2433]/40 focus:ring-offset-2"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-center text-[22px] font-normal leading-7 text-[#202124]">
              No active session
            </h1>
            <p className="mt-2 text-center text-[15px] leading-6 text-[#5f6368]">
              We couldn&apos;t read your Works Manager session. Sign in at
              localhost:8080 in this browser, then try again.
            </p>

            {cookieNames.length > 0 && (
              <p className="mt-6 break-words rounded-md bg-[#f8f9fb] px-3 py-2 text-center text-xs text-[#80868b]">
                Cookies visible here: {cookieNames.join(", ")}
              </p>
            )}

            <div className="mt-10 flex justify-end">
              <button
                type="button"
                onClick={cancel}
                className="rounded-md px-4 py-2 text-sm font-medium text-[#1b2749] transition-colors hover:bg-[#f1f3f8]"
              >
                Back to sign in
              </button>
            </div>
          </>
        )}

        <div className="mt-14 flex items-center justify-center gap-1.5 text-[11px] text-[#9aa0ab]">
          <Image
            src="/works-manager-logo.png"
            alt=""
            width={12}
            height={12}
            className="h-3 w-3 opacity-60"
          />
          <span>Carisma Solutions · Works Manager</span>
        </div>
      </div>
    </div>
  );
}
