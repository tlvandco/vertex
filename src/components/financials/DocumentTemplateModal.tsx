import React, { useState, useId } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentTemplate, TemplateHeaderStyle, WatermarkType, WatermarkPlacement } from '../../types';
import { DEFAULT_TEMPLATES } from '../../data/defaultTemplates';
import {
  X,
  Sliders,
  Building2,
  FileText,
  Stamp,
  Palette,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Copy,
  Printer,
  Eye,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Receipt,
  FileCheck2,
  HelpCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import {
  generateInvoiceHtml,
  generatePOSThermalSlipHtml,
  generateLegalDocHtml,
  printDocumentHtml,
  downloadInvoicePdf,
  downloadPOSThermalSlipPdf,
  downloadLegalDocPdf,
  downloadHtmlTemplateCode,
  downloadFile
} from '../../utils/printAndExport';

interface DocumentTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentTemplateModal: React.FC<DocumentTemplateModalProps> = ({ isOpen, onClose }) => {
  const {
    documentTemplates,
    activeTemplateId,
    activeDocumentTemplate,
    addDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
    setActiveDocumentTemplate,
    resetTemplatesToDefault,
    importDocumentTemplate,
    invoices,
    posTransactions,
    legalDocuments,
    currentUser,
    addToast
  } = useApp();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(activeTemplateId);
  const [activeTab, setActiveTab] = useState<'presets' | 'branding' | 'watermark' | 'legal' | 'opensource'>('branding');
  const [previewDocType, setPreviewDocType] = useState<'invoice' | 'pos' | 'legal'>('invoice');

  const fileInputId = useId();
  const jsonImportInputId = useId();
  const watermarkFileInputId = useId();

  if (!isOpen) return null;

  if (currentUser.role === 'CLIENT' || currentUser.role === 'SITE_ENGINEER') {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-red-200 animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-mono uppercase font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            IAM Role Policy Isolation
          </span>
          <h3 className="text-xl font-serif font-bold text-[#2C2416]">Template Studio Restricted</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Document statements, watermark controls, and company branding templates are strictly restricted to Company Administrators and Financial Controllers. Client and field trade accounts are not authorized to alter official templates.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#2C2416] text-[#D4AF37] font-bold text-xs rounded-xl hover:bg-black cursor-pointer shadow-md transition-all"
          >
            Close &amp; Return
          </button>
        </div>
      </div>
    );
  }

  // The template currently selected for editing
  const editingTemplate: DocumentTemplate =
    documentTemplates.find(t => t.id === selectedTemplateId) || activeDocumentTemplate || DEFAULT_TEMPLATES[0];

  const handleUpdate = (updates: Partial<DocumentTemplate>) => {
    updateDocumentTemplate(editingTemplate.id, updates);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('error', 'Logo file size exceeds 2MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      handleUpdate({ logoUrl: result });
      addToast('success', 'Custom company logo uploaded successfully.');
    };
    reader.readAsDataURL(file);
  };

  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      handleUpdate({ watermarkImageUrl: result, watermarkType: 'image' });
      addToast('success', 'Custom watermark stamp image uploaded.');
    };
    reader.readAsDataURL(file);
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.companyName && !parsed.name) {
          throw new Error('Invalid template format: missing company name');
        }
        const created = importDocumentTemplate(parsed);
        setSelectedTemplateId(created.id);
      } catch (err: any) {
        addToast('error', `Failed to import template JSON: ${err.message || 'Invalid format'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(editingTemplate, null, 2);
    downloadFile(
      `${editingTemplate.companyName.toLowerCase().replace(/\s+/g, '_')}_document_template.json`,
      dataStr,
      'application/json'
    );
    addToast('success', `Exported "${editingTemplate.name}" configuration as JSON.`);
  };

  const handleDuplicateTemplate = () => {
    const duplicated = addDocumentTemplate({
      ...editingTemplate,
      name: `${editingTemplate.name} (Copy)`,
      isDefault: false,
      isOpenSourcePreset: false
    });
    setSelectedTemplateId(duplicated.id);
  };

  const sampleInvoice = invoices[0] || {
    id: 'inv_demo',
    invoiceNumber: 'INV-2026-904',
    projectId: 'p1',
    projectName: 'Bel-Air Modernist Estate',
    clientId: 'u4',
    clientName: 'Sovereign Heritage Holdings LLC',
    clientEmail: 'estates@sovereign-holdings.com',
    amount: 185000,
    tax: 14800,
    total: 199800,
    issueDate: '2026-09-01',
    dueDate: '2026-09-15',
    status: 'PENDING' as const,
    items: [
      { id: '1', description: 'Phase 2: Cantilever Structural Engineering & PE Review', quantity: 1, unitPrice: 120000, total: 120000 },
      { id: '2', description: 'Custom Murano Glass Chandelier Lot Procurement', quantity: 2, unitPrice: 32500, total: 65000 }
    ]
  };

  const samplePOS = posTransactions[0] || {
    id: 'pos_demo',
    transactionNumber: 'TXN-2026-00481',
    projectId: 'p1',
    projectName: 'Bel-Air Modernist Estate',
    clientId: 'u4',
    clientName: 'Victoria Crown Fiduciary',
    cashierName: 'Alexander Wright',
    cashierRole: 'ADMIN',
    terminalId: 'TER-BEVERLY-01 (WisePOS E Terminal)',
    items: [
      { id: 'i1', description: 'Acoustic Ceiling Oak Panel Mockup', category: 'Procurement Sample', quantity: 1, unitPrice: 4200, total: 4200 },
      { id: 'i2', description: 'Municipal Heritage Filing Retainer', category: 'Municipal Filing', quantity: 1, unitPrice: 2800, total: 2800 }
    ],
    subtotal: 7000,
    tax: 560,
    contingencyFee: 350,
    total: 7910,
    paymentMethod: 'CARD_CHIP' as const,
    cardLastFour: '8910',
    authCode: 'AUTH-948102',
    receiptHash: 'SHA256:4b9a81e7d62f01ac29f829871182319b9812a8149814c810981b94871',
    timestamp: '2026-09-01 14:32:00',
    status: 'SETTLED' as const
  };

  const sampleLegalDoc = legalDocuments[0] || {
    id: 'doc_demo',
    documentNumber: 'AIA-B101-2026-001',
    title: 'Standard Form of Agreement Between Owner and Architect (AIA B101)',
    category: 'CONTRACT' as const,
    projectId: 'p1',
    projectName: 'Bel-Air Modernist Estate',
    clientId: 'u4',
    clientName: 'Victoria Crown Fiduciary',
    companyName: 'Crown & Associates Holdings LLC',
    effectiveDate: '2026-09-01',
    status: 'SIGNED_SEALED' as const,
    content: `AGREEMENT made as of the First day of September in the year 2026.\n\nBETWEEN the Architect and the Owner for luxury architectural services, structural design, and procurement management.\n\n1. SCOPE OF ARCHITECT'S BASIC SERVICES\nThe Architect's Basic Services consist of schematic design, design development, construction documents, procurement bidding, and administration of the construction contract.\n\n2. COPYRIGHT & INSTRUMENTS OF SERVICE\nDrawings, specifications, and other documents prepared by the Architect are Instruments of Service for use solely with respect to this Project.\n\n3. ESCROW DISBURSEMENTS & CLAIMS\nProgress payments are deposited in secure escrow accounts and released upon bilateral architect certificate validation.`,
    signers: [
      { id: 's1', name: 'Alexander Wright, AIA', email: 'architect@studio.com', role: 'Principal Architect of Record', hasSigned: true, signedAt: '2026-09-01 09:30:00' },
      { id: 's2', name: 'Victoria Crown', email: 'victoria@crown-holdings.com', role: 'Owner / Client Principal', hasSigned: true, signedAt: '2026-09-01 11:15:00' }
    ],
    signatureCertificate: {
      signedByName: 'Victoria Crown',
      signedByRole: 'Owner Principal Signatory',
      signedAt: '2026-09-01 11:15:00',
      cryptoHash: 'SHA256:9f8a8109d721ab89104fa2891b0091823901b89',
      ipAddress: '198.51.100.84',
      certificateId: 'CERT-AIA-B101-99820'
    }
  };

  const handlePrintTestPreview = () => {
    if (previewDocType === 'invoice') {
      printDocumentHtml(`Invoice Preview - ${editingTemplate.companyName}`, generateInvoiceHtml(sampleInvoice, editingTemplate));
    } else if (previewDocType === 'pos') {
      printDocumentHtml(`POS Slip Preview - ${editingTemplate.companyName}`, generatePOSThermalSlipHtml(samplePOS, editingTemplate));
    } else {
      printDocumentHtml(`Legal Doc Preview - ${editingTemplate.companyName}`, generateLegalDocHtml(sampleLegalDoc, editingTemplate));
    }
  };

  const handleDownloadTestPdf = () => {
    if (previewDocType === 'invoice') {
      downloadInvoicePdf(sampleInvoice, editingTemplate);
    } else if (previewDocType === 'pos') {
      downloadPOSThermalSlipPdf(samplePOS, editingTemplate);
    } else {
      downloadLegalDocPdf(sampleLegalDoc, editingTemplate);
    }
    addToast('success', `Generated vector PDF with "${editingTemplate.name}" branding.`);
  };

  // Color Swatches
  const colorPresets = [
    { name: 'Heritage Charcoal', primary: '#2C2416', accent: '#D4AF37' },
    { name: 'Architectural Slate', primary: '#1e293b', accent: '#0284c7' },
    { name: 'Modern Obsidian', primary: '#0f172a', accent: '#3b82f6' },
    { name: 'Nordic Zinc', primary: '#18181b', accent: '#71717a' },
    { name: 'Titan Bronze', primary: '#1c1917', accent: '#f97316' },
    { name: 'Crown Sovereign', primary: '#0a192f', accent: '#eab308' },
    { name: 'Emerald Forest', primary: '#064e3b', accent: '#10b981' }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overscroll-contain">
      <div className="bg-white rounded-3xl w-full max-w-7xl h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Pinned Studio Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-wide text-amber-400">
                Document &amp; Statement Template Studio
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Open-Source Extensible
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize company legal entities, logos, watermark text/opacity, and disclaimers across all statements &amp; PDFs.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Template Selector dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Editing:</span>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="bg-transparent text-xs text-amber-300 font-bold outline-none cursor-pointer pr-2"
              >
                {documentTemplates.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.name} {t.id === activeTemplateId ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplateId !== activeTemplateId && (
              <button
                type="button"
                onClick={() => setActiveDocumentTemplate(selectedTemplateId)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                title="Make this template the active platform-wide default"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Set as Active</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1 text-sm font-bold"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'branding'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Company &amp; Logo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('watermark')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'watermark'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>Watermark &amp; Opacity</span>
              {editingTemplate.showWatermark && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('legal')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'legal'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Legal, Disclaimers &amp; Wire</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Presets Gallery ({documentTemplates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('opensource')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'opensource'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open-Source &amp; Import/Export</span>
            </button>
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDuplicateTemplate}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
              title="Duplicate this template"
            >
              <Copy className="w-3 h-3 text-slate-500" />
              <span>Duplicate</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
              title="Export template as JSON"
            >
              <Download className="w-3 h-3 text-slate-500" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Split View Content: Left Controls, Right Real-Time Document Preview */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: CUSTOMIZATION CONTROLS */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 border-r border-slate-200 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
            
            {/* TAB: BRANDING & COMPANY */}
            {activeTab === 'branding' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Company Identity &amp; Letterhead
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This completely replaces the default platform name and entity on invoices, POS slips, and agreements.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Brand / Header Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTemplate.companyName}
                    onChange={(e) => handleUpdate({ companyName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none font-bold text-slate-900 focus:border-amber-500"
                    placeholder="e.g. APEX ARCHITECTURE GROUP"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Registered Legal Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTemplate.legalEntityName}
                    onChange={(e) => handleUpdate({ legalEntityName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none text-slate-800 focus:border-amber-500"
                    placeholder="e.g. Apex Architecture & Environmental Engineering LLC"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tagline / Subtitle (Letterhead)
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.entityTypeTagline}
                    onChange={(e) => handleUpdate({ entityTypeTagline: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none text-slate-800 focus:border-amber-500"
                    placeholder="e.g. Licensed Architects, Structural Planners & Master Builders"
                  />
                </div>

                {/* Logo Upload Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Company Logo (Upload or Monogram)
                  </label>
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60 flex flex-col items-center justify-center text-center">
                    {editingTemplate.logoUrl ? (
                      <div className="space-y-2 w-full flex flex-col items-center">
                        <img
                          src={editingTemplate.logoUrl}
                          alt="Company Logo Preview"
                          className="max-h-16 max-w-full object-contain p-2 bg-white rounded-xl border border-slate-200 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdate({ logoUrl: undefined })}
                          className="text-[11px] text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                        >
                          Remove Logo &amp; Use Monogram Text
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto font-bold text-sm">
                          {editingTemplate.logoTextMonogram || editingTemplate.companyName.substring(0, 3).toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-600 font-medium">
                          Upload Custom Logo File (PNG, SVG, JPG, WebP)
                        </div>
                        <input
                          id={fileInputId}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor={fileInputId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Logo Image</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary & Accent Color Theme */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Brand Color Palette &amp; Theme Presets
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Primary Color
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editingTemplate.primaryColor}
                          onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                        />
                        <input
                          type="text"
                          value={editingTemplate.primaryColor}
                          onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                          className="w-full px-2 py-1 text-xs font-mono uppercase border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Accent Color
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editingTemplate.accentColor}
                          onChange={(e) => handleUpdate({ accentColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                        />
                        <input
                          type="text"
                          value={editingTemplate.accentColor}
                          onChange={(e) => handleUpdate({ accentColor: e.target.value })}
                          className="w-full px-2 py-1 text-xs font-mono uppercase border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Swatches */}
                  <div className="flex flex-wrap gap-1.5">
                    {colorPresets.map((swatch, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUpdate({ primaryColor: swatch.primary, accentColor: swatch.accent })}
                        className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-[10px] font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: swatch.primary }}></span>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: swatch.accent }}></span>
                        <span>{swatch.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Header Style & Typography */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Header Layout Style
                    </label>
                    <select
                      value={editingTemplate.headerStyle}
                      onChange={(e) => handleUpdate({ headerStyle: e.target.value as TemplateHeaderStyle })}
                      className="w-full p-2 text-xs border border-slate-300 rounded-xl bg-white font-medium outline-none"
                    >
                      <option value="classic">Classic Sovereign</option>
                      <option value="modern">Modern Contemporary</option>
                      <option value="minimal">Minimal Scandinavian</option>
                      <option value="aia_standard">AIA Standard Official</option>
                      <option value="industrial">Industrial Contractor</option>
                      <option value="luxury_atelier">Luxury Atelier</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Typography Family
                    </label>
                    <select
                      value={editingTemplate.fontFamily}
                      onChange={(e) => handleUpdate({ fontFamily: e.target.value as any })}
                      className="w-full p-2 text-xs border border-slate-300 rounded-xl bg-white font-medium outline-none"
                    >
                      <option value="serif">Serif (Playfair / Georgia)</option>
                      <option value="sans">Clean Sans-Serif (System)</option>
                      <option value="mono">Technical Monospace</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: WATERMARK STUDIO */}
            {activeTab === 'watermark' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-slate-900">
                      Document Watermark &amp; Security Stamp
                    </h3>
                    {/* Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-semibold text-slate-700">
                        {editingTemplate.showWatermark ? 'Enabled' : 'Disabled'}
                      </span>
                      <input
                        type="checkbox"
                        checked={editingTemplate.showWatermark}
                        onChange={(e) => handleUpdate({ showWatermark: e.target.checked })}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Control or completely replace the document watermark. Any company can set their own watermark text or stamp, adjust opacity, angle, or turn it off completely.
                  </p>
                </div>

                {editingTemplate.showWatermark ? (
                  <>
                    {/* Watermark Type Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Watermark Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdate({ watermarkType: 'text' })}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-semibold text-xs ${
                            editingTemplate.watermarkType === 'text'
                              ? 'border-amber-500 bg-amber-50/70 text-slate-950 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          Custom Text Watermark
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdate({ watermarkType: 'image' })}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-semibold text-xs ${
                            editingTemplate.watermarkType === 'image'
                              ? 'border-amber-500 bg-amber-50/70 text-slate-950 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          Custom Seal / Image Stamp
                        </button>
                      </div>
                    </div>

                    {editingTemplate.watermarkType === 'text' ? (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Watermark Text *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingTemplate.watermarkText}
                          onChange={(e) => handleUpdate({ watermarkText: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none font-mono uppercase font-bold text-slate-900 focus:border-amber-500"
                          placeholder="e.g. OFFICIAL AUDIT COPY • CONFIDENTIAL"
                        />
                        <div className="flex flex-wrap gap-1 mt-2">
                          {[
                            'CONFIDENTIAL & PROPRIETARY',
                            'OFFICIAL AUDIT COPY',
                            'CLIENT ESCROW RECORD',
                            'PRE-CONSTRUCTION DRAFT',
                            'CERTIFIED ARCHITECTURAL SPEC'
                          ].map((quickText, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleUpdate({ watermarkText: quickText })}
                              className="text-[9px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer transition-colors"
                            >
                              + {quickText}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Watermark Stamp Image (Official Seal)
                        </label>
                        <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60 flex flex-col items-center justify-center text-center">
                          {editingTemplate.watermarkImageUrl ? (
                            <div className="space-y-2 flex flex-col items-center">
                              <img
                                src={editingTemplate.watermarkImageUrl}
                                alt="Watermark Stamp Preview"
                                className="max-h-24 max-w-full object-contain p-2 bg-white rounded-xl border border-slate-200 shadow-2xs"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdate({ watermarkImageUrl: undefined, watermarkType: 'text' })}
                                className="text-[11px] text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                              >
                                Remove Watermark Image &amp; Revert to Text
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Stamp className="w-8 h-8 text-amber-600 mx-auto" />
                              <div className="text-xs text-slate-600 font-medium">
                                Upload Counterparty Architectural Stamp or State Seal
                              </div>
                              <input
                                id={watermarkFileInputId}
                                type="file"
                                accept="image/*"
                                onChange={handleWatermarkImageUpload}
                                className="hidden"
                              />
                              <label
                                htmlFor={watermarkFileInputId}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Choose Stamp File</span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Opacity Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Watermark Opacity: {Math.round(editingTemplate.watermarkOpacity * 100)}%
                        </label>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {editingTemplate.watermarkOpacity <= 0.05
                            ? 'Faint / Subtle'
                            : editingTemplate.watermarkOpacity <= 0.15
                            ? 'Standard'
                            : 'Prominent / Bold'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.02"
                        max="0.35"
                        step="0.01"
                        value={editingTemplate.watermarkOpacity}
                        onChange={(e) => handleUpdate({ watermarkOpacity: parseFloat(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                        <span>2% (Ultra-Faint)</span>
                        <span>15% (Balanced)</span>
                        <span>35% (High Contrast)</span>
                      </div>
                    </div>

                    {/* Rotation Angle */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Rotation Angle: {editingTemplate.watermarkAngle}&deg;
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="-60"
                          max="60"
                          step="5"
                          value={editingTemplate.watermarkAngle}
                          onChange={(e) => handleUpdate({ watermarkAngle: parseInt(e.target.value, 10) })}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                        <span className="font-mono text-xs w-10 text-right text-slate-700">
                          {editingTemplate.watermarkAngle}&deg;
                        </span>
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        {[-45, -30, -15, 0, 15, 30, 45].map((deg) => (
                          <button
                            key={deg}
                            type="button"
                            onClick={() => handleUpdate({ watermarkAngle: deg })}
                            className={`flex-1 py-1 text-[10px] rounded-lg border font-mono font-semibold cursor-pointer transition-colors ${
                              editingTemplate.watermarkAngle === deg
                                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {deg}&deg;
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Watermark Placement */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Watermark Placement
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdate({ watermarkPlacement: 'center' })}
                          className={`p-2 rounded-xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                            editingTemplate.watermarkPlacement === 'center'
                              ? 'border-amber-500 bg-amber-50 text-slate-950 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Center Diagonal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdate({ watermarkPlacement: 'bottom_seal' })}
                          className={`p-2 rounded-xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                            editingTemplate.watermarkPlacement === 'bottom_seal'
                              ? 'border-amber-500 bg-amber-50 text-slate-950 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Bottom Document Seal
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                    <Stamp className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      Watermark is completely disabled
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      All generated invoices, statement prints, and PDF exports will be clean without background watermarks.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleUpdate({ showWatermark: true, watermarkType: 'text' })}
                      className="px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-xs hover:bg-amber-400 cursor-pointer"
                    >
                      Enable Custom Watermark
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: LEGAL & DISCLAIMERS */}
            {activeTab === 'legal' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Contact, Registration &amp; Disclaimers
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure official contact information, tax identification, and custom legal covenants for statement footers.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.addressLine1}
                      onChange={(e) => handleUpdate({ addressLine1: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City, State &amp; Zip
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.addressLine2 || ''}
                      onChange={(e) => handleUpdate({ addressLine2: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.phone}
                      onChange={(e) => handleUpdate({ phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Billing Email
                    </label>
                    <input
                      type="email"
                      value={editingTemplate.email}
                      onChange={(e) => handleUpdate({ email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tax Registration / EIN #
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.taxRegistrationNumber}
                      onChange={(e) => handleUpdate({ taxRegistrationNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Architect / Contractor License #
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.architectLicenseNumber || ''}
                      onChange={(e) => handleUpdate({ architectLicenseNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Direct Wire / Escrow Routing Instructions
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.invoiceWireInstructions || ''}
                    onChange={(e) => handleUpdate({ invoiceWireInstructions: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none font-mono"
                    placeholder="e.g. JPMorgan Chase Bank • Routing: 122000496 • Acct: 8940-1928"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custom Invoice Statement Footer Disclaimer
                  </label>
                  <textarea
                    rows={2}
                    value={editingTemplate.invoiceFooterDisclaimer}
                    onChange={(e) => handleUpdate({ invoiceFooterDisclaimer: e.target.value })}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none leading-relaxed resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cryptographic Seal Title
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.sealTitle}
                    onChange={(e) => handleUpdate({ sealTitle: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none font-bold uppercase font-mono"
                    placeholder="e.g. APEX ARCHITECTURAL AUDIT SEAL"
                  />
                </div>
              </div>
            )}

            {/* TAB: PRESETS GALLERY */}
            {activeTab === 'presets' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base text-slate-900">
                      Open-Source Presets &amp; Templates
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select any preset as a foundation or switch your active platform template.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const created = addDocumentTemplate({
                        ...DEFAULT_TEMPLATES[0],
                        name: `Custom Template #${documentTemplates.length + 1}`,
                        companyName: 'YOUR FIRM NAME',
                        isDefault: false,
                        isOpenSourcePreset: false
                      });
                      setSelectedTemplateId(created.id);
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Blank</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {documentTemplates.map((t) => {
                    const isSelected = t.id === selectedTemplateId;
                    const isActive = t.id === activeTemplateId;

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTemplateId(t.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-400'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-4 h-4 rounded-full shrink-0 border border-black/10"
                              style={{ backgroundColor: t.primaryColor }}
                            ></span>
                            <div>
                              <h4 className="font-serif font-bold text-xs text-slate-900 flex items-center gap-2">
                                <span>{t.name}</span>
                                {isActive && (
                                  <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                                    Active Platform Default
                                  </span>
                                )}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {t.description || `${t.companyName} &bull; ${t.entityTypeTagline}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {!isActive && (
                              <button
                                type="button"
                                onClick={() => setActiveDocumentTemplate(t.id)}
                                className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-lg transition-colors cursor-pointer"
                              >
                                Activate
                              </button>
                            )}
                            {documentTemplates.length > 1 && !t.isOpenSourcePreset && (
                              <button
                                type="button"
                                onClick={() => deleteDocumentTemplate(t.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-md cursor-pointer"
                                title="Delete Template"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Watermark: {t.showWatermark ? `"${t.watermarkText}" (${Math.round(t.watermarkOpacity * 100)}%)` : 'Disabled'}</span>
                          <span>Style: {t.headerStyle}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={resetTemplatesToDefault}
                    className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset All Templates to Factory Defaults</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: OPEN-SOURCE & IMPORT/EXPORT */}
            {activeTab === 'opensource' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Open-Source Portability &amp; Template Files
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Share your document templates with other organizations, backup configurations, or export standalone HTML files.
                  </p>
                </div>

                {/* Import Box */}
                <div className="p-5 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/70 text-center space-y-3">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Import Existing Template (JSON)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload any exported template JSON file from another company or legal department.
                    </p>
                  </div>
                  <input
                    id={jsonImportInputId}
                    type="file"
                    accept=".json"
                    onChange={handleJsonImport}
                    className="hidden"
                  />
                  <label
                    htmlFor={jsonImportInputId}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select JSON Template File</span>
                  </label>
                </div>

                {/* Export Standalone HTML */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <h4 className="text-xs font-bold text-slate-900">Download Print-Ready HTML File</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Download an open-source, self-contained HTML file containing your active template's styles, header, custom watermark, and disclaimers. Ready to embed or print with custom variables.
                  </p>
                  <button
                    type="button"
                    onClick={() => downloadHtmlTemplateCode(editingTemplate)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Standalone HTML Template</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: REAL-TIME INTERACTIVE DOCUMENT PREVIEW */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col bg-slate-100 overflow-hidden">
            
            {/* Preview Document Switcher & Print Test bar */}
            <div className="px-5 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDocType('invoice')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewDocType === 'invoice'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Invoice Statement
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDocType('pos')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewDocType === 'pos'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  POS Thermal Slip
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDocType('legal')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewDocType === 'legal'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AIA Legal Instrument
                </button>
              </div>

              {/* Print & PDF Test Action */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrintTestPreview}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Test browser print dialog with active template"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Test Print</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTestPdf}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  title="Generate vector PDF using jsPDF with current styling"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Test PDF Download</span>
                </button>
              </div>
            </div>

            {/* Live Document Preview Canvas (Scrollable sheet simulation) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar flex justify-center">
              <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-slate-200 min-h-[600px] relative overflow-hidden transition-all duration-150">
                
                {/* Visual Watermark Overlay on Preview */}
                {editingTemplate.showWatermark && editingTemplate.watermarkType !== 'none' && (
                  <div
                    className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none"
                    style={{
                      opacity: editingTemplate.watermarkOpacity
                    }}
                  >
                    {editingTemplate.watermarkType === 'image' && editingTemplate.watermarkImageUrl ? (
                      <img
                        src={editingTemplate.watermarkImageUrl}
                        alt="Watermark"
                        className="max-w-[280px] max-h-[280px] object-contain"
                        style={{
                          transform: `rotate(${editingTemplate.watermarkAngle}deg)`
                        }}
                      />
                    ) : (
                      <div
                        className="text-center font-black tracking-widest uppercase whitespace-nowrap text-3xl sm:text-4xl"
                        style={{
                          color: editingTemplate.primaryColor,
                          transform: `rotate(${editingTemplate.watermarkAngle}deg)`
                        }}
                      >
                        {editingTemplate.watermarkText || editingTemplate.companyName}
                      </div>
                    )}
                  </div>
                )}

                {/* Content Z-index Layer */}
                <div className="relative z-10">
                  {/* INVOICE PREVIEW */}
                  {previewDocType === 'invoice' && (
                    <div className="space-y-6 text-xs text-slate-800">
                      {/* Brand Header */}
                      <div
                        className="flex justify-between items-start pb-5 border-b-2"
                        style={{ borderBottomColor: editingTemplate.primaryColor }}
                      >
                        <div>
                          {editingTemplate.logoUrl ? (
                            <img
                              src={editingTemplate.logoUrl}
                              alt="Brand Logo"
                              className="max-h-12 max-w-[180px] object-contain mb-2"
                            />
                          ) : (
                            <h2
                              className="text-2xl font-bold tracking-wider"
                              style={{
                                color: editingTemplate.primaryColor,
                                fontFamily:
                                  editingTemplate.fontFamily === 'serif'
                                    ? 'Playfair Display, Georgia, serif'
                                    : editingTemplate.fontFamily === 'mono'
                                    ? 'Courier New, monospace'
                                    : 'inherit'
                              }}
                            >
                              {editingTemplate.companyName}
                            </h2>
                          )}
                          <p
                            className="text-[10px] uppercase tracking-widest font-bold mt-0.5"
                            style={{ color: editingTemplate.accentColor }}
                          >
                            {editingTemplate.entityTypeTagline}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {editingTemplate.addressLine1}
                            {editingTemplate.addressLine2 ? ` • ${editingTemplate.addressLine2}` : ''} •{' '}
                            {editingTemplate.phone} • {editingTemplate.email}
                          </p>
                          {editingTemplate.architectLicenseNumber && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              License: {editingTemplate.architectLicenseNumber} • EIN:{' '}
                              {editingTemplate.taxRegistrationNumber}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-slate-900 block">INVOICE STATEMENT</span>
                          <span className="font-mono text-slate-600">{sampleInvoice.invoiceNumber}</span>
                          <p className="text-[11px] text-slate-500 mt-1">Date: {sampleInvoice.issueDate}</p>
                          <p className="text-[11px] text-slate-500">Due: {sampleInvoice.dueDate}</p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                            {sampleInvoice.status}
                          </span>
                        </div>
                      </div>

                      {/* Recipient Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                            Billed To
                          </span>
                          <p className="font-bold text-slate-900">{sampleInvoice.clientName}</p>
                          <p className="text-[11px] text-slate-500">{sampleInvoice.clientEmail}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">
                            Client ID: {sampleInvoice.clientId}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                            Project Estate
                          </span>
                          <p className="font-bold text-slate-900">{sampleInvoice.projectName}</p>
                          <p className="text-[11px] text-slate-500">Project Code: {sampleInvoice.projectId}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">
                            Escrow Ref: ESC-904810
                          </p>
                        </div>
                      </div>

                      {/* Line items table */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-xs">
                          <thead
                            style={{
                              backgroundColor: `${editingTemplate.primaryColor}12`,
                              color: editingTemplate.primaryColor
                            }}
                          >
                            <tr className="border-b border-slate-200 font-bold">
                              <th className="py-2 px-3 text-left">Description / Scope</th>
                              <th className="py-2 px-3 text-center">Qty</th>
                              <th className="py-2 px-3 text-right">Unit Rate</th>
                              <th className="py-2 px-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sampleInvoice.items.map((it, idx) => (
                              <tr key={idx}>
                                <td className="py-2.5 px-3 font-medium">{it.description}</td>
                                <td className="py-2.5 px-3 text-center">{it.quantity}</td>
                                <td className="py-2.5 px-3 text-right">${it.unitPrice.toLocaleString()}</td>
                                <td className="py-2.5 px-3 text-right font-bold">
                                  ${it.total.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals */}
                      <div className="flex justify-end">
                        <div className="w-64 space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>Subtotal:</span>
                            <span>${sampleInvoice.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Procurement Tax (8%):</span>
                            <span>${sampleInvoice.tax.toLocaleString()}</span>
                          </div>
                          <div
                            className="flex justify-between font-bold text-sm pt-2 border-t-2"
                            style={{ borderTopColor: editingTemplate.primaryColor }}
                          >
                            <span>Total Balance Due:</span>
                            <span style={{ color: editingTemplate.accentColor }}>
                              ${sampleInvoice.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Banking Wire Box */}
                      {editingTemplate.invoiceWireInstructions && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px]">
                          <div className="font-bold text-slate-700 uppercase text-[9px] mb-0.5">
                            Banking &amp; Wire Settlement Instructions:
                          </div>
                          <div className="text-slate-600 font-mono">
                            {editingTemplate.invoiceWireInstructions}
                          </div>
                        </div>
                      )}

                      {/* Cryptographic Seal */}
                      <div className="p-3 bg-slate-50/80 border border-dashed border-slate-300 rounded-xl font-mono text-[10px] space-y-1">
                        <p className="font-bold text-slate-900">{editingTemplate.sealTitle}:</p>
                        <p className="truncate text-slate-500">
                          SHA256: 4b9a81e7d62f01ac29f829871182319b9812a8149814c810981b94871
                        </p>
                        <p className="text-slate-400">
                          Issued By: {editingTemplate.legalEntityName} • Authorized Electronic Instrument
                        </p>
                      </div>

                      {/* Footer Disclaimer */}
                      <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 leading-relaxed">
                        {editingTemplate.invoiceFooterDisclaimer}
                        {editingTemplate.watermarkPlacement === 'bottom_seal' && editingTemplate.showWatermark && (
                          <div className="mt-2 font-mono uppercase tracking-widest text-slate-500 font-bold">
                            • OFFICIAL WATERMARK SEAL: {editingTemplate.watermarkText || editingTemplate.companyName} •
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* POS PREVIEW */}
                  {previewDocType === 'pos' && (
                    <div className="max-w-sm mx-auto font-mono text-xs text-slate-900 p-4 border border-dashed border-slate-300 rounded-2xl bg-white space-y-3">
                      <div className="text-center pb-3 border-b border-dashed border-slate-300">
                        <div className="font-bold text-base tracking-wider">{editingTemplate.companyName}</div>
                        <div className="text-[10px] text-slate-600">{editingTemplate.posSlipHeader}</div>
                        <div className="text-[9px] text-slate-400 mt-1">{editingTemplate.addressLine1}</div>
                        <div className="text-[9px] text-slate-400">TEL: {editingTemplate.phone}</div>
                      </div>

                      <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-500">TX NUMBER:</span>
                          <span className="font-bold">{samplePOS.transactionNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">CLIENT:</span>
                          <span>{samplePOS.clientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">ESTATE:</span>
                          <span>{samplePOS.projectName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">PAY METHOD:</span>
                          <span>{samplePOS.paymentMethod} (*{samplePOS.cardLastFour})</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300">
                        {samplePOS.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span>{it.description} (x{it.quantity})</span>
                            <span className="font-bold">${it.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-500">
                          <span>SUBTOTAL:</span>
                          <span>${samplePOS.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>TAX (8%):</span>
                          <span>${samplePOS.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-900">
                          <span>TOTAL SETTLED:</span>
                          <span>${samplePOS.total.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="p-2 border border-slate-300 rounded text-center text-[9px] space-y-0.5">
                        <div className="font-bold">{editingTemplate.sealTitle}</div>
                        <div className="truncate text-slate-500">{samplePOS.receiptHash}</div>
                      </div>

                      <div className="text-center text-[9px] text-slate-400 pt-2">
                        *** {editingTemplate.posSlipFooter} ***<br />
                        ISSUED BY {editingTemplate.legalEntityName.toUpperCase()}
                      </div>
                    </div>
                  )}

                  {/* LEGAL PREVIEW */}
                  {previewDocType === 'legal' && (
                    <div className="space-y-5 text-xs text-slate-800">
                      <div
                        className="flex justify-between items-start pb-4 border-b-2"
                        style={{ borderBottomColor: editingTemplate.primaryColor }}
                      >
                        <div>
                          <h2
                            className="text-xl font-bold"
                            style={{ color: editingTemplate.primaryColor }}
                          >
                            {editingTemplate.companyName}
                          </h2>
                          <p
                            className="text-[10px] uppercase tracking-wider font-bold"
                            style={{ color: editingTemplate.accentColor }}
                          >
                            {editingTemplate.legalDocumentVaultHeader}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-slate-900 block">{sampleLegalDoc.title}</span>
                          <span className="font-mono text-slate-500">{sampleLegalDoc.documentNumber}</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Status: <strong className="text-emerald-700">{sampleLegalDoc.status}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                            Party of First Part (Architect / Discloser)
                          </span>
                          <p className="font-bold text-slate-900">{editingTemplate.legalEntityName}</p>
                          <p className="text-[11px] text-slate-500">{editingTemplate.addressLine1}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">
                            License: {editingTemplate.architectLicenseNumber || 'N/A'} • Tax ID: {editingTemplate.taxRegistrationNumber}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                            Party of Second Part (Recipient / Owner)
                          </span>
                          <p className="font-bold text-slate-900">{sampleLegalDoc.clientName}</p>
                          <p className="text-[11px] text-slate-500">Project: {sampleLegalDoc.projectName}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl font-serif text-[11px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {sampleLegalDoc.content}
                      </div>

                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 font-mono text-[10px] space-y-1">
                        <p className="font-bold">🔐 {editingTemplate.sealTitle}</p>
                        <p className="truncate">Cert ID: {sampleLegalDoc.signatureCertificate?.certificateId}</p>
                        <p className="truncate">Hash: {sampleLegalDoc.signatureCertificate?.cryptoHash}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
                        {editingTemplate.legalDocumentFooterDisclaimer}
                        <div className="mt-1 text-[9px]">
                          Jurisdiction: {editingTemplate.legalDocumentJurisdiction}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom active status bar */}
            <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 font-medium">
                  Active Platform Branding: <strong className="text-slate-900">{activeDocumentTemplate.companyName}</strong> ({activeDocumentTemplate.name})
                </span>
              </div>
              <span className="text-slate-400 text-[11px] font-mono">
                Watermark: {activeDocumentTemplate.showWatermark ? `"${activeDocumentTemplate.watermarkText}" (${Math.round(activeDocumentTemplate.watermarkOpacity * 100)}%)` : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
