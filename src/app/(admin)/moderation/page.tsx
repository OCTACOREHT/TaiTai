"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { supabase } from "@/lib/supabase-client";
import { CheckCircle2, XCircle, Loader2, MessageSquare, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { SuccessModal } from "@/components/ui/SuccessModal";

type Review = {
  id: string;
  nom: string;
  note: number;
  commentaire: string;
  active: boolean;
  created_at: string;
};

export default function ModerationPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string; details?: string }>({
    isOpen: false,
    title: "Erreur",
    message: "",
  });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; title: string; message: string; details?: string }>({
    isOpen: false,
    title: "Succès",
    message: "",
  });

  const loadReviews = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    let query = supabase
      .from("avis_clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter === "pending") {
      query = query.eq("active", false);
    } else if (filter === "approved") {
      query = query.eq("active", true);
    }

    const { data, error } = await query;

    if (error) {
      setErrorModal({
        isOpen: true,
        title: "Erreur de chargement",
        message: "Erreur lors du chargement des avis : " + error.message,
        details: "Veuillez rafraîchir la page.",
      });
    } else {
      setReviews(data || []);
    }

    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, [filter]);

  useAutoRefresh(() => loadReviews(false), { enabled: !updatingId });

  const updateReviewStatus = async (reviewId: string, active: boolean) => {
    setUpdatingId(reviewId);
    const { error } = await supabase
      .from("avis_clients")
      .update({ active })
      .eq("id", reviewId);

    setUpdatingId(null);

    if (error) {
      setErrorModal({
        isOpen: true,
        title: "Erreur de mise à jour",
        message: "Erreur lors de la mise à jour : " + error.message,
        details: "Veuillez réessayer.",
      });
    } else {
      await loadReviews(false);
      setSuccessModal({
        isOpen: true,
        title: "Avis modéré",
        message: active ? "L'avis a été approuvé et est maintenant visible." : "L'avis a été désapprouvé.",
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return;

    setUpdatingId(reviewId);
    const { error } = await supabase
      .from("avis_clients")
      .delete()
      .eq("id", reviewId);

    setUpdatingId(null);

    if (error) {
      setErrorModal({
        isOpen: true,
        title: "Erreur de suppression",
        message: "Erreur lors de la suppression : " + error.message,
        details: "Veuillez réessayer.",
      });
    } else {
      await loadReviews(false);
      setSuccessModal({
        isOpen: true,
        title: "Avis supprimé",
        message: "L'avis a été supprimé définitivement.",
      });
    }
  };

  const pendingCount = reviews.filter(r => !r.active).length;
  const approvedCount = reviews.filter(r => r.active).length;

  return (
    <div className="space-y-6">
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal((prev) => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
        details={successModal.details}
      />
      <PageBreadCrumb pageTitle="Modération des avis" />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Gestion des témoignages</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Modération des avis clients
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Validez ou rejetez les commentaires des clients avant qu'ils n'apparaissent sur le site.
        </p>
      </section>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">En attente</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">{pendingCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10">
              <MessageSquare size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approuvés</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white/90">{reviews.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
              <Star size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter("pending")}
          className={`px-6 py-3 text-sm font-bold transition-all ${
            filter === "pending"
              ? "border-b-2 border-brand-500 text-brand-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          En attente ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-6 py-3 text-sm font-bold transition-all ${
            filter === "approved"
              ? "border-b-2 border-brand-500 text-brand-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Approuvés ({approvedCount})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-6 py-3 text-sm font-bold transition-all ${
            filter === "all"
              ? "border-b-2 border-brand-500 text-brand-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Tous
        </button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white/90">
            Aucun avis à afficher
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {filter === "pending" && "Tous les avis ont été modérés."}
            {filter === "approved" && "Aucun avis approuvé pour le moment."}
            {filter === "all" && "Aucun avis soumis pour le moment."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`rounded-2xl border p-6 shadow-theme-xs transition-all ${
                review.active
                  ? "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10"
                  : "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-900/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-black text-white">
                      {review.nom.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white/90">{review.nom}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(review.created_at).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <Star
                        key={v}
                        className={`h-5 w-5 ${
                          v <= review.note ? "fill-[#F4A640] text-[#F4A640]" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                      {review.note}/5
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    &ldquo;{review.commentaire}&rdquo;
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {!review.active ? (
                    <button
                      onClick={() => updateReviewStatus(review.id, true)}
                      disabled={updatingId === review.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 size={16} />
                      Approuver
                    </button>
                  ) : (
                    <button
                      onClick={() => updateReviewStatus(review.id, false)}
                      disabled={updatingId === review.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <XCircle size={16} />
                      Désapprouver
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    disabled={updatingId === review.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
                  >
                    <XCircle size={16} />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}