import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  text: string;
  size?: number;
}

export function QRCodeDisplay({ text, size = 200 }: QRCodeDisplayProps) {
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: '#ffffff',
        light: '#00000000' // transparent background
      }
    }).then(url => setQrUrl(url)).catch(console.error);
  }, [text, size]);

  if (!qrUrl) return <div className="animate-pulse bg-muted rounded-md" style={{ width: size, height: size }} />;

  return (
    <div className="bg-card p-4 rounded-xl border border-border inline-block shadow-sm">
      <img src={qrUrl} alt={`QR code for ${text}`} width={size} height={size} />
      <div className="text-center mt-2 text-xs font-mono text-muted-foreground break-all max-w-[200px]">
        {text}
      </div>
    </div>
  );
}