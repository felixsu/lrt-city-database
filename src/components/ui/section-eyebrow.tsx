export function SectionEyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-mono text-[11px] tracking-[1.5px] text-muted uppercase ${className}`}
    >
      {children}
    </div>
  );
}
