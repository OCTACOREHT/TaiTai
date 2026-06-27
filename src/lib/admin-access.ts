import type { UserRole } from "@/types/cms";

export const cashierAllowedPaths = ["/commandes", "/validation-commandes", "/menu-admin", "/recherche-recu"];
export const fullAccessRoles: UserRole[] = ["super_admin", "admin"];

export function hasFullAdminAccess(role?: UserRole | string | null) {
  return role === "super_admin" || role === "admin";
}

export function canAccessAdminPath(pathname: string, role?: UserRole | string | null) {
  if (hasFullAdminAccess(role)) return true;
  if (role !== "caissier") return false;

  return cashierAllowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function getDefaultAdminPath(role?: UserRole | string | null) {
  return hasFullAdminAccess(role) ? "/dashboard" : "/commandes";
}
