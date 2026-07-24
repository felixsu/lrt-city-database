"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mermaid } from "./mermaid";
import type { ComponentPropsWithoutRef } from "react";

export function MarkdownContent({
  markdown,
  variant,
}: {
  markdown: string;
  variant?: "steps" | "editorial";
}) {
  if (!markdown.trim()) {
    return <p className="text-sm text-muted-soft">No content yet.</p>;
  }

  return (
    <div
      className="prose max-w-none prose-headings:font-serif prose-headings:text-ink prose-p:font-serif prose-p:text-[17px] prose-p:leading-[1.7] prose-p:text-body prose-li:text-body prose-strong:text-ink prose-a:text-link prose-code:text-ink"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props: ComponentPropsWithoutRef<"code"> & { className?: string }) {
            const { children, className } = props;
            const match = /language-(\w+)/.exec(className ?? "");
            const lang = match?.[1];
            const content = String(children).replace(/\n$/, "");

            if (lang === "mermaid") {
              return <Mermaid chart={content} />;
            }

            if (!match) {
              return <code className={className}>{children}</code>;
            }

            return (
              <pre>
                <code className={className}>{content}</code>
              </pre>
            );
          },
          ...(variant === "steps"
            ? {
                ol(props: ComponentPropsWithoutRef<"ol">) {
                  const { children } = props;
                  return <ol className="steps-list flex flex-col gap-3.5">{children}</ol>;
                },
                li(props: ComponentPropsWithoutRef<"li">) {
                  const { children } = props;
                  return (
                    <li className="font-serif text-[17px] leading-[1.7] text-body">
                      {children}
                    </li>
                  );
                },
              }
            : {}),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
