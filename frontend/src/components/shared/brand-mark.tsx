import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  inverse?: boolean;
}

export function BrandMark({ className, inverse = false }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden",
        inverse ? "h-[92px] w-[110px] rounded-md bg-white p-1" : "h-[72px] w-[92px]",
        className,
      )}
    >
      <Image
        src="/images/logo-fuerza-upt.png"
        alt="Fuerza UPT"
        fill
        sizes={inverse ? "110px" : "92px"}
        className={cn("object-contain", inverse && "p-1")}
        preload={!inverse}
        unoptimized
      />
    </span>
  );
}
