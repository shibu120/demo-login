import { getSession } from "@/lib/session";

// Reads the session cookie on every request, so this page cannot be prerendered.
export const instant = false;

export default async function Home() {
  const { user } = await getSession();

  if (!user) {
    return (
      <main style={{ padding: 40, fontFamily: "sans-serif" }}>
        <h1>Next.js test app</h1>
        {/* plain <a>, NOT <Link>: Link prefetches and would start a sign-in by itself */}
        <a href="/auth/login">Sign in with Works Manager</a>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Hello {user.name}</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <p><a href="/protected">Protected page</a></p>
      <form action="/auth/logout" method="post">
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}