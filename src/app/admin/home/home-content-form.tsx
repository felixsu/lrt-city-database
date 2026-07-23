"use client";

import { useState, useTransition } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { saveHomeContent } from "./actions";

export function HomeContentForm({
  initialAbout,
  initialHowToJoin,
}: {
  initialAbout: string;
  initialHowToJoin: string;
}) {
  const [about, setAbout] = useState(initialAbout);
  const [howToJoin, setHowToJoin] = useState(initialHowToJoin);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await saveHomeContent(formData);
      setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-10">
      <Field
        label="About"
        name="aboutMarkdown"
        value={about}
        onChange={setAbout}
        rows={10}
      />
      <Field
        label="How to Join"
        name="howToJoinMarkdown"
        value={howToJoin}
        onChange={setHowToJoin}
        rows={14}
        helperText='Supports GitHub-flavored markdown. Add a fenced code block with language "mermaid" to render a diagram.'
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
        {saved && !isPending && (
          <span className="text-sm text-green-600 dark:text-green-400">Saved</span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  rows,
  helperText,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  helperText?: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{label}</h2>
      {helperText && <p className="mt-1 text-sm text-neutral-500">{helperText}</p>}
      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full rounded-md border border-neutral-300 p-3 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-950"
        />
        <div className="rounded-md border border-dashed border-neutral-300 p-3 dark:border-neutral-700">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Preview
          </p>
          <MarkdownContent markdown={value} />
        </div>
      </div>
    </div>
  );
}
