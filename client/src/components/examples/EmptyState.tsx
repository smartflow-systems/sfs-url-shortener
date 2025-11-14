import { EmptyState } from "../EmptyState";

export default function EmptyStateExample() {
  return (
    <div className="p-6">
      <EmptyState onCreateClick={() => console.log("Create clicked")} />
    </div>
  );
}
