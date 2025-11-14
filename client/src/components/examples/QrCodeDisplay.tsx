import { QrCodeDisplay } from "../QrCodeDisplay";

export default function QrCodeDisplayExample() {
  return (
    <div className="p-6 max-w-md">
      <QrCodeDisplay
        url="https://example.com/abc123"
        shortCode="abc123"
      />
    </div>
  );
}
