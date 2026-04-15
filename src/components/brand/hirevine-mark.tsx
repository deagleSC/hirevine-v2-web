import Image from "next/image";
import { cn } from "@/lib/utils";

interface HirevineMarkProps {
  className?: string;
  /** Extra classes for the image element (e.g. opacity). */
  iconClassName?: string;
  /** Width and height in px. */
  size?: number;
  /** LCP / above-the-fold surfaces (e.g. auth shell). */
  priority?: boolean;
}

export function HirevineMark({
  className,
  iconClassName,
  size = 64,
  priority = false,
}: HirevineMarkProps) {
  return (
    <Image
      src="/app-logo.png"
      alt="Hirevine"
      width={size}
      height={size}
      className={cn(
        "rounded-xl object-cover shadow-sm",
        iconClassName,
        className,
      )}
      priority={priority}
    />
  );
}
