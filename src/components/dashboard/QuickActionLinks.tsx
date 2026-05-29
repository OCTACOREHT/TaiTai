import {
  BoxCubeIcon,
  BoxIconLine,
  CalenderIcon,
  GridIcon,
  TableIcon,
  UserCircleIcon,
} from "@/icons";
import Link from "next/link";

const links = [
  {
    label: "Dashboard",
    description: "Apèsi ak endikatè.",
    href: "/dashboard",
    Icon: GridIcon,
  },
  {
    label: "Komand",
    description: "Swivi an dirèk pou tikè ak resi yo.",
    href: "/commandes",
    Icon: TableIcon,
  },
  {
    label: "Meni",
    description: "Plat, kategori ak disponibilite.",
    href: "/menu",
    Icon: BoxIconLine,
  },
  {
    label: "Stocks",
    description: "Founisè ak matyè premyè.",
    href: "/stocks",
    Icon: BoxCubeIcon,
  },
  {
    label: "Clients",
    description: "Fich kliyan ak badj VIP.",
    href: "/clients",
    Icon: UserCircleIcon,
  },
  {
    label: "Dates",
    description: "Ajanda restoran an ak randevou kle yo.",
    href: "/dates",
    Icon: CalenderIcon,
  },
];

export function QuickActionLinks() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {links.map(({ label, description, href, Icon }) => (
        <Link
          key={href}
          href={href}
          className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs transition hover:border-brand-200 hover:bg-brand-25 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-900/40 dark:hover:bg-brand-900/5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">{label}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-100 dark:bg-brand-900/10 dark:text-brand-300">
              <Icon className="size-5" />
            </div>
          </div>
          <div className="mt-4 inline-flex items-center text-sm font-medium text-brand-600 dark:text-brand-300">
            Louvri paj la
          </div>
        </Link>
      ))}
    </div>
  );
}
