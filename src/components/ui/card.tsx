export function Card({
  children,
  accent = false,
  className = "",
}: {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-hairline bg-surface ${className}`}
    >
      {accent && (
        <div className="absolute top-0 right-0 left-0 h-[3px] bg-accent" />
      )}
      {children}
    </div>
  );
}
