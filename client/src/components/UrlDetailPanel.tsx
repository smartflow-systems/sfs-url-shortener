import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Copy } from "lucide-react";
import { QrCodeDisplay } from "./QrCodeDisplay";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface ClickData {
  date: string;
  clicks: number;
}

interface ReferrerData {
  source: string;
  clicks: number;
}

interface UrlDetailPanelProps {
  shortCode: string;
  destination: string;
  created: string;
  totalClicks: number;
  clickHistory?: ClickData[];
  referrers?: ReferrerData[];
  onBack: () => void;
}

export function UrlDetailPanel({
  shortCode,
  destination,
  created,
  totalClicks,
  clickHistory = [],
  referrers = [],
  onBack,
}: UrlDetailPanelProps) {
  const { toast } = useToast();
  const shortUrl = `${window.location.origin}/${shortCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Copied!",
      description: "Short URL copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        data-testid="button-back"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all URLs
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="gap-1 space-y-0 pb-4">
              <CardTitle>URL Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Short URL</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm bg-muted px-3 py-2 rounded-md" data-testid="text-short-url">
                    {shortUrl}
                  </code>
                  <Button size="sm" variant="outline" onClick={handleCopy} data-testid="button-copy-detail">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Destination</p>
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm truncate">{destination}</span>
                  <a
                    href={destination}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-destination-detail"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Clicks</p>
                  <p className="text-2xl font-bold" data-testid="text-detail-clicks">{totalClicks}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="text-sm">{created}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-1 space-y-0 pb-4">
              <CardTitle>Click Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clickHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {referrers.length > 0 && (
            <Card>
              <CardHeader className="gap-1 space-y-0 pb-4">
                <CardTitle>Top Referrers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referrers.map((ref, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{ref.source}</span>
                      <Badge variant="secondary">{ref.clicks} clicks</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <QrCodeDisplay url={shortUrl} shortCode={shortCode} />
        </div>
      </div>
    </div>
  );
}
