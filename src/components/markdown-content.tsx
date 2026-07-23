"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mermaid } from "./mermaid";
import type { ComponentPropsWithoutRef } from "react";

export function MarkdownContent({ markdown }: { markdown: string }) {
  if (!markdown.trim()) {
    return <p className="text-sm text-neutral-500">No content yet.</p>;
  }

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
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
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
