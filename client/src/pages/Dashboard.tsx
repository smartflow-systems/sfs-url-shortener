import { useState } from "react";
import { Header } from "@/components/Header";
import { CreateUrlCard } from "@/components/CreateUrlCard";
import { AnalyticsCards } from "@/components/AnalyticsCards";
import { UrlTable, type UrlItem } from "@/components/UrlTable";
import { UrlDetailPanel } from "@/components/UrlDetailPanel";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const [selectedUrl, setSelectedUrl] = useState<UrlItem | null>(null);
  const [urls, setUrls] = useState<UrlItem[]>([
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
  ]);

  const handleCreateUrl = (data: { url: string; customSlug: string; generateQr: boolean }) => {
    const newUrl: UrlItem = {
      id: Date.now().toString(),
      shortCode: data.customSlug,
      destination: data.url,
      clicks: 0,
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setUrls([newUrl, ...urls]);
    console.log("New URL created:", newUrl);
  };

  const handleDeleteUrl = (id: string) => {
    setUrls(urls.filter((url) => url.id !== id));
    if (selectedUrl?.id === id) {
      setSelectedUrl(null);
    }
    console.log("URL deleted:", id);
  };

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const clicksToday = 143;

  const mockClickHistory = [
    { date: "Nov 8", clicks: 12 },
    { date: "Nov 9", clicks: 18 },
    { date: "Nov 10", clicks: 25 },
    { date: "Nov 11", clicks: 31 },
    { date: "Nov 12", clicks: 28 },
    { date: "Nov 13", clicks: 42 },
    { date: "Nov 14", clicks: selectedUrl ? selectedUrl.clicks % 50 : 35 },
  ];

  const mockReferrers = [
    { source: "twitter.com", clicks: 89 },
    { source: "facebook.com", clicks: 56 },
    { source: "Direct", clicks: 42 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {selectedUrl ? (
          <UrlDetailPanel
            shortCode={selectedUrl.shortCode}
            destination={selectedUrl.destination}
            created={selectedUrl.created}
            totalClicks={selectedUrl.clicks}
            clickHistory={mockClickHistory}
            referrers={mockReferrers}
            onBack={() => setSelectedUrl(null)}
          />
        ) : (
          <div className="space-y-8">
            <AnalyticsCards
              totalUrls={urls.length}
              totalClicks={totalClicks}
              clicksToday={clicksToday}
            />

            <CreateUrlCard onSubmit={handleCreateUrl} />

            {urls.length === 0 ? (
              <Card>
                <EmptyState onCreateClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
              </Card>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Your URLs</h2>
                <UrlTable
                  urls={urls}
                  onUrlClick={setSelectedUrl}
                  onDelete={handleDeleteUrl}
                  onViewQr={(url) => {
                    setSelectedUrl(url);
                    console.log("View QR for:", url);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
