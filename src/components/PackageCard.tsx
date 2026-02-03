import { Package, formatPrice } from "@/lib/packages";
import { HardDrive, Cpu, MemoryStick, Check } from "lucide-react";

interface PackageCardProps {
  pkg: Package;
  selected: boolean;
  onSelect: (pkg: Package) => void;
}

export function PackageCard({ pkg, selected, onSelect }: PackageCardProps) {
  return (
    <div
      onClick={() => onSelect(pkg)}
      className={`package-card ${selected ? 'selected' : ''} ${pkg.isTop ? 'top' : ''}`}
    >
      {pkg.isTop && <span className="badge-top">🔥 TOP</span>}
      
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-foreground">{pkg.ram}GB</h3>
        <p className="text-lg font-semibold gradient-text">{formatPrice(pkg.price)}</p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          <MemoryStick className="w-4 h-4 text-primary" />
          <span>RAM: {pkg.ram * 1024}MB</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <HardDrive className="w-4 h-4 text-primary" />
          <span>Disk: {pkg.disk}GB</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Cpu className="w-4 h-4 text-primary" />
          <span>CPU: {pkg.cpu}%</span>
        </div>
      </div>

      {selected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
