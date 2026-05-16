import { ClipboardList } from "lucide-react";

export function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-white/12 bg-white/[0.03] px-6 text-center">
      <div className="rounded-2xl bg-white/8 p-3 text-blue-200">
        <ClipboardList className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
