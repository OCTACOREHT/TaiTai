"use client";

import PublicCmsHome from "@/components/common/PublicCmsHome";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";

export default function SitePreviewPage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Apercu Site" />

      <div className="flex justify-end">
        <Link
          href="/"
          target="_blank"
          className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          Ouvrir le site public
        </Link>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-gray-950 shadow-theme-xs dark:border-gray-800">
        <PublicCmsHome embedded />
      </div>
    </div>
  );
}
