import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Link2 className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2" data-testid="text-empty-title">
        No URLs yet
      </h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Create your first short URL to get started with tracking and analytics
      </p>
      <Button onClick={onCreateClick} data-testid="button-create-first">
        Create Your First URL
      </Button>
    </div>
  );
}
