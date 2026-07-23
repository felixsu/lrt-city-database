export function Pill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] ${className}`}
    >
      {children}
    </span>
  );
}

export function RolePill({ role }: { role?: string | null }) {
  return role === "SUPER_ADMIN" ? (
    <Pill className="border border-accent text-accent-text">SUPER_ADMIN</Pill>
  ) : (
    <Pill className="bg-surface-soft text-muted">{role ?? "ADMIN"}</Pill>
  );
}
