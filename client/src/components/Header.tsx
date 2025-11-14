import { Link2 } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold" data-testid="text-app-title">
              LinkShort
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
