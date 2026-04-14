import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Welcome to <span className="text-primary">Noma Docs</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The ultimate open-source, self-hostable workspace and collaborative documentation platform.
        </p>
        <div className="space-x-4">
          <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            Get Started
          </Link>
          <Link href="https://github.com/noma-docs" className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            GitHub
          </Link>
        </div>
      </div>
    </div>
  );
}
