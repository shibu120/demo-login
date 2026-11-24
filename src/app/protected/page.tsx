import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Reads the session cookie on every request, so this page cannot be prerendered.
export const instant = false;

export default async function ProtectedPage() {
  const { user } = await getSession();
  if (!user) redirect("/auth/login?returnTo=/protected");

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Only signed-in employees see this</h1>
      <p>Employee: {user.employeeId} · Team: {user.teamId}</p>
      <a href="/">Home</a>
    </main>
  );
}