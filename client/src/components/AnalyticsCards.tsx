import { Card, CardContent } from "@/components/ui/card";
import { Link2, MousePointerClick, TrendingUp } from "lucide-react";

interface AnalyticsCardsProps {
  totalUrls?: number;
  totalClicks?: number;
  clicksToday?: number;
}

export function AnalyticsCards({
  totalUrls = 0,
  totalClicks = 0,
  clicksToday = 0,
}: AnalyticsCardsProps) {
  const stats = [
    {
      label: "Total URLs",
      value: totalUrls.toLocaleString(),
      icon: Link2,
      testId: "stat-total-urls",
    },
    {
      label: "Total Clicks",
      value: totalClicks.toLocaleString(),
      icon: MousePointerClick,
      testId: "stat-total-clicks",
    },
    {
      label: "Clicks Today",
      value: clicksToday.toLocaleString(),
      icon: TrendingUp,
      testId: "stat-clicks-today",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-4xl font-bold" data-testid={stat.testId}>
                  {stat.value}
                </p>
              </div>
              <div className="rounded-md bg-primary/10 p-2">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
