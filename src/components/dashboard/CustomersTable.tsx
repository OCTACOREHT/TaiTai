import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerRecord, formatCurrency } from "@/lib/data";
import Image from "next/image";
import { StatusPill } from "./StatusPill";

export function CustomersTable({ customers }: { customers: CustomerRecord[] }) {
  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <Table>
        <TableHeader className="border-y border-gray-100 dark:border-gray-800">
          <TableRow>
            <TableCell
              isHeader
              className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Client
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Visites
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Depense totale
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Plat prefere
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Segment
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={customer.avatar || "/images/user/user-01.jpg"}
                    alt={customer.name}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white/90">{customer.name}</p>
                    <p className="text-theme-xs text-gray-500 dark:text-gray-400">{customer.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                {customer.visits}
                <p className="mt-1 text-theme-xs text-gray-400 dark:text-gray-500">
                  {customer.lastOrder}
                </p>
              </TableCell>
              <TableCell className="py-4 text-theme-sm font-medium text-gray-900 dark:text-white/90">
                {formatCurrency(customer.lifetimeSpend)}
              </TableCell>
              <TableCell className="py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                {customer.favoriteDish}
              </TableCell>
              <TableCell className="py-4">
                <StatusPill value={customer.segment} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
