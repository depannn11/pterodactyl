import { useState } from "react";
import { Package, packages, formatPrice } from "@/lib/packages";
import { PackageCard } from "@/components/PackageCard";
import { OrderForm, OrderData } from "@/components/OrderForm";
import { QRISPayment } from "@/components/QRISPayment";
import { SuccessPanel } from "@/components/SuccessPanel";
import { supabase } from "@/integrations/supabase/client";
import { Send, Server, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type Step = "select" | "form" | "payment" | "success";

interface PaymentData {
  qrCodeUrl: string;
  amountToPay: number;
  orderId: string;
}

interface PanelDetails {
  domain: string;
  username: string;
  password: string;
  serverId: string;
}

export default function Index() {
  const [step, setStep] = useState<Step>("select");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [panelDetails, setPanelDetails] = useState<PanelDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
  };

  const handleContinue = () => {
    if (selectedPackage) {
      setStep("form");
    }
  };

  const handleFormSubmit = async (data: OrderData) => {
    if (!selectedPackage) return;

    setLoading(true);
    setOrderData(data);

    try {
      const { data: response, error } = await supabase.functions.invoke("create-payment", {
        body: {
          amount: selectedPackage.price,
          panelName: data.panelName,
          whatsapp: data.whatsapp,
          packageId: selectedPackage.id,
        },
      });

      if (error) throw error;

      setPaymentData({
        qrCodeUrl: response.qrCodeUrl,
        amountToPay: response.amountToPay,
        orderId: response.orderId,
      });
      setStep("payment");
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Gagal membuat pembayaran. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!selectedPackage || !orderData) return;

    setLoading(true);
    toast.info("Pembayaran terdeteksi! Membuat panel...");

    try {
      const { data: response, error } = await supabase.functions.invoke("create-panel", {
        body: {
          panelName: orderData.panelName,
          password: orderData.password,
          whatsapp: orderData.whatsapp,
          ram: selectedPackage.ram,
          disk: selectedPackage.disk,
          cpu: selectedPackage.cpu,
        },
      });

      if (error) throw error;

      setPanelDetails(response);
      setStep("success");
      toast.success("Panel berhasil dibuat!");
    } catch (error) {
      console.error("Error creating panel:", error);
      toast.error("Gagal membuat panel. Tim support akan menghubungi Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "form") setStep("select");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full mb-6">
            <Server className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Pterodactyl Panel Hosting
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Order <span className="gradient-text">Panel Server</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pilih paket sesuai kebutuhanmu. Panel akan langsung aktif setelah pembayaran terverifikasi.
          </p>

          {/* Telegram Link */}
          <a
            href="https://t.me/depstore11"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4 text-accent" />
            <span className="text-sm text-accent">Join @depstore11 untuk info terbaru</span>
          </a>
        </header>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["select", "form", "payment", "success"].map((s, i) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all ${
                step === s
                  ? "bg-primary w-8"
                  : ["select", "form", "payment", "success"].indexOf(step) > i
                  ? "bg-primary/50"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        {step === "select" && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selected={selectedPackage?.id === pkg.id}
                  onSelect={handlePackageSelect}
                />
              ))}
            </div>

            {selectedPackage && (
              <div className="text-center">
                <button onClick={handleContinue} className="btn-primary">
                  Pilih Paket {selectedPackage.ram}GB - {formatPrice(selectedPackage.price)}
                </button>
              </div>
            )}
          </div>
        )}

        {step === "form" && selectedPackage && (
          <div className="max-w-md mx-auto animate-fade-in">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <OrderForm
              selectedPackage={selectedPackage}
              onSubmit={handleFormSubmit}
              loading={loading}
            />
          </div>
        )}

        {step === "payment" && paymentData && (
          <div className="max-w-md mx-auto">
            <QRISPayment
              qrCodeUrl={paymentData.qrCodeUrl}
              amountToPay={paymentData.amountToPay}
              orderId={paymentData.orderId}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        )}

        {step === "success" && panelDetails && (
          <div className="max-w-md mx-auto">
            <SuccessPanel panelDetails={panelDetails} />
          </div>
        )}
      </div>
    </div>
  );
}
