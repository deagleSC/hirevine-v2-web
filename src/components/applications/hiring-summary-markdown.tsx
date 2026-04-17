"use client";

import type { Components, UrlTransform } from "react-markdown";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

const hiringSummaryUrlTransform: UrlTransform = (url) => {
  const base = defaultUrlTransform(url);
  const t = base.trim();
  const low = t.toLowerCase();
  if (
    low.startsWith("https://") ||
    low.startsWith("http://") ||
    low.startsWith("mailto:") ||
    t.startsWith("#")
  ) {
    return base;
  }
  return undefined;
};

const markdownComponents: Partial<Components> = {
  a: ({ href, children, ...rest }) => {
    if (!href) return <span>{children}</span>;
    const external = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        {...rest}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
};

export type HiringSummaryMarkdownProps = {
  /** Markdown body (Node 3 `reasoning`, i.e. pipeline report). */
  children: string;
  className?: string;
};

/**
 * Renders hiring-summary Markdown from the API. Uses GFM; raw HTML in the
 * source is ignored (`skipHtml`) and link URLs are restricted after
 * `defaultUrlTransform`.
 */
export function HiringSummaryMarkdown({
  children,
  className,
}: HiringSummaryMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        urlTransform={hiringSummaryUrlTransform}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
