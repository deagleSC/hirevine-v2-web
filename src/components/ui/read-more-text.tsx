"use client";

import { useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_COLLAPSED_CHARS = 500;

type ReadMoreTextProps = {
  text: string;
  /** Character count (UTF-16 code units) before showing toggle. */
  collapsedMaxChars?: number;
  className?: string;
};

/**
 * Long plain text with “Read more” / “Read less”. Preserves line breaks via
 * `whitespace-pre-wrap`.
 */
export function ReadMoreText({
  text,
  collapsedMaxChars = DEFAULT_COLLAPSED_CHARS,
  className,
}: ReadMoreTextProps) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  const needsToggle = text.length > collapsedMaxChars;

  const visibleText = useMemo(() => {
    if (!needsToggle || expanded) return text;
    return text.slice(0, collapsedMaxChars);
  }, [text, needsToggle, expanded, collapsedMaxChars]);

  if (!needsToggle) {
    return (
      <p
        className={cn(
          "text-foreground text-sm leading-relaxed whitespace-pre-wrap",
          className,
        )}
      >
        {text}
      </p>
    );
  }

  return (
    <div className={className}>
      <p
        id={contentId}
        className="text-foreground text-sm leading-relaxed whitespace-pre-wrap"
      >
        {visibleText}
        {!expanded ? "…" : null}
      </p>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="mt-2 h-auto min-h-0 px-0 py-0 font-medium"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? "Read less" : "Read more"}
      </Button>
    </div>
  );
}
