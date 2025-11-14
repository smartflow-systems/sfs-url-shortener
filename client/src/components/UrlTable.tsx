import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, QrCode, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export interface UrlItem {
  id: string;
  shortCode: string;
  destination: string;
  clicks: number;
  created: string;
}

interface UrlTableProps {
  urls?: UrlItem[];
  onUrlClick?: (url: UrlItem) => void;
  onDelete?: (id: string) => void;
  onViewQr?: (url: UrlItem) => void;
}

export function UrlTable({ urls = [], onUrlClick, onDelete, onViewQr }: UrlTableProps) {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const filteredUrls = urls.filter(
    (url) =>
      url.shortCode.toLowerCase().includes(search.toLowerCase()) ||
      url.destination.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (shortCode: string) => {
    const shortUrl = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Copied!",
      description: "Short URL copied to clipboard",
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search URLs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search-urls"
        />
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Short URL</TableHead>
              <TableHead className="hidden md:table-cell">Destination</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="hidden lg:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUrls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No URLs found
                </TableCell>
              </TableRow>
            ) : (
              filteredUrls.map((url) => (
                <TableRow key={url.id} className="hover-elevate">
                  <TableCell>
                    <button
                      onClick={() => onUrlClick?.(url)}
                      className="font-mono text-sm text-primary hover:underline"
                      data-testid={`link-url-${url.id}`}
                    >
                      /{url.shortCode}
                    </button>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-md text-sm text-muted-foreground">
                        {url.destination}
                      </span>
                      <a
                        href={url.destination}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                        data-testid={`link-destination-${url.id}`}
                      >
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" data-testid={`badge-clicks-${url.id}`}>
                      {url.clicks}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {url.created}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCopy(url.shortCode)}
                        data-testid={`button-copy-${url.id}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onViewQr?.(url)}
                        data-testid={`button-qr-${url.id}`}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete?.(url.id)}
                        data-testid={`button-delete-${url.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
