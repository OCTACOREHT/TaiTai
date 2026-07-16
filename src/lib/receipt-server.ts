import fs from "fs";
import path from "path";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";
import {
  buildReceiptText,
  formatReceiptDate,
  formatReceiptMoney,
  getReceiptSubtotal,
  normalizeReceiptText,
  RECEIPT_BRAND,
  type ReceiptDocument,
} from "./receipt";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 48;

const COLORS = {
  ink: rgb(0.06, 0.09, 0.16),
  muted: rgb(0.43, 0.47, 0.53),
  line: rgb(0.88, 0.89, 0.92),
  soft: rgb(0.95, 0.96, 0.97),
  accent: rgb(1, 0.56, 0),
  accentSoft: rgb(1, 0.95, 0.89),
};

function escapeHtml(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getReceiptLogoBytes() {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "logo", "tailogo.png");
    return fs.readFileSync(logoPath);
  } catch {
    return null;
  }
}

export function getReceiptLogoDataUri() {
  const logoBytes = getReceiptLogoBytes();
  if (!logoBytes) return "";
  return `data:image/png;base64,${logoBytes.toString("base64")}`;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const raw = String(text ?? "").trim();
  if (!raw) return [""];

  const words = raw.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      current = word;
      continue;
    }

    let chunk = "";
    for (const char of word) {
      const nextChunk = chunk + char;
      if (font.widthOfTextAtSize(nextChunk, size) <= maxWidth) {
        chunk = nextChunk;
      } else {
        if (chunk) lines.push(chunk);
        chunk = char;
      }
    }
    current = chunk;
  }

  if (current) lines.push(current);
  return lines.length ? lines : [raw];
}

function drawTextBlock({
  page,
  x,
  y,
  text,
  font,
  size,
  color,
  maxWidth,
  lineGap = 3,
}: {
  page: PDFPage;
  x: number;
  y: number;
  text: string;
  font: PDFFont;
  size: number;
  color: ReturnType<typeof rgb>;
  maxWidth: number;
  lineGap?: number;
}) {
  const lines = wrapText(text, font, size, maxWidth);
  const lineHeight = size + lineGap;

  lines.forEach((line, index) => {
    page.drawText(line, {
      x,
      y: y - index * lineHeight,
      size,
      font,
      color,
    });
  });

  return y - lines.length * lineHeight;
}

function drawLabeledValue({
  page,
  x,
  y,
  label,
  value,
  font,
  boldFont,
  maxWidth = 150,
}: {
  page: PDFPage;
  x: number;
  y: number;
  label: string;
  value: string;
  font: PDFFont;
  boldFont: PDFFont;
  maxWidth?: number;
}) {
  page.drawText(label, {
    x,
    y,
    size: 8,
    font: boldFont,
    color: COLORS.muted,
  });

  return drawTextBlock({
    page,
    x,
    y: y - 14,
    text: value,
    font,
    size: 12,
    color: COLORS.ink,
    maxWidth,
    lineGap: 3,
  });
}

function drawPartyBlock({
  page,
  x,
  y,
  title,
  lines,
  font,
  boldFont,
}: {
  page: PDFPage;
  x: number;
  y: number;
  title: string;
  lines: string[];
  font: PDFFont;
  boldFont: PDFFont;
}) {
  page.drawText(title, {
    x,
    y,
    size: 10,
    font: boldFont,
    color: COLORS.accent,
  });

  let cursorY = y - 16;
  lines.forEach((line, index) => {
    cursorY = drawTextBlock({
      page,
      x,
      y: cursorY,
      text: line,
      font: index === 0 ? boldFont : font,
      size: index === 0 ? 13 : 10,
      color: index === 0 ? COLORS.ink : COLORS.muted,
      maxWidth: 230,
      lineGap: 3,
    }) - 2;
  });

  return cursorY;
}

function drawTopBar({
  page,
  boldFont,
  regularFont,
  logoImage,
  document,
}: {
  page: PDFPage;
  boldFont: PDFFont;
  regularFont: PDFFont;
  logoImage: PDFImage | null;
  document: ReceiptDocument;
}) {
  page.drawText("Fakti", {
    x: MARGIN,
    y: PAGE_HEIGHT - MARGIN - 4,
    size: 28,
    font: boldFont,
    color: COLORS.ink,
  });

  page.drawText("Resi TaïTaï", {
    x: MARGIN,
    y: PAGE_HEIGHT - MARGIN - 28,
    size: 10,
    font: regularFont,
    color: COLORS.muted,
  });

  page.drawText(`Nimewo fakti ${document.orderNumber}`, {
    x: MARGIN,
    y: PAGE_HEIGHT - MARGIN - 46,
    size: 10,
    font: boldFont,
    color: COLORS.muted,
  });

  if (logoImage) {
    page.drawImage(logoImage, {
      x: PAGE_WIDTH - MARGIN - 112,
      y: PAGE_HEIGHT - MARGIN - 28,
      width: 112,
      height: 32,
    });
  } else {
    page.drawText(RECEIPT_BRAND.name, {
      x: PAGE_WIDTH - MARGIN - 120,
      y: PAGE_HEIGHT - MARGIN - 4,
      size: 24,
      font: boldFont,
      color: COLORS.ink,
    });
  }

  page.drawLine({
    start: { x: MARGIN, y: PAGE_HEIGHT - MARGIN - 58 },
    end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - MARGIN - 58 },
    thickness: 1,
    color: COLORS.line,
  });
}

function drawSummaryBox({
  page,
  x,
  y,
  width,
  subtotal,
  total,
  deliveryFee,
  boldFont,
  regularFont,
}: {
  page: PDFPage;
  x: number;
  y: number;
  width: number;
  subtotal: string;
  total: string;
  deliveryFee: string | null;
  boldFont: PDFFont;
  regularFont: PDFFont;
}) {
  const boxHeight = deliveryFee ? 112 : 92;

  page.drawRectangle({
    x,
    y: y - boxHeight,
    width,
    height: boxHeight,
    color: rgb(1, 1, 1),
    borderColor: COLORS.line,
    borderWidth: 1,
  });

  page.drawText("Som total", {
    x: x + 16,
    y: y - 24,
    size: 11,
    font: regularFont,
    color: COLORS.muted,
  });
  page.drawText(subtotal, {
    x: x + width - 16 - boldFont.widthOfTextAtSize(subtotal, 11),
    y: y - 24,
    size: 11,
    font: boldFont,
    color: COLORS.ink,
  });

  let currentY = y - 45;

  if (deliveryFee) {
    page.drawText("Frais de livraison", {
      x: x + 16,
      y: currentY,
      size: 11,
      font: regularFont,
      color: COLORS.accent,
    });
    page.drawText(deliveryFee, {
      x: x + width - 16 - boldFont.widthOfTextAtSize(deliveryFee, 11),
      y: currentY,
      size: 11,
      font: boldFont,
      color: COLORS.accent,
    });
    currentY -= 21;
  }

  page.drawText("Total", {
    x: x + 16,
    y: currentY,
    size: 11,
    font: regularFont,
    color: COLORS.muted,
  });
  page.drawText(total, {
    x: x + width - 16 - boldFont.widthOfTextAtSize(total, 11),
    y: currentY,
    size: 11,
    font: boldFont,
    color: COLORS.ink,
  });

  let lineY = currentY - 9;

  page.drawLine({
    start: { x: x + 16, y: lineY },
    end: { x: x + width - 16, y: lineY },
    thickness: 1,
    color: COLORS.line,
  });

  page.drawText("Montan final", {
    x: x + 16,
    y: lineY - 20,
    size: 12,
    font: boldFont,
    color: COLORS.ink,
  });
  page.drawText(total, {
    x: x + width - 16 - boldFont.widthOfTextAtSize(total, 12),
    y: lineY - 20,
    size: 12,
    font: boldFont,
    color: COLORS.ink,
  });


}

export function buildReceiptEmailHtml({
  document,
  logoDataUri,
}: {
  document: ReceiptDocument;
  logoDataUri: string;
}) {
  const issueDate = formatReceiptDate(document.createdAt);
  const subtotalNum = getReceiptSubtotal(document.items);
  const subtotal = getReceiptSubtotal(document.items);
  const total = formatReceiptMoney(document.total);
  const deliveryFee = document.total > subtotalNum ? formatReceiptMoney(document.total - subtotalNum) : null;

  const restaurantLines = [
    RECEIPT_BRAND.name,
    ...RECEIPT_BRAND.addressLines,
    `Telefon: ${RECEIPT_BRAND.phone}`,
    `Imel: ${RECEIPT_BRAND.email}`,
  ]
    .map((line) => `<div style="margin-top:3px;">${escapeHtml(line)}</div>`)
    .join("");

  const customerLines = [
    document.customerName,
    document.customerPhone ? document.customerPhone : "",
    document.customerEmail ? document.customerEmail : "",
    document.customerAddress ? document.customerAddress : "",
    document.serviceLabel ? document.serviceLabel : "",
  ]
    .filter(Boolean)
    .map((line) => `<div style="margin-top:3px;">${escapeHtml(line)}</div>`)
    .join("");

  const itemRows = document.items
    .map(
      (item) => {
        const supplementsHtml = item.supplements && item.supplements.length > 0
          ? `<div style="font-size:11px;color:#667085;margin-top:4px;padding-left:8px;border-left:2px solid #F4A640;">
              ${item.supplements.map(sup => {
                const priceText = sup.prix === 0 ? 'Gratuit' : `+${formatReceiptMoney(sup.prix)}`;
                return `<div>• ${escapeHtml(sup.nom)} <span style="color:#F4A640;font-weight:600;">${priceText}</span></div>`;
              }).join('')}
            </div>`
          : '';
        
        return `
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid #EAECF0;">
              <div style="font-size:14px;font-weight:700;color:#101828;">${escapeHtml(item.name)}</div>
              <div style="font-size:12px;color:#667085;margin-top:4px;">${item.quantity} x ${escapeHtml(
                formatReceiptMoney(item.unitPrice),
              )}</div>
              ${supplementsHtml}
            </td>
            <td style="padding:14px 0;border-bottom:1px solid #EAECF0;text-align:right;font-size:14px;font-weight:700;color:#101828;white-space:nowrap;">
              ${escapeHtml(formatReceiptMoney(item.amount))}
            </td>
          </tr>
        `;
      },
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ht">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fakti ${escapeHtml(document.orderNumber)} | ${escapeHtml(RECEIPT_BRAND.name)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;color:#101828;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;background:#ffffff;border:1px solid #EAECF0;border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 8px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:top;">
                    <div style="font-size:30px;line-height:1;font-weight:900;letter-spacing:-0.04em;color:#101828;">Fakti</div>
                    <div style="margin-top:6px;font-size:12px;font-weight:700;color:#667085;">Resi TaïTaï</div>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    ${
                      logoDataUri
                        ? `<img src="${logoDataUri}" alt="TaïTaï" style="height:44px;width:auto;display:block;" />`
                        : `<div style="font-size:24px;font-weight:900;color:#101828;">TaïTaï</div>`
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 20px 32px;">
              <div style="border-top:1px solid #EAECF0;padding-top:18px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-bottom:8px;font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#98A2B3;">Nimewo fakti</td>
                    <td style="padding-bottom:8px;font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#98A2B3;">Dat emisyon</td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;font-weight:800;color:#101828;">${escapeHtml(document.orderNumber)}</td>
                    <td style="font-size:14px;font-weight:800;color:#101828;">${escapeHtml(issueDate)}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 8px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" valign="top" style="padding-right:12px;">
                    <div style="font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#98A2B3;margin-bottom:10px;">Depi</div>
                    ${restaurantLines}
                  </td>
                  <td width="50%" valign="top" style="padding-left:12px;">
                    <div style="font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#98A2B3;margin-bottom:10px;">Pou</div>
                    ${customerLines}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 4px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:top;">
                    <div style="font-size:11px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#98A2B3;">Montan pou peye</div>
                    <div style="margin-top:8px;font-size:30px;line-height:1.05;font-weight:900;color:#101828;">${escapeHtml(total)}</div>
                    <div style="margin-top:10px;font-size:13px;color:#667085;line-height:1.6;">${escapeHtml(
                      RECEIPT_BRAND.subtitle,
                    )}</div>
                  </td>
                  <td align="right" style="width:260px;vertical-align:top;">
                    <div style="display:inline-block;min-width:240px;border:1px solid #EAECF0;border-radius:16px;padding:14px 16px;text-align:left;">
                      <div style="font-size:12px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#667085;">Rezime</div>
                      <div style="margin-top:12px;display:flex;justify-content:space-between;gap:16px;font-size:14px;color:#101828;">
                        <span>Som total</span>
                        <span style="font-weight:800;">${escapeHtml(formatReceiptMoney(subtotal))}</span>
                      </div>
                      ${deliveryFee ? `
                      <div style="margin-top:8px;display:flex;justify-content:space-between;gap:16px;font-size:14px;color:#FF9000;">
                        <span>Frais de livraison</span>
                        <span style="font-weight:800;">${escapeHtml(deliveryFee)}</span>
                      </div>
                      ` : ''}
                      <div style="margin-top:8px;display:flex;justify-content:space-between;gap:16px;font-size:14px;color:#101828;">
                        <span>Total</span>
                        <span style="font-weight:800;">${escapeHtml(total)}</span>
                      </div>
                      <div style="margin-top:10px;padding-top:10px;border-top:1px solid #EAECF0;display:flex;justify-content:space-between;gap:16px;font-size:15px;font-weight:900;color:#101828;">
                        <span>Montan final</span>
                        <span>${escapeHtml(total)}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 0 32px;">
              <div style="border:1px solid #EAECF0;border-radius:18px;overflow:hidden;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <thead>
                    <tr style="background:#F9FAFB;border-bottom:1px solid #EAECF0;">
                      <th align="left" style="padding:14px 16px;font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#667085;">Deskripsyon</th>
                      <th align="center" style="padding:14px 16px;font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#667085;">Kantite</th>
                      <th align="right" style="padding:14px 16px;font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#667085;">Pri inite</th>
                      <th align="right" style="padding:14px 16px;font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#667085;">Montan</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemRows}
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 34px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#98A2B3;margin-bottom:8px;">Nòt</div>
                    <div style="font-size:14px;line-height:1.75;color:#667085;">
                      Voici votre reçu. Mesi anpil pou konfyans ou nan TaïTaï. Si ou bezwen asistans, kontakte nou dirèkteman.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function buildReceiptPdfBytes(document: ReceiptDocument) {
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const logoBytes = getReceiptLogoBytes();
  const logoImage = logoBytes ? await pdfDoc.embedPng(logoBytes) : null;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const originalDrawText = page.drawText.bind(page);
  (page as typeof page & { drawText: typeof page.drawText }).drawText = ((text: string, options: Parameters<typeof page.drawText>[1]) =>
    originalDrawText(normalizeReceiptText(text), options)) as typeof page.drawText;

  drawTopBar({ page, boldFont, regularFont, logoImage, document });

  let cursorY = PAGE_HEIGHT - MARGIN - 98;

  drawLabeledValue({
    page,
    x: MARGIN,
    y: cursorY,
    label: "Nimewo fakti",
    value: document.orderNumber,
    font: regularFont,
    boldFont,
  });
  cursorY = drawLabeledValue({
    page,
    x: MARGIN + 180,
    y: cursorY,
    label: "Dat emisyon",
    value: formatReceiptDate(document.createdAt),
    font: regularFont,
    boldFont,
  });

  page.drawLine({
    start: { x: MARGIN, y: cursorY - 10 },
    end: { x: PAGE_WIDTH - MARGIN, y: cursorY - 10 },
    thickness: 1,
    color: COLORS.line,
  });

  const leftBlockLines = [
    RECEIPT_BRAND.name,
    ...RECEIPT_BRAND.addressLines,
    `Telefon: ${RECEIPT_BRAND.phone}`,
    `Imel: ${RECEIPT_BRAND.email}`,
  ];

  const rightBlockLines = [
    document.customerName,
    document.customerPhone ?? "",
    document.customerEmail ?? "",
    document.serviceLabel ?? "",
  ].filter(Boolean) as string[];

  const blockTop = cursorY - 32;
  drawPartyBlock({
    page,
    x: MARGIN,
    y: blockTop,
    title: "Depi",
    lines: leftBlockLines,
    font: regularFont,
    boldFont,
  });

  drawPartyBlock({
    page,
    x: PAGE_WIDTH / 2 + 8,
    y: blockTop,
    title: "Pou",
    lines: rightBlockLines,
    font: regularFont,
    boldFont,
  });

  const subtotal = getReceiptSubtotal(document.items);
  const totalText = formatReceiptMoney(document.total);

  const amountY = 470;
  page.drawText("Montan pou peye", {
    x: MARGIN,
    y: amountY,
    size: 10,
    font: boldFont,
    color: COLORS.muted,
  });
  page.drawText(totalText, {
    x: MARGIN,
    y: amountY - 26,
    size: 24,
    font: boldFont,
    color: COLORS.ink,
  });
  page.drawText("Resi sa a pare pou enprime oswa sove kom PDF.", {
    x: MARGIN,
    y: amountY - 46,
    size: 10,
    font: regularFont,
    color: COLORS.muted,
  });

  drawTextBlock({
    page,
    x: PAGE_WIDTH - 220,
    y: amountY - 2,
    text: `Fakti sa a konfime komann ${document.orderNumber}.`,
    font: regularFont,
    size: 10,
    color: COLORS.muted,
    maxWidth: 180,
    lineGap: 4,
  });

  const tableTop = 390;
  page.drawText("Deskripsyon", {
    x: MARGIN,
    y: tableTop,
    size: 10,
    font: boldFont,
    color: COLORS.muted,
  });
  page.drawText("Kantite", {
    x: PAGE_WIDTH - MARGIN - 192,
    y: tableTop,
    size: 10,
    font: boldFont,
    color: COLORS.muted,
  });
  page.drawText("Pri inite", {
    x: PAGE_WIDTH - MARGIN - 120,
    y: tableTop,
    size: 10,
    font: boldFont,
    color: COLORS.muted,
  });
  page.drawText("Montan", {
    x: PAGE_WIDTH - MARGIN - 40,
    y: tableTop,
    size: 10,
    font: boldFont,
    color: COLORS.muted,
  });

  page.drawLine({
    start: { x: MARGIN, y: tableTop - 8 },
    end: { x: PAGE_WIDTH - MARGIN, y: tableTop - 8 },
    thickness: 1,
    color: COLORS.line,
  });

  let rowY = tableTop - 30;
  document.items.forEach((item) => {
    const nameLines = wrapText(item.name, boldFont, 11, 250);
    const hasSupplements = item.supplements && item.supplements.length > 0;
    const baseRowHeight = Math.max(28, nameLines.length * 13 + 8);
    const supplementsHeight = hasSupplements ? item.supplements.length * 12 + 4 : 0;
    const rowHeight = baseRowHeight + supplementsHeight;

    page.drawText(nameLines[0], {
      x: MARGIN,
      y: rowY,
      size: 11,
      font: boldFont,
      color: COLORS.ink,
    });

    if (nameLines.length > 1) {
      page.drawText(nameLines.slice(1).join(" "), {
        x: MARGIN,
        y: rowY - 12,
        size: 9,
        font: regularFont,
        color: COLORS.muted,
      });
    }

    page.drawText(String(item.quantity), {
      x: PAGE_WIDTH - MARGIN - 184,
      y: rowY,
      size: 11,
      font: regularFont,
      color: COLORS.ink,
    });

    page.drawText(formatReceiptMoney(item.unitPrice), {
      x: PAGE_WIDTH - MARGIN - 112,
      y: rowY,
      size: 11,
      font: regularFont,
      color: COLORS.ink,
    });

    page.drawText(formatReceiptMoney(item.amount), {
      x: PAGE_WIDTH - MARGIN - 34,
      y: rowY,
      size: 11,
      font: boldFont,
      color: COLORS.ink,
    });

    if (hasSupplements && item.supplements) {
      let supY = rowY - 14;
      item.supplements.forEach((sup) => {
        const priceText = sup.prix === 0 ? 'Gratuit' : `+${formatReceiptMoney(sup.prix)}`;
        page.drawText(`• ${sup.nom} ${priceText}`, {
          x: MARGIN + 8,
          y: supY,
          size: 9,
          font: regularFont,
          color: COLORS.accent,
        });
        supY -= 11;
      });
    }

    page.drawLine({
      start: { x: MARGIN, y: rowY - 10 },
      end: { x: PAGE_WIDTH - MARGIN, y: rowY - 10 },
      thickness: 0.5,
      color: COLORS.soft,
    });

    rowY -= rowHeight;
  });

  const summaryWidth = 260;
  const summaryX = PAGE_WIDTH - MARGIN - summaryWidth;
  const summaryY = Math.max(rowY - 18, 132);

  const subtotalNum = getReceiptSubtotal(document.items);
  const deliveryFee = document.total > subtotalNum ? formatReceiptMoney(document.total - subtotalNum) : null;

  drawSummaryBox({
    page,
    x: summaryX,
    y: summaryY,
    width: summaryWidth,
    subtotal: formatReceiptMoney(subtotal),
    total: totalText,
    deliveryFee,
    boldFont,
    regularFont,
  });

  page.drawText(RECEIPT_BRAND.subtitle, {
    x: MARGIN,
    y: 92,
    size: 9,
    font: regularFont,
    color: COLORS.muted,
  });
  page.drawText("Mesi pou konfyans ou nan TaïTaï.", {
    x: MARGIN,
    y: 78,
    size: 9,
    font: regularFont,
    color: COLORS.muted,
  });

  return pdfDoc.save();
}

export { buildReceiptText };
