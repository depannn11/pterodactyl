import { CheckCircle, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";

interface PanelDetails {
  domain: string;
  username: string;
  password: string;
  serverId: string;
}

interface SuccessPanelProps {
  panelDetails: PanelDetails;
}

export function SuccessPanel({ panelDetails }: SuccessPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="p-1.5 hover:bg-secondary rounded transition-colors"
    >
      {copiedField === field ? (
        <Check className="w-4 h-4 text-primary" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="glass-card rounded-xl p-8 text-center space-y-6 animate-scale-in">
      <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center glow-effect">
        <CheckCircle className="w-10 h-10 text-primary" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Panel Berhasil Dibuat! 🎉
        </h2>
        <p className="text-muted-foreground">
          Server kamu sudah siap digunakan
        </p>
      </div>

      <div className="bg-secondary/50 rounded-xl p-6 text-left space-y-4">
        <h3 className="font-semibold text-foreground text-center mb-4">
          Detail Akses Panel
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">URL Panel</p>
              <p className="text-sm font-mono text-foreground truncate max-w-[200px]">
                {panelDetails.domain}
              </p>
            </div>
            <div className="flex gap-1">
              <CopyButton text={panelDetails.domain} field="domain" />
              <a
                href={panelDetails.domain}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-secondary rounded transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="text-sm font-mono text-foreground">{panelDetails.username}</p>
            </div>
            <CopyButton text={panelDetails.username} field="username" />
          </div>

          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Password</p>
              <p className="text-sm font-mono text-foreground">{panelDetails.password}</p>
            </div>
            <CopyButton text={panelDetails.password} field="password" />
          </div>

          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Server ID</p>
              <p className="text-sm font-mono text-foreground">{panelDetails.serverId}</p>
            </div>
            <CopyButton text={panelDetails.serverId} field="serverId" />
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Detail ini juga dikirim ke WhatsApp kamu
      </p>
    </div>
  );
}
