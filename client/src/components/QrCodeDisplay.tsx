import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

interface QrCodeDisplayProps {
  url: string;
  shortCode?: string;
}

export function QrCodeDisplay({ url, shortCode }: QrCodeDisplayProps) {
  const handleDownload = () => {
    const svg = document.getElementById("qr-code") as any;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 300;
    canvas.height = 300;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${shortCode || "code"}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
    console.log("QR code downloaded");
  };

  return (
    <Card>
      <CardHeader className="gap-1 space-y-0 pb-4">
        <CardTitle>QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center rounded-md border border-border bg-white p-6">
          <QRCodeSVG
            id="qr-code"
            value={url}
            size={256}
            level="H"
            data-testid="qr-code"
          />
        </div>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="w-full"
          data-testid="button-download-qr"
        >
          <Download className="mr-2 h-4 w-4" />
          Download PNG
        </Button>
      </CardContent>
    </Card>
  );
}
