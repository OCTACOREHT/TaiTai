"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { PencilIcon, TrashBinIcon, EyeIcon } from "@/icons";

interface ElitePlayer {
  id: string | number;
  number: string | number;
  first_name: string;
  last_name: string;
  position: string;
  weight: string;
  height: string;
  photo_url?: string;
  video_url?: string;
}

export default function EliteTable() {
  const router = useRouter();
  const [data, setData] = useState<ElitePlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const response = await fetch("/api/club/elite");
      if (!response.ok) throw new Error("Erreur");
      const json = await response.json();
      setData(json.data || []);
    } catch (err) {
      alert("Erreur de chargement");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Supprimer ce joueur Elite ?")) return;
    try {
      const response = await fetch(`/api/club/elite/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erreur DB");
      alert("Supprimé avec succès");
      fetchData();
    } catch (err) {
      alert("Erreur suppression");
    }
  };

  const filteredData = data.filter((m) =>
    (m.first_name + " " + m.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between p-4 border-b border-gray-100 dark:border-white/[0.05]">
        <input
          type="text"
          placeholder="Chercher un joueur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm max-w-sm w-full dark:bg-transparent dark:border-white/10 dark:text-white"
        />
        <Button onClick={() => router.push("/club/elite/nouveau")}>
          Ajouter Elite ({data.length}/10)
        </Button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">No</TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Joueur</TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Poste</TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Poids / Hauteur</TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredData.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-bold text-gray-800 dark:text-white/90">
                    {member.number}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        width={40}
                        height={40}
                        src={member.photo_url || "/images/user/user-01.jpg"}
                        alt="Photo"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 dark:text-white/90">
                        {member.first_name} {member.last_name}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{member.position}</TableCell>
                <TableCell>
                    <div className="text-sm">
                        <p>{member.weight} - {member.height}</p>
                    </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-3">
                    <button
                      className="text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Voir"
                      onClick={() => window.open(member.video_url || "/", "_blank")}
                    >
                      <EyeIcon />
                    </button>
                    <button
                      className="text-blue-500 transition hover:text-blue-600 dark:text-blue-400"
                      title="Modifier"
                      onClick={() => router.push(`/club/elite/modifier/${member.id}`)}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      className="text-red-500 transition hover:text-red-600"
                      title="Supprimer"
                      onClick={() => handleDelete(member.id)}
                    >
                      <TrashBinIcon />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
