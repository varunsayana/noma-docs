import { redirect } from "next/navigation";

// Server component — runs inside Docker, can reach 'api:4000' directly
async function getSetupStatus() {
  try {
    const res = await fetch("http://api:4000/api/auth/setup-status", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const status = await getSetupStatus();

  // If we can't reach the API, go login (shows a helpful error there)
  if (!status) {
    redirect("/login");
  }

  // First-run: no users yet → go to setup
  if (!status.setupComplete) {
    redirect("/setup");
  }

  // Normal: setup done → go to login
  redirect("/login");
}
