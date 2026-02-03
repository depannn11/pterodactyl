import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/packages";
import { Clock, Copy, Check, RefreshCw } from "lucide-react";

interface QRISPaymentProps {
  qrCodeUrl: string;
  amountToPay: number;
  orderId: string;
  onPaymentSuccess: () => void;
}

export function QRISPayment({ qrCodeUrl, amountToPay, orderId, onPaymentSuccess }: QRISPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkPayment = async () => {
      setChecking(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-payment?orderId=${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );
        const result = await response.json();
        if (result.status === "settlement") {
          onPaymentSuccess();
        }
      } catch (error) {
        console.error("Error checking payment:", error);
      }
      setChecking(false);
    };

    const interval = setInterval(checkPayment, 5000);
    return () => clearInterval(interval);
  }, [orderId, onPaymentSuccess]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyAmount = () => {
    navigator.clipboard.writeText(amountToPay.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-xl p-6 text-center space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">Scan QRIS untuk Bayar</h3>
        <p className="text-muted-foreground text-sm">
          Gunakan aplikasi e-wallet atau mobile banking
        </p>
      </div>

      <div className="bg-white rounded-xl p-4 inline-block">
        <img
          src={qrCodeUrl}
          alt="QRIS Code"
          className="w-64 h-64 object-contain"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className={timeLeft < 60 ? "text-destructive" : ""}>
            Sisa waktu: {formatTime(timeLeft)}
          </span>
        </div>

        <div className="glass-card rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Jumlah yang harus dibayar:</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold gradient-text">
              {formatPrice(amountToPay)}
            </span>
            <button
              onClick={copyAmount}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="text-xs text-destructive mt-2">
            ⚠️ Bayar sesuai nominal agar terdeteksi otomatis
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
          <span>Menunggu pembayaran...</span>
        </div>
      </div>
    </div>
  );
}
