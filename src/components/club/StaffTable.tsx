"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/tables/Pagination";
import Badge from "@/components/ui/badge/Badge";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { StaffMember } from "@/types/club";
import { formatClubDate } from "@/lib/club/metrics";

interface StaffTableProps {
  staff: StaffMember[];
  onEditStaff?: (member: StaffMember) => void;
  onDeleteStaff?: (member: StaffMember) => void;
}

const roleBadgeColor = (role: StaffMember["role"]) => {
  if (role === "Coach") {
    return "primary";
  }
  if (role === "Assistant") {
    return "warning";
  }
  if (role === "Medical") {
    return "info";
  }
  return "success";
};

export default function StaffTable({
  staff,
  onEditStaff,
  onDeleteStaff,
}: StaffTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredStaff = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return staff.filter((member) => {
      if (!query) {
        return true;
      }
      return (
        member.nom.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, staff]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pagedStaff = filteredStaff.slice(
    (currentPageSafe - 1) * pageSize,
    currentPageSafe * pageSize,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Staff
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filteredStaff.length} membre(s)
          </p>
        </div>
        <input
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="Rechercher un membre"
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 sm:max-w-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Nom
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Role
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Telephone
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Date de debut
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {pagedStaff.length === 0 ? (
              <TableRow>
                <td
                  colSpan={6}
                  className="py-6 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                >
                  Aucun membre trouve.
                </td>
              </TableRow>
            ) : (
              pagedStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="py-3 text-theme-sm text-gray-800 dark:text-white/90">
                    {member.nom}
                  </TableCell>
                  <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                    <Badge size="sm" color={roleBadgeColor(member.role)}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                    {member.telephone}
                  </TableCell>
                  <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                    {member.email}
                  </TableCell>
                  <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatClubDate(member.dateDebut)}
                  </TableCell>
                  <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center text-gray-500 transition hover:text-error-600 dark:text-gray-400 dark:hover:text-error-500"
                        onClick={() => onDeleteStaff?.(member)}
                        aria-label="Supprimer"
                        title="Supprimer"
                      >
                        <TrashBinIcon className="size-5" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => onEditStaff?.(member)}
                        aria-label="Modifier"
                        title="Modifier"
                      >
                        <PencilIcon className="size-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex justify-end">
          <Pagination
            currentPage={currentPageSafe}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : null}
    </div>
  );
}
