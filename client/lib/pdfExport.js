/**
 * Lightweight, zero-dependency client-side PDF 1.4 generator for Nex World Travel
 * Member Summary Documents.
 *
 * - Runs 100% in the browser (zero Railway server RAM overhead).
 * - Embeds company logo (/images/logo.png) via offscreen Canvas -> JPEG DCTDecode XObject.
 * - Supports automatic text wrapping, long member names, multi-page overflow, and AED currency.
 * - Never includes passwords, password hashes, tokens, or private security fields.
 */

import { formatAED } from './currency.js';

function sanitizePdfText(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[^\x20-\x7E]/g, (ch) => {
      if (ch === '\u2014' || ch === '\u2013') return '-';
      if (ch === '\u2018' || ch === '\u2019') return "'";
      if (ch === '\u201C' || ch === '\u201D') return '"';
      if (ch === '\u2022') return '*';
      return ' ';
    })
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(text, maxChars) {
  const raw = String(text || '').replace(/\r\n/g, '\n');
  const paragraphs = raw.split('\n');
  const lines = [];
  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    let current = words[0];
    for (let i = 1; i < words.length; i++) {
      if (current.length + 1 + words[i].length <= maxChars) {
        current += ' ' + words[i];
      } else {
        lines.push(current);
        current = words[i];
      }
    }
    if (current) lines.push(current);
  }
  return lines.length > 0 ? lines : ['N/A'];
}

function formatUAEDateTime(dateVal) {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'N/A';
  try {
    return (
      d.toLocaleString('en-GB', {
        timeZone: 'Asia/Dubai',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' (UAE)'
    );
  } catch {
    return d.toISOString().split('T')[0];
  }
}

function formatUAEDate(dateVal) {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'N/A';
  try {
    return d.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Dubai',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return d.toISOString().split('T')[0];
  }
}

function hasValidEmiFacility(member) {
  if (!member) return false;
  const hasFlag = Boolean(member.hasEMI || member.hasEmi || member.emiDetails?.hasEmi);
  const amount = Number(member.emiAmount || member.emiDetails?.emiAmount || 0);
  const tenure = Number(member.emiTenureMonths || member.emiDetails?.totalMonths || 0);
  const balance = Number(member.outstandingBalance || 0);
  return hasFlag && amount > 0 && tenure > 0 && balance > 0;
}

async function loadLogoAsJpegBytes(logoPath = '/images/logo.png') {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Logo load failed'));
      el.src = logoPath;
    });
    const canvas = document.createElement('canvas');
    const targetW = 360;
    const scale = targetW / (img.naturalWidth || targetW);
    const targetH = Math.max(40, Math.round((img.naturalHeight || 100) * scale));
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { bytes, width: targetW, height: targetH };
  } catch {
    return null;
  }
}

/**
 * Build raw PDF binary bytes (Uint8Array) for a given member record.
 * Exported separately so it can also be unit-tested in Node.js.
 */
export function buildMemberPdfBytes(member, logoData = null) {
  const PAGE_W = 595.28; // A4 width in pt
  const PAGE_H = 841.89; // A4 height in pt
  const MARGIN_X = 42;
  const CONTENT_W = PAGE_W - MARGIN_X * 2;
  const BOTTOM_LIMIT = 76;

  const pages = [];
  let cmds = [];
  let cursorY = PAGE_H - 42;

  const startNewPage = () => {
    if (cmds.length > 0) pages.push(cmds.join('\n'));
    cmds = [];
    cursorY = PAGE_H - 48;
  };

  const ensureSpace = (neededPt) => {
    if (cursorY - neededPt < BOTTOM_LIMIT) {
      startNewPage();
    }
  };

  const drawRect = (x, yBottom, w, h, fillRgb, strokeRgb = null) => {
    let op = '';
    if (fillRgb) op += `${fillRgb[0]} ${fillRgb[1]} ${fillRgb[2]} rg `;
    if (strokeRgb) op += `${strokeRgb[0]} ${strokeRgb[1]} ${strokeRgb[2]} RG 0.7 w `;
    op += `${x.toFixed(2)} ${yBottom.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re `;
    op += fillRgb && strokeRgb ? 'B' : fillRgb ? 'f' : 'S';
    cmds.push(op);
  };

  const drawLine = (x1, y1, x2, y2, rgb = [0.88, 0.9, 0.94], width = 0.7) => {
    cmds.push(
      `${rgb[0]} ${rgb[1]} ${rgb[2]} RG ${width} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`
    );
  };

  const drawText = (text, x, y, size = 10, bold = false, rgb = [0.09, 0.13, 0.2]) => {
    const font = bold ? '/F2' : '/F1';
    cmds.push(
      `BT ${font} ${size} Tf ${rgb[0]} ${rgb[1]} ${rgb[2]} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${sanitizePdfText(text)}) Tj ET`
    );
  };

  // ==================== HEADER BANNER ====================
  // Top accent strip
  drawRect(0, PAGE_H - 8, PAGE_W, 8, [0.19, 0.37, 0.98]);

  const headerTop = PAGE_H - 22;
  if (logoData) {
    const drawW = 128;
    const drawH = (logoData.height / logoData.width) * drawW;
    const imgY = headerTop - drawH;
    cmds.push(`q ${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${MARGIN_X.toFixed(2)} ${imgY.toFixed(2)} cm /Im1 Do Q`);
    drawText('NEX WORLD TRAVEL & TOURISM LLC-SPC', MARGIN_X + drawW + 14, headerTop - 14, 12, true, [0.09, 0.13, 0.2]);
    drawText('OFFICIAL MEMBERSHIP SUMMARY STATEMENT', MARGIN_X + drawW + 14, headerTop - 28, 9, true, [0.19, 0.37, 0.98]);
    drawText('Abu Dhabi, U.A.E.  |  Tel: +971-263-959-08  |  nexworldtravel.com', MARGIN_X + drawW + 14, headerTop - 41, 8, false, [0.4, 0.44, 0.52]);
    cursorY = Math.min(imgY, headerTop - 50) - 12;
  } else {
    drawText('NEX WORLD TRAVEL & TOURISM LLC-SPC', MARGIN_X, headerTop - 16, 15, true, [0.09, 0.13, 0.2]);
    drawText('OFFICIAL MEMBERSHIP SUMMARY STATEMENT', MARGIN_X, headerTop - 32, 10, true, [0.19, 0.37, 0.98]);
    drawText('Abu Dhabi, U.A.E.  |  Tel: +971-263-959-08  |  nexworldtravel.com', MARGIN_X, headerTop - 46, 8.5, false, [0.4, 0.44, 0.52]);
    cursorY = headerTop - 60;
  }

  drawLine(MARGIN_X, cursorY, PAGE_W - MARGIN_X, cursorY, [0.85, 0.88, 0.93], 1.0);
  cursorY -= 20;

  // ==================== MEMBER IDENTITY CARD ====================
  const memberName = member.registeredName || member.name || member.userId?.name || 'Valued Member';
  const memberId = member.memberId || 'N/A';
  const email = member.email || member.userId?.email || 'N/A';
  const phone = member.phone || 'N/A';
  const tier = member.packageType || 'Standard';
  const status = member.membershipStatus || member.status || 'Active';
  const regDate = formatUAEDateTime(member.registrationDate || member.purchaseDate || member.createdAt);

  const nameLines = wrapText(memberName, 44);
  const idCardH = 54 + (nameLines.length - 1) * 16;
  ensureSpace(idCardH + 14);
  drawRect(MARGIN_X, cursorY - idCardH, CONTENT_W, idCardH, [0.97, 0.98, 0.99], [0.88, 0.9, 0.94]);

  let cardY = cursorY - 18;
  drawText('REGISTERED MEMBER', MARGIN_X + 14, cardY, 7.5, true, [0.4, 0.44, 0.52]);
  drawText(`MEMBERSHIP ID: ${memberId}`, PAGE_W - MARGIN_X - 180, cardY, 8.5, true, [0.19, 0.37, 0.98]);
  cardY -= 16;

  for (const line of nameLines) {
    drawText(line, MARGIN_X + 14, cardY, 13, true, [0.09, 0.13, 0.2]);
    cardY -= 16;
  }

  const contactText = `Email: ${email}   |   Phone: ${phone}`;
  drawText(contactText.slice(0, 88), MARGIN_X + 14, cardY + 2, 8.5, false, [0.35, 0.4, 0.48]);

  cursorY = cursorY - idCardH - 18;

  // Helper to render section title + 2-column key/value grid
  const renderSection = (title, rows) => {
    const colW = (CONTENT_W - 14) / 2;
    const rowCount = Math.ceil(rows.length / 2);
    const blockH = 26 + rowCount * 36;
    ensureSpace(blockH + 16);

    drawText(title, MARGIN_X, cursorY, 10, true, [0.19, 0.37, 0.98]);
    cursorY -= 6;
    drawLine(MARGIN_X, cursorY, PAGE_W - MARGIN_X, cursorY, [0.9, 0.92, 0.95], 0.8);
    cursorY -= 14;

    for (let i = 0; i < rows.length; i += 2) {
      ensureSpace(40);
      const left = rows[i];
      const right = rows[i + 1];

      // Left cell
      drawRect(MARGIN_X, cursorY - 26, colW, 32, [0.99, 0.99, 1.0], [0.92, 0.93, 0.96]);
      drawText(left.label.toUpperCase(), MARGIN_X + 10, cursorY - 6, 7, true, [0.45, 0.5, 0.58]);
      drawText(
        String(left.value || 'N/A').slice(0, 42),
        MARGIN_X + 10,
        cursorY - 19,
        9.5,
        true,
        left.color || [0.09, 0.13, 0.2]
      );

      if (right) {
        const rx = MARGIN_X + colW + 14;
        drawRect(rx, cursorY - 26, colW, 32, [0.99, 0.99, 1.0], [0.92, 0.93, 0.96]);
        drawText(right.label.toUpperCase(), rx + 10, cursorY - 6, 7, true, [0.45, 0.5, 0.58]);
        drawText(
          String(right.value || 'N/A').slice(0, 42),
          rx + 10,
          cursorY - 19,
          9.5,
          true,
          right.color || [0.09, 0.13, 0.2]
        );
      }
      cursorY -= 38;
    }
    cursorY -= 8;
  };

  // ==================== MEMBERSHIP DETAILS ====================
  const allottedNights =
    member.allottedNights !== undefined && member.allottedNights !== null
      ? Number(member.allottedNights)
      : Number(member.availableNights ?? member.nightsAvailable ?? 0) + Number(member.usedNights || 0);
  const usedNights = Number(member.usedNights || 0);
  const availableNights = Number(member.availableNights ?? member.nightsAvailable ?? 0);

  renderSection('MEMBERSHIP ENTITLEMENT & STATUS', [
    { label: 'Membership Tier', value: tier },
    {
      label: 'Membership Status',
      value: status,
      color: status === 'Active' ? [0.02, 0.55, 0.35] : [0.75, 0.15, 0.15],
    },
    { label: 'Registration Date (UAE)', value: regDate },
    { label: 'Membership Tenure', value: member.tenurePeriod || 'N/A' },
    { label: 'Total Allotted Nights', value: `${allottedNights} Nights` },
    { label: 'Used Nights', value: `${usedNights} Nights` },
    { label: 'Available Nights', value: `${availableNights} Nights`, color: [0.19, 0.37, 0.98] },
    {
      label: 'Travel Card Benefit',
      value: member.travelCardBenefit ? 'Included' : 'Not Included',
      color: member.travelCardBenefit ? [0.02, 0.55, 0.35] : [0.45, 0.5, 0.58],
    },
  ]);

  // ==================== FINANCIAL OVERVIEW ====================
  const productPrice = Number(member.productPrice || 0);
  const totalPaid = Number(member.totalAmountPaid || 0);
  const outstandingBalance = Number(member.outstandingBalance || 0);

  renderSection('FINANCIAL SUMMARY (AED)', [
    { label: 'Total Product Cost', value: formatAED(productPrice) },
    { label: 'Total Paid Amount', value: formatAED(totalPaid), color: [0.02, 0.55, 0.35] },
    {
      label: 'Outstanding Balance',
      value: formatAED(outstandingBalance),
      color: outstandingBalance > 0 ? [0.8, 0.15, 0.15] : [0.02, 0.55, 0.35],
    },
    { label: 'Payment Standing', value: member.paymentStatus || (outstandingBalance === 0 ? 'Fully Paid' : 'Up to Date') },
  ]);

  // ==================== STRUCTURED EMI (ONLY IF ELIGIBLE) ====================
  if (hasValidEmiFacility(member)) {
    const emiAmt = Number(member.emiAmount || member.emiDetails?.emiAmount || 0);
    const emiTenure = Number(member.emiTenureMonths || member.emiDetails?.totalMonths || 0);
    const emiPaid = Number(member.emiPaidMonths || 0);
    const nextDue = formatUAEDate(member.nextEMIDueDate || member.emiDetails?.nextDueDate);

    renderSection('STRUCTURED EMI FACILITY DETAILS', [
      { label: 'Monthly Installment', value: `${formatAED(emiAmt)} / month` },
      { label: 'Installment Progress', value: `${emiPaid} of ${emiTenure} installments completed` },
      { label: 'Next Installment Due Date', value: nextDue },
      { label: 'Current Due Amount', value: formatAED(member.dueAmount || 0) },
    ]);
  }

  // ==================== CONTRACT PERKS & NOTES ====================
  const perksLines = wrapText(member.extraOffers || 'Standard membership benefits and contract terms apply.', 86);
  const perksBoxH = 26 + perksLines.length * 14;
  ensureSpace(perksBoxH + 24);

  drawText('CONTRACT PERKS & INCLUDED PRIVILEGES', MARGIN_X, cursorY, 10, true, [0.19, 0.37, 0.98]);
  cursorY -= 6;
  drawLine(MARGIN_X, cursorY, PAGE_W - MARGIN_X, cursorY, [0.9, 0.92, 0.95], 0.8);
  cursorY -= 12;

  drawRect(MARGIN_X, cursorY - perksBoxH, CONTENT_W, perksBoxH, [0.97, 0.98, 0.99], [0.88, 0.9, 0.94]);
  let perkY = cursorY - 16;
  for (const line of perksLines) {
    drawText(line, MARGIN_X + 12, perkY, 9, false, [0.15, 0.2, 0.28]);
    perkY -= 14;
  }
  cursorY -= perksBoxH + 16;

  // Address if present
  if (member.address) {
    const addrLines = wrapText(member.address, 86);
    const addrH = 24 + addrLines.length * 14;
    ensureSpace(addrH + 14);
    drawText('REGISTERED ADDRESS', MARGIN_X, cursorY, 9, true, [0.4, 0.44, 0.52]);
    cursorY -= 14;
    for (const line of addrLines) {
      drawText(line, MARGIN_X, cursorY, 9, false, [0.15, 0.2, 0.28]);
      cursorY -= 14;
    }
  }

  // Finalize current page
  pages.push(cmds.join('\n'));

  // Add page footer to every page
  const generatedAt = formatUAEDateTime(new Date().toISOString());
  const finalPages = pages.map((content, idx) => {
    const footerCmds = [
      `0.88 0.90 0.94 RG 0.7 w ${MARGIN_X.toFixed(2)} 54 m ${(PAGE_W - MARGIN_X).toFixed(2)} 54 l S`,
      `BT /F1 7.5 Tf 0.45 0.50 0.58 rg 1 0 0 1 ${MARGIN_X.toFixed(2)} 40 Tm (${sanitizePdfText(
        `Generated on: ${generatedAt}  |  Nex World Travel & Tourism LLC-SPC  |  +971-263-959-08`
      )}) Tj ET`,
      `BT /F1 7.5 Tf 0.45 0.50 0.58 rg 1 0 0 1 ${(PAGE_W - MARGIN_X - 55).toFixed(2)} 40 Tm (Page ${idx + 1} of ${pages.length}) Tj ET`,
      `BT /F1 7 Tf 0.55 0.60 0.68 rg 1 0 0 1 ${MARGIN_X.toFixed(2)} 28 Tm (Confidential membership summary. Password and security credentials are never exported.) Tj ET`,
    ];
    return content + '\n' + footerCmds.join('\n');
  });

  // ==================== ASSEMBLE PDF OBJECTS ====================
  const encoder = new TextEncoder();
  const chunks = [];
  let byteLength = 0;

  const pushStr = (s) => {
    const b = encoder.encode(s);
    chunks.push(b);
    byteLength += b.length;
  };
  const pushBytes = (b) => {
    chunks.push(b);
    byteLength += b.length;
  };

  pushStr('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  const offsets = [];
  const startObj = (num) => {
    offsets[num] = byteLength;
    pushStr(`${num} 0 obj\n`);
  };

  // Object allocation:
  // 1: Catalog
  // 2: Pages
  // 3: Font Helvetica (/F1)
  // 4: Font Helvetica-Bold (/F2)
  // 5: Optional Logo XObject (/Im1) if logoData present
  const hasLogo = Boolean(logoData && logoData.bytes && logoData.bytes.length > 0);
  const firstPageObjNum = hasLogo ? 6 : 5;
  const pageObjNums = [];
  const contentObjNums = [];
  for (let i = 0; i < finalPages.length; i++) {
    pageObjNums.push(firstPageObjNum + i * 2);
    contentObjNums.push(firstPageObjNum + i * 2 + 1);
  }
  const totalObjs = firstPageObjNum + finalPages.length * 2 - 1;

  startObj(1);
  pushStr('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  startObj(2);
  pushStr(`<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageObjNums.length} >>\nendobj\n`);

  startObj(3);
  pushStr('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n');

  startObj(4);
  pushStr('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n');

  if (hasLogo) {
    startObj(5);
    pushStr(
      `<< /Type /XObject /Subtype /Image /Width ${logoData.width} /Height ${logoData.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoData.bytes.length} >>\nstream\n`
    );
    pushBytes(logoData.bytes);
    pushStr('\nendstream\nendobj\n');
  }

  for (let i = 0; i < finalPages.length; i++) {
    const pNum = pageObjNums[i];
    const cNum = contentObjNums[i];
    const resources = hasLogo
      ? '<< /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Im1 5 0 R >> >>'
      : '<< /Font << /F1 3 0 R /F2 4 0 R >> >>';

    startObj(pNum);
    pushStr(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}] /Resources ${resources} /Contents ${cNum} 0 R >>\nendobj\n`
    );

    const streamBytes = encoder.encode(finalPages[i]);
    startObj(cNum);
    pushStr(`<< /Length ${streamBytes.length} >>\nstream\n`);
    pushBytes(streamBytes);
    pushStr('\nendstream\nendobj\n');
  }

  const xrefOffset = byteLength;
  pushStr(`xref\n0 ${totalObjs + 1}\n`);
  pushStr('0000000000 65535 f \n');
  for (let i = 1; i <= totalObjs; i++) {
    const off = String(offsets[i] || 0).padStart(10, '0');
    pushStr(`${off} 00000 n \n`);
  }

  pushStr(`trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  const output = new Uint8Array(byteLength);
  let pos = 0;
  for (const chunk of chunks) {
    output.set(chunk, pos);
    pos += chunk.length;
  }
  return output;
}

/**
 * Generates and triggers browser download of a professional PDF summary for the selected member.
 */
export async function exportMemberSummaryPdf(member) {
  if (!member) {
    throw new Error('No member selected for PDF export.');
  }
  const logoData = await loadLogoAsJpegBytes('/images/logo.png');
  const pdfBytes = buildMemberPdfBytes(member, logoData);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const safeId = String(member.memberId || 'Record').replace(/[^A-Za-z0-9_-]/g, '');
  const filename = `NexWorld-Member-${safeId}.pdf`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  return filename;
}
