import { UrlDetailPanel } from "../UrlDetailPanel";

export default function UrlDetailPanelExample() {
  const mockClickHistory = [
    { date: "Nov 8", clicks: 12 },
    { date: "Nov 9", clicks: 18 },
    { date: "Nov 10", clicks: 25 },
    { date: "Nov 11", clicks: 31 },
    { date: "Nov 12", clicks: 28 },
    { date: "Nov 13", clicks: 42 },
    { date: "Nov 14", clicks: 35 },
  ];

  const mockReferrers = [
    { source: "twitter.com", clicks: 89 },
    { source: "facebook.com", clicks: 56 },
    { source: "Direct", clicks: 42 },
  ];

  return (
    <div className="p-6 max-w-7xl">
      <UrlDetailPanel
        shortCode="promo"
        destination="https://shop.example.com/summer-sale-2025"
        created="Nov 8, 2025"
        totalClicks={892}
        clickHistory={mockClickHistory}
        referrers={mockReferrers}
        onBack={() => console.log("Back clicked")}
      />
    </div>
  );
}
