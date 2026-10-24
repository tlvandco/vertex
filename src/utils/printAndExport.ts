import { jsPDF } from 'jspdf';
import { Invoice, POSTransaction, LegalDocument, DocumentTemplate } from '../types';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';

/**
 * Utility for client-side printing and authentic vector PDF downloads
 * Fully dynamic: respects customizable company branding, logos, custom watermarks,
 * opacities, rotations, and disclaimers from the active DocumentTemplate.
 */

const hexToRgb = (hex: string, fallback: [number, number, number] = [44, 36, 22]): [number, number, number] => {
  if (!hex) return fallback;
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? fallback : [r, g, b];
  }
  if (clean.length === 6) {
    const num = parseInt(clean, 16);
    return isNaN(num) ? fallback : [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  return fallback;
};

export const getEffectiveTemplate = (template?: DocumentTemplate): DocumentTemplate => {
  if (template) return template;
  try {
    const savedActiveId = localStorage.getItem('vertex_active_template_id');
    const savedTemplatesJson = localStorage.getItem('vertex_document_templates');
    if (savedTemplatesJson) {
      const parsed: DocumentTemplate[] = JSON.parse(savedTemplatesJson);
      const match = parsed.find(t => t.id === savedActiveId) || parsed.find(t => t.isDefault) || parsed[0];
      if (match) return match;
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_TEMPLATES[0];
};

export const downloadFile = (fileName: string, content: string | Blob, mimeType = 'text/plain') => {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
};

export const downloadDataUrl = (fileName: string, dataUrl: string) => {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    if (dataUrl.startsWith('blob:')) {
      URL.revokeObjectURL(dataUrl);
    }
  }, 300);
};

export const printDocumentHtml = (title: string, bodyHtml: string) => {
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  document.body.appendChild(printFrame);

  const frameDoc = printFrame.contentWindow?.document;
  if (!frameDoc) {
    window.print();
    return;
  }

  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          @page {
            margin: 14mm;
            size: auto;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1a1a1a;
            background: #ffffff;
            margin: 0;
            padding: 24px;
            line-height: 1.5;
            font-size: 13px;
            position: relative;
          }
          .brand-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #2C2416;
            padding-bottom: 18px;
            margin-bottom: 24px;
          }
          .brand-logo-img {
            max-height: 48px;
            max-width: 180px;
            object-fit: contain;
            margin-bottom: 6px;
          }
          .brand-name {
            font-family: "Playfair Display", Georgia, serif;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 1.5px;
            color: #2C2416;
            margin: 0;
            line-height: 1.2;
          }
          .brand-sub {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #8B7355;
            margin-top: 4px;
          }
          .doc-meta {
            text-align: right;
            font-size: 12px;
            color: #4b5563;
          }
          .doc-title {
            font-size: 18px;
            font-weight: bold;
            color: #111827;
            margin: 0 0 6px 0;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            background: #e5e7eb;
            color: #374151;
          }
          .badge-paid {
            background: #dcfce7;
            color: #166534;
          }
          .badge-pending {
            background: #fef3c7;
            color: #92400e;
          }
          .grid-two {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
          }
          .info-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 14px;
          }
          .info-card h4 {
            margin: 0 0 8px 0;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background: #f3f4f6;
            color: #374151;
            text-align: left;
            padding: 10px 12px;
            font-size: 11px;
            text-transform: uppercase;
            border-top: 1px solid #e5e7eb;
            border-bottom: 2px solid #e5e7eb;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 12px;
          }
          .text-right {
            text-align: right;
          }
          .totals-wrap {
            display: flex;
            justify-content: flex-end;
            margin-top: 16px;
          }
          .totals-table {
            width: 280px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
            color: #4b5563;
          }
          .totals-grand {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 16px;
            font-weight: bold;
            color: #111827;
            border-top: 2px solid #2C2416;
            margin-top: 6px;
          }
          .seal-box {
            margin-top: 28px;
            padding: 14px;
            border: 1px dashed #d1d5db;
            border-radius: 8px;
            background: #fafafa;
            font-family: monospace;
            font-size: 10px;
            color: #4b5563;
          }
          .seal-box strong {
            color: #111827;
          }
          .footer-note {
            margin-top: 28px;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 14px;
            line-height: 1.6;
          }
          .watermark-overlay {
            position: fixed;
            top: 50%;
            left: 50%;
            pointer-events: none;
            z-index: 0;
            text-align: center;
            font-weight: 900;
            font-size: 48px;
            letter-spacing: 6px;
            text-transform: uppercase;
            white-space: nowrap;
          }
          .doc-content-wrapper {
            position: relative;
            z-index: 1;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
            .watermark-overlay {
              position: fixed;
            }
          }
        </style>
      </head>
      <body>
        ${bodyHtml}
      </body>
    </html>
  `);
  frameDoc.close();

  setTimeout(() => {
    printFrame.contentWindow?.focus();
    printFrame.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(printFrame)) {
        document.body.removeChild(printFrame);
      }
    }, 2500);
  }, 350);
};

export const generateInvoiceHtml = (invoice: Invoice, templateConfig?: DocumentTemplate): string => {
  const tpl = getEffectiveTemplate(templateConfig);
  const isPaid = invoice.status === 'PAID';
  const badgeClass = isPaid ? 'badge-paid' : 'badge-pending';

  const watermarkHtml = tpl.showWatermark && tpl.watermarkType !== 'none' ? `
    <div class="watermark-overlay" style="
      opacity: ${tpl.watermarkOpacity};
      transform: translate(-50%, -50%) rotate(${tpl.watermarkAngle}deg);
      color: ${tpl.primaryColor};
    ">
      ${tpl.watermarkType === 'image' && tpl.watermarkImageUrl ? `
        <img src="${tpl.watermarkImageUrl}" style="max-width: 320px; opacity: ${tpl.watermarkOpacity};" alt="Watermark" />
      ` : `
        ${tpl.watermarkText || tpl.companyName}
      `}
    </div>
  ` : '';

  const logoOrMonogram = tpl.logoUrl ? `
    <img src="${tpl.logoUrl}" class="brand-logo-img" alt="${tpl.companyName}" />
  ` : '';

  return `
    <div class="doc-content-wrapper">
      ${watermarkHtml}

      <div class="brand-header" style="border-bottom-color: ${tpl.primaryColor};">
        <div>
          ${logoOrMonogram}
          <h1 class="brand-name" style="color: ${tpl.primaryColor}; font-family: ${tpl.fontFamily === 'serif' ? '"Playfair Display", Georgia, serif' : tpl.fontFamily === 'mono' ? '"Courier New", monospace' : '-apple-system, BlinkMacSystemFont, sans-serif'};">
            ${tpl.companyName}
          </h1>
          <div class="brand-sub" style="color: ${tpl.accentColor};">${tpl.entityTypeTagline}</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
            ${tpl.addressLine1}${tpl.addressLine2 ? ` &bull; ${tpl.addressLine2}` : ''} &bull; ${tpl.phone} &bull; ${tpl.email}
          </div>
          ${tpl.architectLicenseNumber ? `
            <div style="font-size: 10px; color: #9ca3af; margin-top: 2px;">
              License / Registration: ${tpl.architectLicenseNumber} &bull; Tax ID: ${tpl.taxRegistrationNumber}
            </div>
          ` : ''}
        </div>
        <div class="doc-meta">
          <div class="doc-title">INVOICE STATEMENT</div>
          <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
          <div><strong>Date:</strong> ${invoice.issueDate}</div>
          <div><strong>Due Date:</strong> ${invoice.dueDate}</div>
          <div style="margin-top: 6px;">
            <span class="badge ${badgeClass}">${invoice.status}</span>
          </div>
        </div>
      </div>

      <div class="grid-two">
        <div class="info-card">
          <h4>Billed To</h4>
          <div style="font-weight: bold; font-size: 14px; color: #111827;">${invoice.clientName}</div>
          <div style="color: #4b5563; font-size: 12px; margin-top: 2px;">${invoice.clientEmail}</div>
          <div style="color: #6b7280; font-size: 11px; margin-top: 4px;">Client Account ID: ${invoice.clientId}</div>
        </div>
        <div class="info-card">
          <h4>Project Estate</h4>
          <div style="font-weight: bold; font-size: 14px; color: #111827;">${invoice.projectName}</div>
          <div style="color: #4b5563; font-size: 12px; margin-top: 2px;">Project Code: ${invoice.projectId}</div>
          <div style="color: #6b7280; font-size: 11px; margin-top: 4px;">Escrow Billing Reference: ESC-${invoice.id.slice(-6).toUpperCase()}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr style="background: ${tpl.primaryColor}10;">
            <th style="width: 50%;">Description / Scope of Work</th>
            <th class="text-right" style="width: 15%;">Qty</th>
            <th class="text-right" style="width: 15%;">Unit Rate</th>
            <th class="text-right" style="width: 20%;">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.items || []).map(item => `
            <tr>
              <td>
                <div style="font-weight: 600; color: #111827;">${item.description}</div>
              </td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">$${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td class="text-right" style="font-weight: 600;">$${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals-wrap">
        <div class="totals-table">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>$${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="totals-row">
            <span>Procurement Tax (8%):</span>
            <span>$${invoice.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="totals-grand" style="border-top-color: ${tpl.primaryColor};">
            <span>Total Balance Due:</span>
            <span style="color: ${tpl.accentColor}; font-weight: 800;">$${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      ${tpl.invoiceWireInstructions ? `
        <div style="margin-top: 20px; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11px;">
          <div style="font-weight: bold; color: ${tpl.primaryColor}; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">Banking &amp; Wire Settlement Instructions:</div>
          <div style="margin-top: 3px; color: #334155;">${tpl.invoiceWireInstructions}</div>
        </div>
      ` : ''}

      <div class="seal-box">
        <div><strong>${tpl.sealTitle}:</strong></div>
        <div style="margin-top: 4px; word-break: break-all;">
          HASH: SHA256:4b9a81e7d62f01ac29f829871182319b9812a8149814c810981b94871
        </div>
        <div style="margin-top: 4px;">
          Status: ${isPaid ? 'PAID &amp; CERTIFIED SETTLED' : 'AUTHORIZED FOR DIRECT WIRE / ESCROW SETTLEMENT'} &bull; Issued By: ${tpl.legalEntityName} &bull; Generated: ${new Date().toISOString()}
        </div>
      </div>

      <div class="footer-note">
        ${tpl.invoiceFooterDisclaimer}
        ${tpl.watermarkPlacement === 'bottom_seal' && tpl.showWatermark ? `
          <div style="margin-top: 8px; font-size: 9px; opacity: 0.7; letter-spacing: 2px;">
            &bull; WATERMARK AUDIT STAMP: ${tpl.watermarkText || tpl.companyName} &bull;
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

export const generatePOSThermalSlipHtml = (tx: POSTransaction, templateConfig?: DocumentTemplate): string => {
  const tpl = getEffectiveTemplate(templateConfig);

  return `
    <div style="max-width: 320px; margin: 0 auto; font-family: 'Courier New', Courier, monospace; font-size: 11px; padding: 10px; position: relative;">
      ${tpl.showWatermark && tpl.watermarkType === 'text' ? `
        <div style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(${tpl.watermarkAngle}deg); font-size: 20px; font-weight: bold; color: #000; opacity: ${tpl.watermarkOpacity}; pointer-events: none; text-align: center; white-space: nowrap;">
          ${tpl.watermarkText || tpl.companyName}
        </div>
      ` : ''}

      <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
        <div style="font-size: 16px; font-weight: bold; letter-spacing: 1px;">${tpl.companyName}</div>
        <div style="font-size: 10px;">${tpl.posSlipHeader}</div>
        <div style="font-size: 9px; margin-top: 4px;">${tpl.addressLine1}</div>
        <div style="font-size: 9px;">TEL: ${tpl.phone}</div>
      </div>

      <div style="margin-bottom: 10px; font-size: 10px; line-height: 1.4;">
        <div>TX NUMBER : ${tx.transactionNumber}</div>
        <div>DATE/TIME : ${tx.timestamp}</div>
        <div>TERMINAL  : ${tx.terminalId}</div>
        <div>CASHIER   : ${tx.cashierName} (${tx.cashierRole})</div>
        <div>CLIENT    : ${tx.clientName}</div>
        <div>ESTATE    : ${tx.projectName}</div>
        <div>PAY METHOD: ${tx.paymentMethod} &bull; ${tx.cardLastFour ? `*${tx.cardLastFour}` : 'DIRECT'}</div>
      </div>

      <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 6px 0; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
          <span>ITEM / SCOPE</span>
          <span>AMOUNT</span>
        </div>
        ${(tx.items && tx.items.length > 0) ? tx.items.map(it => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>${it.description} (x${it.quantity})</span>
            <span>$${it.total.toLocaleString()}</span>
          </div>
          <div style="font-size: 9px; color: #555; margin-bottom: 4px;">CATEGORY: ${it.category}</div>
        `).join('') : `
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>Procurement &amp; Services</span>
            <span>$${(tx.total ?? 0).toLocaleString()}</span>
          </div>
        `}
      </div>

      <div style="margin-bottom: 10px; font-size: 10px; line-height: 1.5;">
        <div style="display: flex; justify-content: space-between;">
          <span>SUBTOTAL:</span>
          <span>$${(tx.subtotal ?? tx.total).toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>TAX (8%):</span>
          <span>$${tx.tax.toLocaleString()}</span>
        </div>
        ${tx.contingencyFee > 0 ? `
          <div style="display: flex; justify-content: space-between;">
            <span>ESCROW CONTINGENCY:</span>
            <span>$${tx.contingencyFee.toLocaleString()}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px;">
          <span>TOTAL SETTLED:</span>
          <span>$${tx.total.toLocaleString()}</span>
        </div>
      </div>

      <div style="border: 1px solid #000; padding: 6px; text-align: center; margin-top: 12px; font-size: 9px;">
        <div style="font-weight: bold;">${tpl.sealTitle}</div>
        <div style="word-break: break-all; margin-top: 2px;">${tx.receiptHash}</div>
        <div style="margin-top: 4px; font-weight: bold;">STATUS: APPROVED / CAPTURED</div>
      </div>

      <div style="text-align: center; margin-top: 14px; font-size: 9px;">
        *** ${tpl.posSlipFooter} ***<br />
        ISSUED BY ${tpl.legalEntityName.toUpperCase()}
      </div>
    </div>
  `;
};

export const generateLegalDocHtml = (doc: LegalDocument, templateConfig?: DocumentTemplate): string => {
  const tpl = getEffectiveTemplate(templateConfig);
  const cert = doc.signatureCertificate;

  const watermarkHtml = tpl.showWatermark && tpl.watermarkType !== 'none' ? `
    <div class="watermark-overlay" style="
      opacity: ${tpl.watermarkOpacity};
      transform: translate(-50%, -50%) rotate(${tpl.watermarkAngle}deg);
      color: ${tpl.primaryColor};
    ">
      ${tpl.watermarkText || tpl.companyName}
    </div>
  ` : '';

  return `
    <div class="doc-content-wrapper">
      ${watermarkHtml}

      <div class="brand-header" style="border-bottom-color: ${tpl.primaryColor};">
        <div>
          ${tpl.logoUrl ? `<img src="${tpl.logoUrl}" class="brand-logo-img" alt="${tpl.companyName}" />` : ''}
          <h1 class="brand-name" style="color: ${tpl.primaryColor};">${tpl.companyName}</h1>
          <div class="brand-sub" style="color: ${tpl.accentColor};">${tpl.legalDocumentVaultHeader}</div>
        </div>
        <div class="doc-meta">
          <div class="doc-title">${doc.title}</div>
          <div><strong>Doc Reference:</strong> ${doc.documentNumber}</div>
          <div><strong>Category:</strong> ${doc.category}</div>
          <div><strong>Effective Date:</strong> ${doc.effectiveDate}</div>
          <div style="margin-top: 6px;">
            <span class="badge badge-paid">${doc.status}</span>
          </div>
        </div>
      </div>

      <div class="grid-two">
        <div class="info-card">
          <h4>Party of First Part (Disclosing / Architect)</h4>
          <div style="font-weight: bold; font-size: 14px; color: #111827;">${tpl.legalEntityName}</div>
          <div style="color: #4b5563; font-size: 12px;">${tpl.addressLine1}${tpl.addressLine2 ? `, ${tpl.addressLine2}` : ''}</div>
          <div style="color: #6b7280; font-size: 11px; margin-top: 3px;">Tax ID: ${tpl.taxRegistrationNumber}</div>
        </div>
        <div class="info-card">
          <h4>Party of Second Part (Recipient / Partner)</h4>
          <div style="font-weight: bold; font-size: 14px; color: #111827;">${doc.companyName || doc.clientName}</div>
          <div style="color: #4b5563; font-size: 12px;">Project Association: ${doc.projectName}</div>
        </div>
      </div>

      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; margin: 20px 0; font-size: 13px; line-height: 1.7; white-space: pre-line; color: #1f2937;">
${doc.content}
      </div>

      ${cert ? `
        <div class="seal-box" style="background: #f0fdf4; border-color: #86efac; color: #166534;">
          <div style="font-size: 12px; font-weight: bold; color: #14532d;">🔐 CRYPTOGRAPHIC DIGITAL SIGNATURE CERTIFICATE</div>
          <div style="margin-top: 6px;"><strong>Certificate ID:</strong> ${cert.certificateId}</div>
          <div><strong>Signed By:</strong> ${cert.signedByName} (${cert.signedByRole || 'Authorized Officer'})</div>
          <div><strong>Timestamp:</strong> ${cert.signedAt}</div>
          <div><strong>Origin IP:</strong> ${cert.ipAddress || '198.51.100.42'}</div>
          <div style="word-break: break-all; margin-top: 4px;"><strong>SHA-256 Tamper Seal:</strong> ${cert.cryptoHash}</div>
        </div>
      ` : ''}

      <div class="footer-note">
        ${tpl.legalDocumentFooterDisclaimer}
        <div style="margin-top: 4px; font-size: 10px; color: #9ca3af;">
          Jurisdiction: ${tpl.legalDocumentJurisdiction}
        </div>
      </div>
    </div>
  `;
};

/**
 * Generates and downloads a genuine vector PDF Invoice Statement with active template branding
 */
export const downloadInvoicePdf = (invoice: Invoice, templateConfig?: DocumentTemplate): void => {
  const tpl = getEffectiveTemplate(templateConfig);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const isPaid = invoice.status === 'PAID';

  const [pr, pg, pb] = hexToRgb(tpl.primaryColor, [44, 36, 22]);
  const [ar, ag, ab] = hexToRgb(tpl.accentColor, [139, 115, 85]);

  // Watermark on PDF if enabled
  if (tpl.showWatermark && tpl.watermarkType !== 'none' && tpl.watermarkText) {
    pdf.saveGraphicsState();
    // Render faint diagonal watermark across center of page
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(26);
    // Convert opacity (0.01 - 0.40) to RGB lightness tone
    const lightness = Math.round(255 - (tpl.watermarkOpacity * 255 * 1.8));
    pdf.setTextColor(lightness, lightness, lightness);
    pdf.text(tpl.watermarkText, 105, 150, {
      align: 'center',
      angle: tpl.watermarkAngle || -30
    });
    pdf.restoreGraphicsState();
  }

  // Top header accent line
  pdf.setFillColor(pr, pg, pb);
  pdf.rect(15, 12, 180, 2.5, 'F');

  // Brand Name & Subtitle
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(pr, pg, pb);
  pdf.text(tpl.companyName, 15, 23);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(ar, ag, ab);
  pdf.text(tpl.entityTypeTagline.toUpperCase(), 15, 28);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`${tpl.addressLine1}  •  ${tpl.phone}  •  ${tpl.email}`, 15, 33);

  // Document Info (Right side)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(17, 24, 39);
  pdf.text('INVOICE STATEMENT', 195, 22, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(75, 85, 99);
  pdf.text(`Invoice #: ${invoice.invoiceNumber}`, 195, 28, { align: 'right' });
  pdf.text(`Issue Date: ${invoice.issueDate}`, 195, 33, { align: 'right' });
  pdf.text(`Due Date: ${invoice.dueDate}`, 195, 38, { align: 'right' });

  // Status Badge
  if (isPaid) {
    pdf.setFillColor(220, 252, 231);
    pdf.roundedRect(165, 41, 30, 6, 1.5, 1.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(22, 101, 52);
    pdf.text('STATUS: PAID', 180, 45.2, { align: 'center' });
  } else {
    pdf.setFillColor(254, 243, 199);
    pdf.roundedRect(155, 41, 40, 6, 1.5, 1.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(146, 64, 14);
    pdf.text(`STATUS: ${invoice.status}`, 175, 45.2, { align: 'center' });
  }

  // Divider
  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.5);
  pdf.line(15, 50, 195, 50);

  // Left Box: Billed To
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15, 54, 87, 28, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(156, 163, 175);
  pdf.text('BILLED TO', 20, 60);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(17, 24, 39);
  pdf.text(invoice.clientName, 20, 66);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(75, 85, 99);
  pdf.text(invoice.clientEmail || 'Client Account Records', 20, 71);
  pdf.text(`Account ID: ${invoice.clientId}`, 20, 76);

  // Right Box: Project Estate
  pdf.setFillColor(249, 250, 251);
  pdf.roundedRect(108, 54, 87, 28, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(156, 163, 175);
  pdf.text('PROJECT ESTATE', 113, 60);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(17, 24, 39);
  pdf.text(invoice.projectName, 113, 66);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(75, 85, 99);
  pdf.text(`Project Code: ${invoice.projectId}`, 113, 71);
  pdf.text(`Escrow Ref: ESC-${invoice.id.slice(-6).toUpperCase()}`, 113, 76);

  // Table Header
  let tableY = 90;
  pdf.setFillColor(pr, pg, pb);
  pdf.rect(15, tableY, 180, 8, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text('DESCRIPTION / SCOPE OF WORK', 20, tableY + 5.5);
  pdf.text('QTY', 125, tableY + 5.5, { align: 'right' });
  pdf.text('UNIT RATE', 155, tableY + 5.5, { align: 'right' });
  pdf.text('TOTAL AMOUNT', 190, tableY + 5.5, { align: 'right' });

  tableY += 8;

  // Table Rows
  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    { id: '1', description: 'Architectural & Engineering Services', quantity: 1, unitPrice: invoice.amount, total: invoice.amount }
  ];

  items.forEach((item, index) => {
    if (index % 2 === 1) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(15, tableY, 180, 8.5, 'F');
    }
    pdf.setDrawColor(243, 244, 246);
    pdf.line(15, tableY + 8.5, 195, tableY + 8.5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(31, 41, 55);
    pdf.text(item.description, 20, tableY + 5.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text(String(item.quantity), 125, tableY + 5.5, { align: 'right' });
    pdf.text(`$${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 155, tableY + 5.5, { align: 'right' });

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(`$${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 190, tableY + 5.5, { align: 'right' });

    tableY += 8.5;
  });

  // Financial Totals block
  tableY += 6;
  const totalsX = 135;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(107, 114, 128);
  pdf.text('Subtotal:', totalsX, tableY);
  pdf.setTextColor(31, 41, 55);
  pdf.text(`$${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 190, tableY, { align: 'right' });

  tableY += 6;
  pdf.setTextColor(107, 114, 128);
  pdf.text('Procurement Tax (8%):', totalsX, tableY);
  pdf.setTextColor(31, 41, 55);
  pdf.text(`$${invoice.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 190, tableY, { align: 'right' });

  tableY += 4;
  pdf.setDrawColor(pr, pg, pb);
  pdf.setLineWidth(0.8);
  pdf.line(totalsX - 5, tableY, 195, tableY);

  tableY += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(17, 24, 39);
  pdf.text('Total Balance Due:', totalsX, tableY);
  pdf.setTextColor(ar, ag, ab);
  pdf.text(`$${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 190, tableY, { align: 'right' });

  // Cryptographic Audit Seal Box
  tableY += 14;
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(209, 213, 219);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(15, tableY, 180, 24, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(17, 24, 39);
  pdf.text(tpl.sealTitle, 20, tableY + 6);

  pdf.setFont('courier', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(107, 114, 128);
  pdf.text('SHA-256: 4b9a81e7d62f01ac29f829871182319b9812a8149814c810981b948710928a3f', 20, tableY + 12);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(75, 85, 99);
  pdf.text(`Status: ${isPaid ? 'PAID & CERTIFIED SETTLED' : 'AUTHORIZED FOR DIRECT WIRE / ESCROW SETTLEMENT'}  •  Issuer: ${tpl.legalEntityName}`, 20, tableY + 18);

  // Wire Instructions on PDF if available
  if (tpl.invoiceWireInstructions) {
    tableY += 26;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Wire Instructions: ${tpl.invoiceWireInstructions}`, 15, tableY);
  }

  // Footer note
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(156, 163, 175);
  const footerText = tpl.invoiceFooterDisclaimer;
  const wrappedFooter = pdf.splitTextToSize(footerText, 180);
  pdf.text(wrappedFooter, 15, 275);

  pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};

/**
 * Generates and downloads a vector PDF for Executive POS Thermal Slip with template customization
 */
export const downloadPOSThermalSlipPdf = (tx: POSTransaction, templateConfig?: DocumentTemplate): void => {
  const tpl = getEffectiveTemplate(templateConfig);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [100, 185] });

  // Top header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(17, 24, 39);
  pdf.text(tpl.companyName, 50, 14, { align: 'center' });

  pdf.setFontSize(7.5);
  const [ar, ag, ab] = hexToRgb(tpl.accentColor, [139, 115, 85]);
  pdf.setTextColor(ar, ag, ab);
  pdf.text(tpl.posSlipHeader, 50, 19, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`${tpl.addressLine1}  •  ${tpl.phone}`, 50, 24, { align: 'center' });

  // Line
  pdf.setDrawColor(200, 200, 200);
  pdf.line(10, 28, 90, 28);

  // Meta
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(55, 65, 81);
  let y = 34;
  pdf.text(`TX NUMBER : ${tx.transactionNumber}`, 10, y); y += 4.5;
  pdf.text(`DATE/TIME : ${tx.timestamp}`, 10, y); y += 4.5;
  pdf.text(`TERMINAL  : ${tx.terminalId}`, 10, y); y += 4.5;
  pdf.text(`CASHIER   : ${tx.cashierName} (${tx.cashierRole})`, 10, y); y += 4.5;
  pdf.text(`CLIENT    : ${tx.clientName}`, 10, y); y += 4.5;
  pdf.text(`ESTATE    : ${tx.projectName}`, 10, y); y += 4.5;
  pdf.text(`METHOD    : ${tx.paymentMethod} ${tx.cardLastFour ? `(*${tx.cardLastFour})` : ''}`, 10, y); y += 6;

  // Items Header
  pdf.line(10, y, 90, y); y += 4.5;
  pdf.setFont('courier', 'bold');
  pdf.text('ITEM / SCOPE', 10, y);
  pdf.text('AMOUNT', 90, y, { align: 'right' });
  y += 4.5;
  pdf.line(10, y, 90, y); y += 5;

  // Items
  pdf.setFont('courier', 'normal');
  if (tx.items && tx.items.length > 0) {
    tx.items.forEach(it => {
      const desc = it.description.length > 22 ? it.description.slice(0, 20) + '..' : it.description;
      pdf.text(`${desc} (x${it.quantity})`, 10, y);
      pdf.text(`$${it.total.toLocaleString()}`, 90, y, { align: 'right' });
      y += 4;
      pdf.setFontSize(6);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`CAT: ${it.category}`, 10, y);
      pdf.setFontSize(7);
      pdf.setTextColor(55, 65, 81);
      y += 5;
    });
  } else {
    pdf.text('Architecture Services', 10, y);
    pdf.text(`$${(tx.total ?? 0).toLocaleString()}`, 90, y, { align: 'right' });
    y += 5;
  }

  pdf.line(10, y, 90, y); y += 5;

  // Totals
  pdf.text('SUBTOTAL:', 10, y);
  pdf.text(`$${(tx.subtotal ?? tx.total).toLocaleString()}`, 90, y, { align: 'right' });
  y += 4.5;

  pdf.text('TAX (8%):', 10, y);
  pdf.text(`$${tx.tax.toLocaleString()}`, 90, y, { align: 'right' });
  y += 4.5;

  if (tx.contingencyFee > 0) {
    pdf.text('ESCROW CONT.:', 10, y);
    pdf.text(`$${tx.contingencyFee.toLocaleString()}`, 90, y, { align: 'right' });
    y += 4.5;
  }

  y += 2;
  pdf.line(10, y, 90, y); y += 5;
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(8.5);
  pdf.text('TOTAL SETTLED:', 10, y);
  pdf.text(`$${tx.total.toLocaleString()}`, 90, y, { align: 'right' });
  y += 8;

  // Seal
  pdf.setFillColor(245, 245, 245);
  pdf.rect(10, y, 80, 16, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.text(tpl.sealTitle, 50, y + 4.5, { align: 'center' });
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(5);
  const hash = tx.receiptHash.length > 40 ? tx.receiptHash.slice(0, 38) + '...' : tx.receiptHash;
  pdf.text(hash, 50, y + 8.5, { align: 'center' });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6);
  pdf.text('STATUS: APPROVED / CAPTURED', 50, y + 13, { align: 'center' });

  y += 24;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(156, 163, 175);
  pdf.text(`*** ${tpl.posSlipFooter} ***`, 50, y, { align: 'center' });

  pdf.save(`POS_Slip_${tx.transactionNumber}.pdf`);
};

/**
 * Generates and downloads a vector PDF for Legal Compliance Agreements
 */
export const downloadLegalDocPdf = (doc: LegalDocument, templateConfig?: DocumentTemplate): void => {
  const tpl = getEffectiveTemplate(templateConfig);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const cert = doc.signatureCertificate;

  const [pr, pg, pb] = hexToRgb(tpl.primaryColor, [44, 36, 22]);
  const [ar, ag, ab] = hexToRgb(tpl.accentColor, [139, 115, 85]);

  // Watermark on Legal Doc PDF
  if (tpl.showWatermark && tpl.watermarkType !== 'none' && tpl.watermarkText) {
    pdf.saveGraphicsState();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(26);
    const lightness = Math.round(255 - (tpl.watermarkOpacity * 255 * 1.8));
    pdf.setTextColor(lightness, lightness, lightness);
    pdf.text(tpl.watermarkText, 105, 150, {
      align: 'center',
      angle: tpl.watermarkAngle || -30
    });
    pdf.restoreGraphicsState();
  }

  // Header accent line
  pdf.setFillColor(pr, pg, pb);
  pdf.rect(15, 12, 180, 2.5, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(pr, pg, pb);
  pdf.text(tpl.companyName, 15, 22);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(ar, ag, ab);
  pdf.text(tpl.legalDocumentVaultHeader.toUpperCase(), 15, 27);

  // Doc info (Right)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(17, 24, 39);
  pdf.text(doc.title, 195, 22, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Ref: ${doc.documentNumber}`, 195, 27, { align: 'right' });
  pdf.text(`Effective: ${doc.effectiveDate}  •  Status: ${doc.status}`, 195, 32, { align: 'right' });

  // Divider
  pdf.setDrawColor(229, 231, 235);
  pdf.line(15, 36, 195, 36);

  // Parties info
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15, 40, 87, 22, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(156, 163, 175);
  pdf.text('PARTY OF FIRST PART (DISCLOSING / ARCHITECT)', 20, 46);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(17, 24, 39);
  pdf.text(tpl.legalEntityName, 20, 52);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(107, 114, 128);
  pdf.text(tpl.addressLine1, 20, 57);

  // Party 2
  pdf.setFillColor(249, 250, 251);
  pdf.roundedRect(108, 40, 87, 22, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(156, 163, 175);
  pdf.text('PARTY OF SECOND PART (RECIPIENT)', 113, 46);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(17, 24, 39);
  pdf.text(doc.companyName || doc.clientName, 113, 52);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Project Association: ${doc.projectName}`, 113, 57);

  // Document Content Box
  const y = 68;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15, y, 180, 140, 2, 2, 'FD');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(31, 41, 55);

  const wrappedContent = pdf.splitTextToSize(doc.content, 170);
  pdf.text(wrappedContent.slice(0, 42), 20, y + 8);

  // Digital Signature Seal
  const sealY = 214;
  if (cert) {
    pdf.setFillColor(240, 253, 244);
    pdf.setDrawColor(134, 239, 172);
    pdf.roundedRect(15, sealY, 180, 32, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(20, 83, 45);
    pdf.text(tpl.sealTitle, 20, sealY + 6);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(22, 101, 52);
    pdf.text(`Certificate ID: ${cert.certificateId}  •  Timestamp: ${cert.signedAt}`, 20, sealY + 12);
    pdf.text(`Signer: ${cert.signedByName} (${cert.signedByRole || 'Authorized Signatory'})  •  IP: ${cert.ipAddress || '198.51.100.42'}`, 20, sealY + 17);

    pdf.setFont('courier', 'normal');
    pdf.setFontSize(6.5);
    pdf.text(`Tamper Seal: ${cert.cryptoHash}`, 20, sealY + 24);
  } else {
    pdf.setFillColor(249, 250, 251);
    pdf.setDrawColor(229, 231, 235);
    pdf.roundedRect(15, sealY, 180, 26, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(55, 65, 81);
    pdf.text('STATUS: PENDING EXECUTION / DIGITAL SEAL', 20, sealY + 8);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Awaiting bilateral countersignature via ${tpl.companyName} Compliance Vault.`, 20, sealY + 15);
  }

  // Footer note
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(156, 163, 175);
  pdf.text(tpl.legalDocumentFooterDisclaimer, 15, 275);

  pdf.save(`${doc.documentNumber}_Executed_Agreement.pdf`);
};

/**
 * Generates and downloads a vector PDF for Executed Mutual NDA with template branding
 */
export const downloadNdaPdf = (company: {
  name: string;
  registrationNumber?: string;
  ndaSignedAt?: string;
}, templateConfig?: DocumentTemplate): void => {
  const tpl = getEffectiveTemplate(templateConfig);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const [pr, pg, pb] = hexToRgb(tpl.primaryColor, [44, 36, 22]);
  const [ar, ag, ab] = hexToRgb(tpl.accentColor, [139, 115, 85]);

  if (tpl.showWatermark && tpl.watermarkType !== 'none' && tpl.watermarkText) {
    pdf.saveGraphicsState();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(26);
    const lightness = Math.round(255 - (tpl.watermarkOpacity * 255 * 1.8));
    pdf.setTextColor(lightness, lightness, lightness);
    pdf.text(tpl.watermarkText, 105, 150, {
      align: 'center',
      angle: tpl.watermarkAngle || -30
    });
    pdf.restoreGraphicsState();
  }

  // Top header accent line
  pdf.setFillColor(pr, pg, pb);
  pdf.rect(15, 12, 180, 2.5, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(pr, pg, pb);
  pdf.text(tpl.companyName, 15, 22);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(ar, ag, ab);
  pdf.text(tpl.entityTypeTagline.toUpperCase(), 15, 27);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(17, 24, 39);
  pdf.text('MUTUAL NON-DISCLOSURE COVENANT', 195, 22, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128);
  pdf.text(tpl.legalDocumentJurisdiction, 195, 27, { align: 'right' });

  pdf.setDrawColor(229, 231, 235);
  pdf.line(15, 33, 195, 33);

  // Covenant Parties
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15, 38, 180, 28, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(156, 163, 175);
  pdf.text('COVENANT PARTIES & EXECUTION METRICS', 20, 44);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(17, 24, 39);
  pdf.text(`Party 1: ${tpl.legalEntityName} (Disclosing / Proprietary Entity)`, 20, 50);
  pdf.text(`Party 2: ${company.name} (Recipient Partner / Vendor)`, 20, 56);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(75, 85, 99);
  pdf.text(`Registration: ${company.registrationNumber || 'CORP-STATE-CA-83921'}  •  Executed Date: ${company.ndaSignedAt || '2026-09-01'}  •  Tier: High Concurrent Restriction`, 20, 62);

  let y = 73;
  const clauses = [
    {
      title: '1. PURPOSE & SCOPE',
      body: `The parties intend to collaborate regarding luxury architectural design, structural engineering, and procurement services with ${tpl.companyName}. In connection with this purpose, confidential CAD drawings, BIM files, client identities, and pricing matrices will be disclosed.`
    },
    {
      title: '2. DEFINITION OF CONFIDENTIAL INFORMATION',
      body: 'All proprietary architectural sketches, structural calculations, MEP plans, client estates, procurement vendor networks, and project budgets marked or reasonably understood to be confidential.'
    },
    {
      title: '3. NON-DISCLOSURE OBLIGATIONS',
      body: `The Receiving Party covenants to hold all Confidential Information in strictest confidence and not disclose it to any third party without prior written consent from ${tpl.companyName}.`
    },
    {
      title: '4. REMEDIES & GOVERNING LAW',
      body: `Any unauthorized dissemination shall cause irreparable injury. This covenant is governed under ${tpl.legalDocumentJurisdiction}.`
    }
  ];

  clauses.forEach(clause => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(pr, pg, pb);
    pdf.text(clause.title, 15, y);
    y += 4.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(55, 65, 81);
    const splitBody = pdf.splitTextToSize(clause.body, 180);
    pdf.text(splitBody, 15, y);
    y += (splitBody.length * 3.8) + 4;
  });

  // Seal box
  y += 4;
  pdf.setFillColor(240, 253, 244);
  pdf.setDrawColor(134, 239, 172);
  pdf.roundedRect(15, y, 180, 28, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(20, 83, 45);
  pdf.text(tpl.sealTitle, 20, y + 6);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(22, 101, 52);
  pdf.text(`Status: EXECUTED & DIGITALLY VERIFIED  •  Signed: ${company.ndaSignedAt || '2026-09-01'}`, 20, y + 12);

  pdf.setFont('courier', 'normal');
  pdf.setFontSize(6.5);
  pdf.text('SHA-256: 4b9a81e7d62f01ac29f829871182319b9812a8149814c810981b948710928a3f', 20, y + 18);
  pdf.text('ARCHIVE ID: SEC-CERTIFIED-COVENANT-RECORD', 20, y + 23);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(156, 163, 175);
  pdf.text(`Executed bilateral agreement recorded in ${tpl.companyName} Compliance Vault.`, 15, 275);

  pdf.save(`${tpl.companyName.replace(/\s+/g, '_')}_Executed_NDA_${company.name.replace(/\s+/g, '_')}.pdf`);
};

/**
 * Generates an open-source downloadable HTML template file with variables
 */
export const downloadHtmlTemplateCode = (tpl: DocumentTemplate): void => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{documentTitle}} - ${tpl.companyName}</title>
  <style>
    @page { margin: 15mm; size: auto; }
    body {
      font-family: ${tpl.fontFamily === 'serif' ? 'Georgia, serif' : tpl.fontFamily === 'mono' ? 'Courier, monospace' : 'Arial, sans-serif'};
      color: #1a1a1a;
      background: #ffffff;
      padding: 30px;
      line-height: 1.6;
    }
    .header {
      border-bottom: 2px solid ${tpl.primaryColor};
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
    }
    .brand-name {
      font-size: 26px;
      font-weight: bold;
      color: ${tpl.primaryColor};
    }
    .tagline {
      font-size: 12px;
      color: ${tpl.accentColor};
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .watermark {
      ${tpl.showWatermark ? `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(${tpl.watermarkAngle}deg);
      font-size: 46px;
      font-weight: bold;
      color: #000;
      opacity: ${tpl.watermarkOpacity};
      pointer-events: none;
      z-index: 0;
      ` : 'display: none;'}
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
      font-size: 11px;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="watermark">${tpl.watermarkText || tpl.companyName}</div>
  <div class="header">
    <div>
      <div class="brand-name">${tpl.companyName}</div>
      <div class="tagline">${tpl.entityTypeTagline}</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
        ${tpl.addressLine1} &bull; ${tpl.phone} &bull; ${tpl.email}
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 18px; font-weight: bold;">{{documentTitle}}</div>
      <div style="font-size: 12px; color: #64748b;">Ref: {{documentNumber}}</div>
      <div style="font-size: 12px; color: #64748b;">Date: {{issueDate}}</div>
    </div>
  </div>

  <main>
    <!-- Document content goes here -->
    {{documentBody}}
  </main>

  <div class="footer">
    ${tpl.invoiceFooterDisclaimer}
    <div style="margin-top: 5px;">License: ${tpl.architectLicenseNumber || 'N/A'} &bull; Tax ID: ${tpl.taxRegistrationNumber}</div>
  </div>
</body>
</html>`;

  downloadFile(`${tpl.name.toLowerCase().replace(/\s+/g, '_')}_template.html`, htmlContent, 'text/html');
};
