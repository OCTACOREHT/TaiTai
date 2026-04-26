const toneMap: Record<string, string> = {
  "En attente":
    "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-900/40 dark:bg-warning-900/10 dark:text-warning-300",
  Pret:
    "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900/40 dark:bg-brand-900/10 dark:text-brand-300",
  Livre:
    "border-success-200 bg-success-50 text-success-700 dark:border-success-900/40 dark:bg-success-900/10 dark:text-success-300",
  VIP: "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900/40 dark:bg-brand-900/10 dark:text-brand-300",
  "Top Client":
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/40 dark:bg-orange-900/10 dark:text-orange-300",
  Fidele:
    "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Critique:
    "border-error-200 bg-error-50 text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300",
  "A recommander":
    "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-900/40 dark:bg-warning-900/10 dark:text-warning-300",
  Stable:
    "border-success-200 bg-success-50 text-success-700 dark:border-success-900/40 dark:bg-success-900/10 dark:text-success-300",
  Service:
    "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900/40 dark:bg-brand-900/10 dark:text-brand-300",
  Livraison:
    "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-900/40 dark:bg-warning-900/10 dark:text-warning-300",
  Reservation:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/40 dark:bg-orange-900/10 dark:text-orange-300",
  Equipe:
    "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export function StatusPill({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneMap[value] ||
          "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
      )}
    >
      {value}
    </span>
  );
}
