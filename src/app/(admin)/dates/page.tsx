import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { DatesManagement } from "@/components/dashboard/DatesManagement";
import { scheduleEvents } from "@/lib/data";

export default function DatesPage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Dates" />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Agenda TaiTai</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Dates importantes du restaurant
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Planifiez les services, les livraisons, les reservations et les briefs d'equipe sur une page dediee.
        </p>
      </section>

      <DatesManagement initialEvents={scheduleEvents} />
    </div>
  );
}
