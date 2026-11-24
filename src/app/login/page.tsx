import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-full flex-1">
      {/* Brand accent line across the top */}
      <span className="absolute inset-x-0 top-0 z-20 h-0.5 bg-gradient-to-r from-[#8a2433] via-[#8a2433] to-[#1b2749]" />

      {/* Form panel */}
      <div className="relative flex w-full flex-col bg-white lg:w-[62%]">
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-sm">
            <h1 className="text-center text-3xl font-semibold tracking-tight text-[#1b2749]">
              Welcome back
            </h1>
            <p className="mb-8 mt-2 text-center text-sm text-[#64748b]">
              Sign in to your account to continue
            </p>

            <Suspense fallback={<div className="min-h-88" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Decorative brand panel */}
      <div className="relative hidden overflow-hidden lg:block lg:w-[38%]">
        <svg
          aria-hidden="true"
          viewBox="0 0 480 760"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <rect width="480" height="760" fill="#152150" />
          <circle cx="480" cy="700" r="430" fill="#182658" />
          <circle cx="480" cy="700" r="320" fill="#1d2f6b" />
          <circle cx="480" cy="700" r="210" fill="#23387e" />
          <circle
            cx="480"
            cy="700"
            r="520"
            fill="none"
            stroke="#8a2433"
            strokeWidth="2"
            opacity="0.4"
          />
          <circle
            cx="90"
            cy="120"
            r="70"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.08"
          />
        </svg>
      </div>
    </div>
  );
}
