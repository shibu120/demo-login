"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type AuthUser = { uid: string; firstName: string };

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cleared, setCleared] = useState(false);

  // Works Manager redirects back to /login?via=works-manager&uid=...&firstName=...
  const user: AuthUser | null =
    !cleared &&
    searchParams.get("via") === "works-manager" &&
    searchParams.get("uid")
      ? {
          uid: String(searchParams.get("uid")),
          firstName: searchParams.get("firstName")
            ? String(searchParams.get("firstName"))
            : "",
        }
      : null;

  function openWorksManager() {
    router.push("/works-manager/connect");
  }

  function useDifferentAccount() {
    setCleared(true);
    router.replace("/login");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    // Wire this up to your auth endpoint.
    console.log("login", {
      email: data.get("email"),
      password: data.get("password"),
    });
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
  }

  if (user) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1b2749] text-2xl font-semibold text-white">
          {user.firstName ? user.firstName.charAt(0).toUpperCase() : "?"}
        </div>

        <div>
          <p className="text-lg font-semibold text-[#1b2749]">
            Welcome, {user.firstName || "there"}!
          </p>
          <p className="mt-1 text-sm text-[#64748b]">
            Signed in with Works Manager.
          </p>
        </div>

        <dl className="w-full divide-y divide-[#eef1f6] rounded-lg border border-[#e5e8ef] bg-[#f8fafc] text-left text-sm">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <dt className="text-[#64748b]">First name</dt>
            <dd className="font-medium text-[#1b2749]">{user.firstName || "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <dt className="text-[#64748b]">UID</dt>
            <dd className="break-all font-mono text-[13px] text-[#1b2749]">
              {user.uid}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={useDifferentAccount}
          className="text-sm font-medium text-[#2b3f86] transition-colors hover:text-[#8a2433]"
        >
          Use a different account
        </button>
      </div>
    );
  }

  const fieldClass =
    "h-11 w-full rounded-[4px] border border-[#d4dae4] bg-white px-3.5 text-sm text-[#1b2749] outline-none transition-colors placeholder:text-[#9aa4b5] focus:border-[#2b3f86] focus:ring-2 focus:ring-[#2b3f86]/15";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[13px] font-semibold text-[#1b2749]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-[13px] font-semibold text-[#1b2749]"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className={`${fieldClass} pr-14`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-xs font-medium text-[#64748b] transition-colors hover:text-[#1b2749]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 flex h-11 items-center justify-center rounded-[4px] bg-[#8a2433] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#741f2b] focus:outline-none focus:ring-2 focus:ring-[#8a2433]/40 focus:ring-offset-2 disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Log in"}
      </button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[#e5e8ef]" />
        <span className="text-xs text-[#94a3b8]">or</span>
        <span className="h-px flex-1 bg-[#e5e8ef]" />
      </div>

      <button
        type="button"
        onClick={openWorksManager}
        className="flex h-11 items-center justify-center gap-2.5 rounded-[4px] border border-[#d4dae4] bg-white text-sm font-medium text-[#1b2749] transition-colors hover:border-[#8a2433]/40 hover:bg-[#f8fafc]"
      >
        <Image
          src="/works-manager-logo.png"
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px]"
        />
        Continue with Works Manager
      </button>
    </form>
  );
}
