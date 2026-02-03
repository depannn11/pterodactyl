import { useState } from "react";
import { Package, formatPrice } from "@/lib/packages";
import { User, Lock, Phone, AlertCircle } from "lucide-react";

interface OrderFormProps {
  selectedPackage: Package;
  onSubmit: (data: OrderData) => void;
  loading: boolean;
}

export interface OrderData {
  panelName: string;
  password: string;
  whatsapp: string;
}

export function OrderForm({ selectedPackage, onSubmit, loading }: OrderFormProps) {
  const [panelName, setPanelName] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateWhatsApp = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!panelName.trim()) {
      newErrors.panelName = "Nama panel wajib diisi";
    } else if (panelName.length < 3) {
      newErrors.panelName = "Nama panel minimal 3 karakter";
    }

    if (!whatsapp.trim()) {
      newErrors.whatsapp = "Nomor WhatsApp wajib diisi";
    } else if (!validateWhatsApp(whatsapp)) {
      newErrors.whatsapp = "Nomor WhatsApp tidak valid";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      panelName: panelName.trim(),
      password: password.trim(),
      whatsapp: whatsapp.replace(/\D/g, ''),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="text-center pb-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Detail Pesanan</h3>
          <p className="text-muted-foreground text-sm">
            Paket {selectedPackage.ram}GB RAM - {formatPrice(selectedPackage.price)}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nama Panel <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              placeholder="contoh: server-minecraft"
              className="input-field"
              maxLength={50}
            />
            {errors.panelName && (
              <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.panelName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password <span className="text-muted-foreground text-xs">(opsional)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kosongkan untuk generate otomatis"
              className="input-field"
              maxLength={32}
            />
            <p className="text-muted-foreground text-xs mt-1">
              Jika dikosongkan, password akan dibuat otomatis
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Nomor WhatsApp <span className="text-destructive">*</span>
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="08123456789"
              className="input-field"
              maxLength={15}
            />
            {errors.whatsapp && (
              <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.whatsapp}
              </p>
            )}
            <p className="text-muted-foreground text-xs mt-1">
              Untuk menerima notifikasi setelah panel aktif
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full text-center"
      >
        {loading ? "Memproses..." : "Lanjut ke Pembayaran"}
      </button>
    </form>
  );
}
