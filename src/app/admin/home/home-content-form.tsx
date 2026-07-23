"use client";

import { useState, useTransition } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { saveHomeContent } from "./actions";

export function HomeContentForm({
  initialAboutTitle,
  initialAbout,
  initialHowToJoinTitle,
  initialHowToJoin,
}: {
  initialAboutTitle: string;
  initialAbout: string;
  initialHowToJoinTitle: string;
  initialHowToJoin: string;
}) {
  const [aboutTitle, setAboutTitle] = useState(initialAboutTitle);
  const [about, setAbout] = useState(initialAbout);
  const [howToJoinTitle, setHowToJoinTitle] = useState(initialHowToJoinTitle);
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
        titleName="aboutTitle"
        titleValue={aboutTitle}
        onTitleChange={setAboutTitle}
        name="aboutMarkdown"
        value={about}
        onChange={setAbout}
        rows={10}
        previewVariant="editorial"
      />
      <Field
        label="How to Join"
        titleName="howToJoinTitle"
        titleValue={howToJoinTitle}
        onTitleChange={setHowToJoinTitle}
        name="howToJoinMarkdown"
        value={howToJoin}
        onChange={setHowToJoin}
        rows={14}
        helperText='Supports GitHub-flavored markdown. Add a fenced code block with language "mermaid" to render a diagram.'
        previewVariant="steps"
      />

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
        {saved && !isPending && (
          <span className="text-sm text-green-600">Saved</span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  titleName,
  titleValue,
  onTitleChange,
  name,
  value,
  onChange,
  rows,
  helperText,
  previewVariant,
}: {
  label: string;
  titleName: string;
  titleValue: string;
  onTitleChange: (value: string) => void;
  name: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  helperText?: string;
  previewVariant?: "steps" | "editorial";
}) {
  return (
    <div>
      <h2 className="text-lg font-medium text-ink">{label}</h2>
      {helperText && <p className="mt-1 text-sm text-muted">{helperText}</p>}

      <div className="mt-3">
        <label className="text-sm font-medium text-ink">Section title</label>
        <input
          type="text"
          name={titleName}
          value={titleValue}
          onChange={(e) => onTitleChange(e.target.value)}
          className="mt-1 w-full max-w-md rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full rounded-lg border border-hairline bg-canvas p-3 font-mono text-sm text-ink outline-none focus:border-accent"
        />
        <div className="rounded-lg border border-dashed border-hairline bg-surface-soft p-4">
          <p className="mb-2 font-mono text-[11px] tracking-[1px] text-muted uppercase">
            Preview
          </p>
          <h3 className="mb-3 text-[20px] font-serif text-ink">{titleValue}</h3>
          <MarkdownContent markdown={value} variant={previewVariant} />
        </div>
      </div>
    </div>
  );
}
