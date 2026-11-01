export default function MonthlyChart({
  title,
  data,
  format = (n: number) => n.toLocaleString(),
}: {
  title: string;
  data: { label: string; value: number }[];
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
          {title}
        </p>
        <p className="text-sm font-medium text-app-text dark:text-app-text-dark">
          {format(total)}
        </p>
      </div>
      <div className="flex items-end gap-2 h-32">
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
            <div
              className="w-full rounded-t-md bg-app-primary dark:bg-app-primary-dark"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? "4px" : "0" }}
              title={`${d.label}: ${format(d.value)}`}
            />
            <span className="text-[10px] text-app-text/50 dark:text-app-text-dark/50">
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}