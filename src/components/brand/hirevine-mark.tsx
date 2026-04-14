import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface HirevineMarkProps {
  className?: string;
  iconClassName?: string;
  /** Approximate total height in px for the icon tile. */
  size?: number;
}

export function HirevineMark({
  className,
  iconClassName,
  size = 64,
}: HirevineMarkProps) {
  const iconPx = Math.round(size * 0.45);
  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground inline-flex items-center justify-center rounded-xl shadow-sm",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Briefcase
        className={cn("shrink-0", iconClassName)}
        aria-hidden
        width={iconPx}
        height={iconPx}
      />
    </div>
  );
}
