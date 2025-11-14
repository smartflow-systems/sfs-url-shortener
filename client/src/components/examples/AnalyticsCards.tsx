import { AnalyticsCards } from "../AnalyticsCards";

export default function AnalyticsCardsExample() {
  return (
    <div className="p-6 max-w-7xl">
      <AnalyticsCards
        totalUrls={24}
        totalClicks={1847}
        clicksToday={143}
      />
    </div>
  );
}
