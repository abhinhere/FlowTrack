import { clsx } from "clsx";

export function PageSection({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={clsx("rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-card", className)}>{children}</section>;
}
