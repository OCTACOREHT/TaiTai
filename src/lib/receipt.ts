export type ReceiptLineItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  supplements?: Array<{ nom: string; prix: number }>;
};

export type ReceiptDocument = {
  orderNumber: string;
  createdAt: string | Date;
  dueAt?: string | Date;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerAddress?: string | null;
  serviceLabel?: string | null;
  items: ReceiptLineItem[];
  total: number;
};

export const RECEIPT_BRAND = {
  name: "TaïTaï",
  subtitle: "Bon gou kreyol ak servis rapid",
  addressLines: ["18 Rue des Saveurs", "Petion-Ville, Haiti"],
  phone: "+509 31 19 1999",
  email: "info@taïtaï.com",
};

const TIME_ZONE = "America/Port-au-Prince";

const moneyFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

export function normalizeReceiptText(value: string) {
  return String(value ?? "").replace(/[\u202f\u00a0]/g, " ");
}

export function formatReceiptMoney(value: number) {
  return normalizeReceiptText(`${moneyFormatter.format(Number(value) || 0)} HTG`);
}

export function formatReceiptDate(value: string | Date) {
  return normalizeReceiptText(dateFormatter.format(new Date(value)));
}

export function formatReceiptDateTime(value: string | Date) {
  return normalizeReceiptText(dateTimeFormatter.format(new Date(value)));
}

export function getReceiptSubtotal(items: ReceiptLineItem[]) {
  return items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

export function buildReceiptText(document: ReceiptDocument) {
  const issueDate = formatReceiptDate(document.createdAt);
  const dueDate = formatReceiptDate(document.dueAt ?? document.createdAt);
  const subtotal = getReceiptSubtotal(document.items);

  const lines = [
    `${RECEIPT_BRAND.name} - Fakti`,
    `Nimewo fakti: ${document.orderNumber}`,
    `Dat emisyon: ${issueDate}`,
    `Dat limit: ${dueDate}`,
    "",
    `Depi: ${RECEIPT_BRAND.name}`,
    ...RECEIPT_BRAND.addressLines,
    `Telefon: ${RECEIPT_BRAND.phone}`,
    `Imel: ${RECEIPT_BRAND.email}`,
    "",
    `Pou: ${document.customerName}`,
    document.customerPhone ? `Telefon kliyan: ${document.customerPhone}` : null,
    document.customerEmail ? `Imel kliyan: ${document.customerEmail}` : null,
    document.customerAddress ? `Adrès: ${document.customerAddress}` : null,
    document.serviceLabel ? `Sèvis: ${document.serviceLabel}` : null,
    "",
    "Atik:",
    ...document.items.map(
      (item) =>
        `- ${item.name} x${item.quantity} | ${formatReceiptMoney(item.unitPrice)} | ${formatReceiptMoney(item.amount)}`,
    ),
    "",
    `Som total: ${formatReceiptMoney(subtotal)}`,
    `Total: ${formatReceiptMoney(document.total)}`,
    `Montan pou peye: ${formatReceiptMoney(document.total)}`,
    "",
    `${RECEIPT_BRAND.subtitle}.`,
    `Mesi pou konfyans ou nan ${RECEIPT_BRAND.name}.`,
  ];

  return normalizeReceiptText(lines.filter(Boolean).join("\n"));
}
