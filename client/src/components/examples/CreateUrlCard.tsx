import { CreateUrlCard } from "../CreateUrlCard";

export default function CreateUrlCardExample() {
  return (
    <div className="p-6 max-w-2xl">
      <CreateUrlCard
        onSubmit={(data) => console.log("URL created:", data)}
      />
    </div>
  );
}
