import { UrlTable } from "../UrlTable";

export default function UrlTableExample() {
  const mockUrls = [
    {
      id: "1",
      shortCode: "docs",
      destination: "https://example.com/documentation/getting-started",
      clicks: 245,
      created: "Nov 10, 2025",
    },
    {
      id: "2",
      shortCode: "promo",
      destination: "https://shop.example.com/summer-sale-2025",
      clicks: 892,
      created: "Nov 8, 2025",
    },
    {
      id: "3",
      shortCode: "app",
      destination: "https://app.example.com/dashboard",
      clicks: 156,
      created: "Nov 5, 2025",
    },
  ];

  return (
    <div className="p-6 max-w-7xl">
      <UrlTable
        urls={mockUrls}
        onUrlClick={(url) => console.log("Clicked:", url)}
        onDelete={(id) => console.log("Delete:", id)}
        onViewQr={(url) => console.log("View QR:", url)}
      />
    </div>
  );
}
