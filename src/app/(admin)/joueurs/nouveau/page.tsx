"use client";

import { CmsArticleForm } from "@/components/common/CmsForms";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import { useRouter } from "next/navigation";

export default function NewArticlePage() {
  const { users, currentUser, saveArticle } = useCms();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nouvel Article" />
      <CmsArticleForm
        authors={users}
        submitLabel="Creer l'article"
        initialValue={
          currentUser
            ? {
                id: "",
                slug: "",
                title: "",
                excerpt: "",
                body: "",
                coverImage: "",
                category: "Actualites",
                tags: [],
                authorId: currentUser.id,
                featured: false,
                status: "draft",
                seoTitle: "",
                seoDescription: "",
                createdAt: "",
                updatedAt: "",
                publishedAt: null,
                metrics: { views: 0, linkClicks: 0, shares: 0, leads: 0 },
              }
            : undefined
        }
        onSubmit={(value) => {
          saveArticle(value);
          router.push("/joueurs");
        }}
      />
    </div>
  );
}
