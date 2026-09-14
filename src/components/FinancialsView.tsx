import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Invoice, Payment, Expense, POSTransaction, LegalDocument, POSLineItem, LegalDocumentCategory, LegalDocumentStatus, CatalogItem, BudgetLine } from '../types';
import {
  DollarSign,
  FileText,
  CreditCard,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  X,
  TrendingUp,
  Download,
  Filter,
  ShieldCheck,
  FileCheck2,
  PenTool,
  Upload,
  FileUp,
  Building2,
  Sparkles,
  Lock,
  Check,
  Trash2,
  QrCode,
  Receipt,
  Eye,
  RefreshCw,
  Search,
  Tag,
  SlidersHorizontal,
  Layers,
  FolderPlus,
  ArrowRight,
  ChevronDown,
  Zap,
  ShoppingBag,
  Package,
  Layers as LayersIcon
} from 'lucide-react';

export const FinancialsView: React.FC = () => {
  const {
    invoices,
    payments,
    expenses,
    projects,
    posTransactions,
    legalDocuments,
    catalogItems,
    addCatalogItem,
    updateCatalogItem,
    deleteCatalogItem,
    applyCatalogItemToBudget,
    addInvoice,
    recordPayment,
    updateExpenseStatus,
    processPOSTransaction,
    uploadLegalDocument,
    signLegalDocument,
    updateLegalDocumentStatus,
    currentUser,
    users,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'invoices' | 'pos' | 'legal' | 'payments' | 'expenses'>('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPOSTransaction, setSelectedPOSTransaction] = useState<POSTransaction | null>(null);
  const [selectedLegalDoc, setSelectedLegalDoc] = useState<LegalDocument | null>(null);
  const [signingDoc, setSigningDoc] = useState<LegalDocument | null>(null);

  // Role-Based Isolation: Client can only view their own invoices, transactions and paperwork
  const isClient = currentUser.role === 'CLIENT';

  const visibleInvoices = isClient
    ? invoices.filter(
        i =>
          i.clientId === currentUser.id ||
          i.clientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          currentUser.assignedProjectIds?.includes(i.projectId)
      )
    : invoices;

  const visibleInvoiceIds = new Set(visibleInvoices.map(i => i.id));

  const visiblePayments = isClient
    ? payments.filter(p => visibleInvoiceIds.has(p.invoiceId) || currentUser.assignedProjectIds?.includes(p.projectId))
    : payments;

  const visiblePOSTransactions = isClient
    ? posTransactions.filter(
        t =>
          t.clientId === currentUser.id ||
          currentUser.assignedProjectIds?.includes(t.projectId)
      )
    : posTransactions;

  const visibleLegalDocs = isClient
    ? legalDocuments.filter(
        d =>
          d.clientId === currentUser.id ||
          currentUser.assignedProjectIds?.includes(d.projectId) ||
          d.signers.some(s => s.email.toLowerCase() === currentUser.email.toLowerCase())
      )
    : legalDocuments;

  // Expenses are strictly internal company contractor costs: Clients must NEVER see internal expenses
  const visibleExpenses = isClient ? [] : expenses;

  // Accessible projects for billing & POS
  const clientProjects = isClient
    ? projects.filter(
        p =>
          p.clientId === currentUser.id ||
          p.clientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          currentUser.assignedProjectIds?.includes(p.id)
      )
    : projects;

  // Modals state
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [invProjectId, setInvProjectId] = useState(clientProjects[0]?.id || projects[0]?.id || '');
  const [invDesc, setInvDesc] = useState('Design & Architecture Retainer');
  const [invAmount, setInvAmount] = useState(150000);
  const [invDue, setInvDue] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);

  const [isRecordPayOpen, setIsRecordPayOpen] = useState(false);
  const [payInvoiceId, setPayInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('Wire Transfer');
  const [payRef, setPayRef] = useState('');

  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);

  // ----------------------------------------------------
  // CATALOG & TYPE-AHEAD SEARCH STATE
  // ----------------------------------------------------
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>('ALL');
  const [isTypeaheadOpen, setIsTypeaheadOpen] = useState(false);
  const [focusedTypeaheadIndex, setFocusedTypeaheadIndex] = useState(-1);
  const catalogSearchContainerRef = useRef<HTMLDivElement>(null);
  const catalogSearchInputRef = useRef<HTMLInputElement>(null);

  // Add Catalog Item Modal State
  const [isAddCatalogItemOpen, setIsAddCatalogItemOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Procurement Sample');
  const [newItemCustomCategory, setNewItemCustomCategory] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemPrice, setNewItemPrice] = useState<number>(3500);
  const [newItemUnit, setNewItemUnit] = useState('Per Inspection');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemLeadTime, setNewItemLeadTime] = useState('3 Business Days');
  const [newItemTags, setNewItemTags] = useState('');

  // Use / Allocate Catalog Item Modal State
  const [isUseItemModalOpen, setIsUseItemModalOpen] = useState(false);
  const [selectedCatalogItemForUse, setSelectedCatalogItemForUse] = useState<CatalogItem | null>(null);
  const [useDestination, setUseDestination] = useState<'POS' | 'BUDGET' | 'INVOICE'>('POS');
  const [useTargetProjectId, setUseTargetProjectId] = useState(clientProjects[0]?.id || projects[0]?.id || '');
  const [useQuantity, setUseQuantity] = useState(1);
  const [useCustomPrice, setUseCustomPrice] = useState<number | ''>('');
  const [useNotes, setUseNotes] = useState('');

  // Close typeahead dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        catalogSearchContainerRef.current &&
        !catalogSearchContainerRef.current.contains(event.target as Node)
      ) {
        setIsTypeaheadOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic Catalog Categories
  const catalogCategories = useMemo(() => {
    const cats = Array.from(new Set(catalogItems.map(item => item.category)));
    return ['ALL', ...cats];
  }, [catalogItems]);

  // Filtered Catalog Items based on Category & Search
  const filteredCatalogItems = useMemo(() => {
    return catalogItems.filter(item => {
      const matchesCategory = selectedCatalogCategory === 'ALL' || item.category === selectedCatalogCategory;
      if (!matchesCategory) return false;
      if (!catalogSearchQuery.trim()) return true;

      const q = catalogSearchQuery.toLowerCase().trim();
      const inTitle = item.title.toLowerCase().includes(q);
      const inSku = item.sku?.toLowerCase().includes(q);
      const inCat = item.category.toLowerCase().includes(q);
      const inDesc = item.description?.toLowerCase().includes(q);
      const inTags = item.tags?.some(t => t.toLowerCase().includes(q));
      const inPrice = item.price.toString().includes(q);

      return inTitle || inSku || inCat || inDesc || inTags || inPrice;
    });
  }, [catalogItems, selectedCatalogCategory, catalogSearchQuery]);

  // Type-ahead Suggestions list for dropdown
  const typeaheadSuggestions = useMemo(() => {
    if (!catalogSearchQuery.trim()) return [];
    const q = catalogSearchQuery.toLowerCase().trim();
    return catalogItems.filter(item => {
      const inTitle = item.title.toLowerCase().includes(q);
      const inSku = item.sku?.toLowerCase().includes(q);
      const inCat = item.category.toLowerCase().includes(q);
      const inTags = item.tags?.some(t => t.toLowerCase().includes(q));
      const inDesc = item.description?.toLowerCase().includes(q);
      return inTitle || inSku || inCat || inTags || inDesc;
    }).slice(0, 5);
  }, [catalogItems, catalogSearchQuery]);

  // Highlight matching text helper
  const renderHighlightedText = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    const q = query.trim();
    const index = text.toLowerCase().indexOf(q.toLowerCase());
    if (index === -1) return text;
    const before = text.substring(0, index);
    const match = text.substring(index, index + q.length);
    const after = text.substring(index + q.length);
    return (
      <span>
        {before}
        <span className="bg-amber-200 text-amber-950 font-bold px-0.5 rounded-xs">{match}</span>
        {after}
      </span>
    );
  };

  // ----------------------------------------------------
  // POS REGISTER STATE
  // ----------------------------------------------------
  const [posProjectId, setPosProjectId] = useState(clientProjects[0]?.id || projects[0]?.id || '');
  const [posCart, setPosCart] = useState<POSLineItem[]>([
    { id: 'item_1', description: 'Calacatta Gold Quarry Inspection Pass', category: 'Procurement Sample', quantity: 1, unitPrice: 4500, total: 4500 },
    { id: 'item_2', description: 'VR Spatial Walkthrough Session (4K Render)', category: 'Design Technology', quantity: 1, unitPrice: 3200, total: 3200 }
  ]);
  const [posPaymentMethod, setPosPaymentMethod] = useState<POSTransaction['paymentMethod']>('CARD_TAP');
  const [posContingencyRate, setPosContingencyRate] = useState<number>(0.05); // 5%
  const [posCustomDesc, setPosCustomDesc] = useState('');
  const [posCustomPrice, setPosCustomPrice] = useState<number>(1000);
  const [posCustomCat, setPosCustomCat] = useState('Custom Service');
  const [posProcessing, setPosProcessing] = useState(false);
  const [posCardLastFour, setPosCardLastFour] = useState('8832');

  const handleAddToCart = (preset: { title: string; category: string; price: number; id?: string; sku?: string }) => {
    const existing = posCart.find(i => i.description === preset.title || (preset.id && i.catalogItemId === preset.id));
    if (existing) {
      setPosCart(posCart.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice } : i));
    } else {
      setPosCart([
        ...posCart,
        {
          id: 'pos_it_' + Date.now() + Math.random().toString(36).substring(2, 5),
          description: preset.title,
          category: preset.category,
          quantity: 1,
          unitPrice: preset.price,
          total: preset.price,
          catalogItemId: preset.id
        }
      ]);
    }
    addToast('success', `Added "${preset.title}" to active POS register`);
  };

  const handleCreateCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || newItemPrice <= 0) {
      addToast('error', 'Please provide a valid title and price');
      return;
    }

    const finalCategory = newItemCategory === 'CUSTOM' ? (newItemCustomCategory.trim() || 'Custom Specification') : newItemCategory;
    const tagsArr = newItemTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const created = addCatalogItem({
      title: newItemTitle.trim(),
      category: finalCategory,
      sku: newItemSku.trim(),
      price: Number(newItemPrice),
      unit: newItemUnit.trim() || 'Fixed Fee',
      description: newItemDescription.trim() || 'Bespoke architectural procurement specification.',
      leadTime: newItemLeadTime.trim() || '3-5 Business Days',
      tags: tagsArr.length > 0 ? tagsArr : [finalCategory, 'Custom']
    });

    setIsAddCatalogItemOpen(false);
    setNewItemTitle('');
    setNewItemSku('');
    setNewItemPrice(3500);
    setNewItemDescription('');
    setNewItemTags('');
    setNewItemCustomCategory('');

    // Pre-filter to show newly created item
    setCatalogSearchQuery(created.title);
    setIsTypeaheadOpen(false);
  };

  const handleOpenUseItemModal = (item: CatalogItem, defaultDest: 'POS' | 'BUDGET' | 'INVOICE' = 'POS') => {
    setSelectedCatalogItemForUse(item);
    setUseDestination(defaultDest);
    setUseTargetProjectId(posProjectId || clientProjects[0]?.id || projects[0]?.id || '');
    setUseQuantity(1);
    setUseCustomPrice(item.price);
    setUseNotes('');
    setIsUseItemModalOpen(true);
  };

  const handleUseCatalogItemConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatalogItemForUse) return;

    const item = selectedCatalogItemForUse;
    const qty = useQuantity > 0 ? useQuantity : 1;
    const unitP = typeof useCustomPrice === 'number' && useCustomPrice > 0 ? useCustomPrice : item.price;
    const totalP = unitP * qty;

    if (useDestination === 'POS') {
      const existing = posCart.find(i => i.description === item.title || i.catalogItemId === item.id);
      if (existing) {
        setPosCart(posCart.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + qty, total: (i.quantity + qty) * i.unitPrice } : i));
      } else {
        setPosCart([
          ...posCart,
          {
            id: 'pos_it_' + Date.now() + Math.random().toString(36).substring(2, 5),
            description: item.title,
            category: item.category,
            quantity: qty,
            unitPrice: unitP,
            total: totalP,
            catalogItemId: item.id
          }
        ]);
      }
      addToast('success', `Added ${qty}x "${item.title}" to active POS register`);
    } else if (useDestination === 'BUDGET') {
      applyCatalogItemToBudget(item.id, useTargetProjectId, {
        customPrice: totalP,
        customQuantity: qty,
        notes: useNotes.trim() || `Allocated from Architectural Catalog [${item.sku}]. Lead time: ${item.leadTime}.`
      });
    } else if (useDestination === 'INVOICE') {
      const targetProj = projects.find(p => p.id === useTargetProjectId) || projects[0];
      addInvoice({
        projectId: targetProj.id,
        projectName: targetProj.name,
        clientId: targetProj.clientId || 'client_direct',
        clientName: targetProj.clientName || 'Client Representative',
        clientEmail: targetProj.clientEmail || 'client@firm.com',
        notes: `${item.title} (${qty}x ${item.unit || 'Unit'}) - ${useNotes.trim() || item.description || 'Architectural Specification'}`,
        amount: totalP,
        tax: Math.round(totalP * 0.08),
        total: Math.round(totalP * 1.08),
        status: 'PENDING',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        items: [
          {
            description: `${item.title} [${item.sku}]`,
            quantity: qty,
            unitPrice: unitP,
            total: totalP
          }
        ]
      });
      addToast('success', `Drafted invoice for "${item.title}" ($${Math.round(totalP * 1.08).toLocaleString()})`);
    }

    setIsUseItemModalOpen(false);
    setSelectedCatalogItemForUse(null);
  };

  const handleAddCustomLineItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posCustomDesc.trim() || posCustomPrice <= 0) return;
    setPosCart([
      ...posCart,
      {
        id: 'pos_it_' + Date.now(),
        description: posCustomDesc.trim(),
        category: posCustomCat,
        quantity: 1,
        unitPrice: Number(posCustomPrice),
        total: Number(posCustomPrice)
      }
    ]);
    setPosCustomDesc('');
    setPosCustomPrice(1000);
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setPosCart(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty, total: nextQty * item.unitPrice } : null;
          }
          return item;
        })
        .filter(Boolean) as POSLineItem[]
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setPosCart(posCart.filter(i => i.id !== id));
  };

  const posSubtotal = posCart.reduce((sum, i) => sum + i.total, 0);
  const posTax = Math.round(posSubtotal * 0.08); // 8% sales/procurement tax
  const posContingency = Math.round(posSubtotal * posContingencyRate);
  const posTotal = posSubtotal + posTax + posContingency;

  const handleProcessCheckout = () => {
    if (posCart.length === 0) {
      addToast('error', 'Cart is empty. Select items from the catalog.');
      return;
    }

    const selectedProj = projects.find(p => p.id === posProjectId) || projects[0];
    setPosProcessing(true);

    setTimeout(() => {
      const tx = processPOSTransaction({
        projectId: selectedProj.id,
        projectName: selectedProj.name,
        clientId: selectedProj.clientId,
        clientName: selectedProj.clientName,
        cashierName: currentUser.name,
        cashierRole: currentUser.role,
        terminalId: 'TER-BEVERLY-01 (Stripe WisePOS E Terminal)',
        items: posCart,
        subtotal: posSubtotal,
        tax: posTax,
        contingencyFee: posContingency,
        total: posTotal,
        paymentMethod: posPaymentMethod,
        cardLastFour: posPaymentMethod === 'CARD_TAP' || posPaymentMethod === 'CARD_CHIP' || posPaymentMethod === 'CARD_ON_FILE' ? posCardLastFour : undefined,
        authCode: 'AUTH-' + Math.floor(100000 + Math.random() * 900000),
        status: 'SETTLED',
        notes: `Direct architectural POS settlement for ${selectedProj.name}`
      });

      setPosProcessing(false);
      setPosCart([]);
      setSelectedPOSTransaction(tx);
    }, 1200);
  };

  // ----------------------------------------------------
  // LEGAL PAPERWORK UPLOAD FORM STATE
  // ----------------------------------------------------
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<LegalDocumentCategory>('CONTRACT');
  const [docProjectId, setDocProjectId] = useState(clientProjects[0]?.id || projects[0]?.id || '');
  const [docEffectiveDate, setDocEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [docContent, setDocContent] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [docSignerEmail, setDocSignerEmail] = useState('');
  const [docSignerName, setDocSignerName] = useState('');

  const handleUploadLegalDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === docProjectId) || projects[0];

    uploadLegalDocument({
      title: docTitle.trim() || `${docCategory.replace('_', ' ')} Agreement`,
      category: docCategory,
      projectId: proj.id,
      projectName: proj.name,
      clientId: proj.clientId,
      clientName: proj.clientName,
      effectiveDate: docEffectiveDate,
      content: docContent.trim() || `OFFICIAL ARCHITECTURAL LEGAL INSTRUMENT.\n\nProject: ${proj.name}\nClient: ${proj.clientName}\nDate: ${docEffectiveDate}\n\nAll provisions of standard AIA / AGC luxury contracts shall govern this agreement.`,
      fileName: docFileName || `${docTitle.toLowerCase().replace(/\s+/g, '_') || 'legal_doc'}.pdf`,
      fileSize: '1.4 MB (Encrypted PDF/A)',
      signers: [
        { id: 's_vtx', name: currentUser.name, email: currentUser.email, role: `${currentUser.role} (VERTEX Studio)`, hasSigned: true, signedAt: new Date().toISOString() },
        { id: 's_client', name: docSignerName || proj.clientName, email: docSignerEmail || proj.clientEmail, role: 'Counterparty / Client Signatory', hasSigned: false }
      ]
    });

    setIsUploadDocOpen(false);
    setDocTitle('');
    setDocContent('');
    setDocFileName('');
  };

  // ----------------------------------------------------
  // DIGITAL SIGNATURE (E-SIGN) CANVAS & STATE
  // ----------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'DRAW' | 'TYPE' | 'SEAL'>('DRAW');
  const [typedSignName, setTypedSignName] = useState(currentUser.name);
  const [signerAcknowledged, setSignerAcknowledged] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (signingDoc && signatureMode === 'DRAW' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1a1815';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [signingDoc, signatureMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleApplySignature = () => {
    if (!signingDoc) return;
    if (!signerAcknowledged) {
      addToast('error', 'Please verify and check the legal declaration box.');
      return;
    }

    let sigDataUrl = '';
    if (signatureMode === 'DRAW' && canvasRef.current) {
      sigDataUrl = canvasRef.current.toDataURL();
    }

    signLegalDocument(signingDoc.id, {
      signerName: signatureMode === 'TYPE' ? typedSignName : currentUser.name,
      signerRole: currentUser.role,
      signatureDataUrl: sigDataUrl || undefined,
      ipAddress: '192.168.1.104'
    });

    setSigningDoc(null);
    setSignerAcknowledged(false);
    clearSignatureCanvas();
  };

  // Metrics
  const totalInvoiced = visibleInvoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalCollected = visibleInvoices
    .filter(i => i.status === 'PAID')
    .reduce((acc, inv) => acc + inv.total, 0);
  const pendingInvoiced = visibleInvoices
    .filter(i => i.status === 'PENDING' || i.status === 'OVERDUE')
    .reduce((acc, inv) => acc + inv.total, 0);
  const totalPOSTerminalSettled = visiblePOSTransactions
    .filter(t => t.status === 'SETTLED')
    .reduce((acc, t) => acc + t.total, 0);
  const totalExpensesApproved = visibleExpenses
    .filter(e => e.status === 'APPROVED')
    .reduce((acc, e) => acc + e.amount, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === invProjectId) || projects[0];
    const tax = Math.round(invAmount * 0.08);
    const total = invAmount + tax;

    addInvoice({
      projectId: proj.id,
      projectName: proj.name,
      clientId: proj.clientId,
      clientName: proj.clientName,
      clientEmail: proj.clientEmail,
      amount: invAmount,
      tax,
      total,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invDue,
      status: 'PENDING',
      notes: 'Due upon receipt. Thank you for your partnership with VERTEX.',
      items: [
        {
          description: invDesc,
          quantity: 1,
          unitPrice: invAmount,
          total: invAmount
        }
      ]
    });

    setIsCreateInvoiceOpen(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find(i => i.id === payInvoiceId);
    if (!inv) return;

    recordPayment({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      projectId: inv.projectId,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      referenceNumber: payRef || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentDate: new Date().toISOString().split('T')[0]
    });

    setIsRecordPayOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-[#2C2416]">Financial Engine & POS Terminal</h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-[#8B7355] border border-amber-200">
              Escrow & Legal Vault
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time Point-of-Sale terminal, digital signature document vault, escrow draws, legal addenda, and invoicing.
          </p>
        </div>

        {currentUser.role !== 'CLIENT' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pos')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2C2416] hover:bg-black text-[#D4AF37] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Open POS Register</span>
            </button>
            <button
              onClick={() => setIsUploadDocOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 hover:bg-gray-50 text-gray-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Upload Paperwork</span>
            </button>
            <button
              onClick={() => setIsCreateInvoiceOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#B8860B] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Invoice</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
            {isClient ? 'My Invoiced Total' : 'Total Invoiced'}
          </span>
          <div className="text-2xl font-serif font-bold text-[#2C2416] mt-1">${totalInvoiced.toLocaleString()}</div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">{visibleInvoices.length} billing statements</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
            {isClient ? 'POS & Direct Settlements' : 'POS Terminal Revenue'}
          </span>
          <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">${totalPOSTerminalSettled.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">{visiblePOSTransactions.length} instant card & wire settlements</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
            Legal & E-Sign Vault
          </span>
          <div className="text-2xl font-serif font-bold text-[#8B7355] mt-1">{visibleLegalDocs.length} Documents</div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            {visibleLegalDocs.filter(d => d.status === 'SIGNED_SEALED').length} Signed & Cryptographically Sealed
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
            {isClient ? 'Outstanding Escrow Balance' : 'Pending Receivables'}
          </span>
          <div className="text-2xl font-serif font-bold text-[#D4AF37] mt-1">${pendingInvoiced.toLocaleString()}</div>
          <span className="text-[11px] text-amber-600 mt-0.5 block">Pending draw verification</span>
        </div>
      </div>

      {/* Client Isolation Banner */}
      {isClient && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-[#8B7355]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#2C2416]">Client Private Financial Vault Active</h4>
              <p className="text-[11px] text-gray-600">
                You are securely viewing verified invoices, point-of-sale receipts, and legally sealed instruments for your estate ({currentUser.company || currentUser.name}).
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-white text-emerald-700 rounded-full border border-emerald-200 shadow-xs whitespace-nowrap">
            Authorized Signatory
          </span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'invoices'
              ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{isClient ? 'My Invoices & Retainers' : 'Invoices & Draws'} ({visibleInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'pos'
              ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>POS Terminal & Register ({visiblePOSTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('legal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'legal'
              ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Legal Paperwork & E-Sign ({visibleLegalDocs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Transactions & Settlements ({visiblePayments.length})</span>
        </button>

        {!isClient && (
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'expenses'
                ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Contractor Expenses ({visibleExpenses.length})</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INVOICES */}
      {/* ========================================================================= */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Invoice #</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Amount ($)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      No invoices currently assigned to your account.
                    </td>
                  </tr>
                ) : (
                  visibleInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-[#8B7355]">{inv.invoiceNumber}</td>
                      <td className="py-4 px-4 font-semibold text-gray-900">{inv.projectName}</td>
                      <td className="py-4 px-4 text-gray-600">{inv.clientName}</td>
                      <td className="py-4 px-4 text-gray-500">{inv.issueDate}</td>
                      <td className="py-4 px-4 text-gray-500">{inv.dueDate}</td>
                      <td className="py-4 px-4 font-bold text-gray-900">${inv.total.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setPayInvoiceId(inv.id);
                                setPayAmount(inv.total);
                                setIsRecordPayOpen(true);
                              }}
                              className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#B8860B] text-black font-bold rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 shadow-xs"
                              title={isClient ? `Pay full balance of $${inv.total.toLocaleString()}` : `Record escrow / payment balance of $${inv.total.toLocaleString()}`}
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>{isClient ? `Pay $${inv.total.toLocaleString()}` : `Settle $${inv.total.toLocaleString()}`}</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-[#2C2416] hover:text-[#D4AF37] text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer text-xs"
                          >
                            View Statement
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: POS REGISTER & TERMINAL */}
      {/* ========================================================================= */}
      {activeTab === 'pos' && (
        <div className="space-y-6">
          {/* Main POS Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Quick Catalog & Custom Item (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
                {/* Catalog Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-gray-900 text-base">Architectural Service & Procurement Catalog</h3>
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                        {catalogItems.length} Specs
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Search specifications, materials, engineering reviews, and add custom items to firm catalog.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddCatalogItemOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2C2416] hover:bg-black text-[#D4AF37] text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item to Catalog</span>
                    </button>
                    <span className="text-[10px] uppercase font-mono font-bold text-[#8B7355] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Direct Billing
                    </span>
                  </div>
                </div>

                {/* TYPE-AHEAD SEARCH BAR */}
                <div className="mb-3 relative" ref={catalogSearchContainerRef}>
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
                    <input
                      ref={catalogSearchInputRef}
                      type="text"
                      value={catalogSearchQuery}
                      onChange={e => {
                        setCatalogSearchQuery(e.target.value);
                        setIsTypeaheadOpen(true);
                        setFocusedTypeaheadIndex(-1);
                      }}
                      onFocus={() => {
                        if (catalogSearchQuery.trim()) setIsTypeaheadOpen(true);
                      }}
                      onKeyDown={e => {
                        if (!isTypeaheadOpen || typeaheadSuggestions.length === 0) {
                          if (e.key === 'ArrowDown' && catalogSearchQuery.trim()) {
                            setIsTypeaheadOpen(true);
                            setFocusedTypeaheadIndex(0);
                            e.preventDefault();
                          }
                          return;
                        }

                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setFocusedTypeaheadIndex(prev =>
                            prev < typeaheadSuggestions.length - 1 ? prev + 1 : 0
                          );
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setFocusedTypeaheadIndex(prev =>
                            prev > 0 ? prev - 1 : typeaheadSuggestions.length - 1
                          );
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          if (focusedTypeaheadIndex >= 0 && typeaheadSuggestions[focusedTypeaheadIndex]) {
                            handleAddToCart(typeaheadSuggestions[focusedTypeaheadIndex]);
                            setIsTypeaheadOpen(false);
                          }
                        } else if (e.key === 'Escape') {
                          setIsTypeaheadOpen(false);
                        }
                      }}
                      placeholder="Search catalog by service, material, SKU, or keyword... (Typeahead active)"
                      className="w-full pl-9 pr-20 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#D4AF37] rounded-2xl text-xs text-gray-900 placeholder-gray-400 outline-none transition-all shadow-2xs font-medium"
                    />

                    {catalogSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setCatalogSearchQuery('');
                          setIsTypeaheadOpen(false);
                          catalogSearchInputRef.current?.focus();
                        }}
                        className="absolute right-9 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="absolute right-2.5 flex items-center gap-1 text-[10px] text-gray-400 font-mono pointer-events-none bg-gray-100/80 px-1.5 py-0.5 rounded-md border border-gray-200">
                      <span>↵ Select</span>
                    </div>
                  </div>

                  {/* TYPE-AHEAD AUTOCOMPLETE DROPDOWN OVERLAY */}
                  {isTypeaheadOpen && catalogSearchQuery.trim().length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-amber-200/90 shadow-xl z-30 overflow-hidden animate-in fade-in-50 zoom-in-98 duration-100">
                      <div className="px-3.5 py-2 bg-gradient-to-r from-amber-50/80 to-amber-100/40 border-b border-amber-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8B7355]">
                          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Type-Ahead Matching Specifications ({typeaheadSuggestions.length})</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">
                          Use ↑↓ to navigate • Enter to Add to POS
                        </span>
                      </div>

                      {typeaheadSuggestions.length > 0 ? (
                        <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                          {typeaheadSuggestions.map((item, idx) => (
                            <div
                              key={item.id}
                              onMouseEnter={() => setFocusedTypeaheadIndex(idx)}
                              className={`p-3 transition-colors flex items-center justify-between gap-3 ${
                                focusedTypeaheadIndex === idx
                                  ? 'bg-amber-50/70 border-l-3 border-[#D4AF37]'
                                  : 'hover:bg-gray-50/80'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                                    {renderHighlightedText(item.sku || 'SPEC', catalogSearchQuery)}
                                  </span>
                                  <span className="text-[10px] uppercase font-bold text-[#8B7355]">
                                    {renderHighlightedText(item.category, catalogSearchQuery)}
                                  </span>
                                  {item.leadTime && (
                                    <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      {item.leadTime}
                                    </span>
                                  )}
                                </div>
                                <h5 className="font-bold text-xs text-gray-900 truncate">
                                  {renderHighlightedText(item.title, catalogSearchQuery)}
                                </h5>
                                {item.description && (
                                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                    {renderHighlightedText(item.description, catalogSearchQuery)}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right">
                                  <span className="font-mono font-bold text-xs text-[#2C2416] block">
                                    ${item.price.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] text-gray-400 block">
                                    {item.unit || 'Fixed Fee'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleAddToCart(item);
                                      setIsTypeaheadOpen(false);
                                    }}
                                    className="px-2.5 py-1.5 bg-[#2C2416] hover:bg-black text-[#D4AF37] text-[11px] font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    + POS
                                  </button>
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setIsTypeaheadOpen(false);
                                      handleOpenUseItemModal(item, 'BUDGET');
                                    }}
                                    className="px-2 py-1.5 bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-[#8B7355] text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                                    title="Allocate to Project Budget"
                                  >
                                    Budget
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-xs text-gray-500">
                            No catalog items matching <strong className="text-gray-800">"{catalogSearchQuery}"</strong>
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setNewItemTitle(catalogSearchQuery);
                              setIsAddCatalogItemOpen(true);
                              setIsTypeaheadOpen(false);
                            }}
                            className="mt-2 text-xs font-bold text-[#8B7355] hover:underline cursor-pointer inline-flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add "{catalogSearchQuery}" as a new specification</span>
                          </button>
                        </div>
                      )}

                      {/* Dropdown Footer */}
                      <div className="p-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">
                          Showing {typeaheadSuggestions.length} fast suggestions
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setNewItemTitle(catalogSearchQuery);
                            setIsAddCatalogItemOpen(true);
                            setIsTypeaheadOpen(false);
                          }}
                          className="text-[#8B7355] hover:text-[#2C2416] font-bold cursor-pointer"
                        >
                          + Create Custom Spec
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* CATEGORY FILTER PILLS */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-thin">
                  {catalogCategories.map(cat => {
                    const count = cat === 'ALL'
                      ? catalogItems.length
                      : catalogItems.filter(i => i.category === cat).length;
                    const isSelected = selectedCatalogCategory === cat;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCatalogCategory(cat)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#2C2416] text-[#D4AF37] shadow-2xs font-bold'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
                        }`}
                      >
                        <span>{cat === 'ALL' ? 'All Catalog Items' : cat}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected
                              ? 'bg-[#D4AF37] text-black font-bold'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* CATALOG ITEMS GRID */}
                {filteredCatalogItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredCatalogItems.map(item => {
                      const inCartCount = posCart
                        .filter(c => c.description === item.title || c.catalogItemId === item.id)
                        .reduce((sum, c) => sum + c.quantity, 0);

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl border border-gray-200/90 hover:border-[#D4AF37] hover:bg-amber-50/20 text-left transition-all group flex flex-col justify-between relative bg-white"
                        >
                          <div>
                            {/* Card Top Badges */}
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                                  {item.sku}
                                </span>
                                <span className="text-[9px] uppercase font-bold text-[#8B7355] tracking-wider">
                                  {item.category}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                {item.isCustom && (
                                  <span className="text-[8px] font-bold uppercase bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200">
                                    Custom
                                  </span>
                                )}
                                {inCartCount > 0 && (
                                  <span className="text-[9px] font-bold bg-amber-100 text-[#2C2416] px-1.5 py-0.5 rounded border border-amber-300 font-mono">
                                    ✓ {inCartCount} in cart
                                  </span>
                                )}
                                {item.isCustom && (
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      deleteCatalogItem(item.id);
                                    }}
                                    className="text-gray-300 hover:text-rose-600 p-0.5 cursor-pointer"
                                    title="Delete custom item"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Title */}
                            <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#8B7355] transition-colors line-clamp-1">
                              {renderHighlightedText(item.title, catalogSearchQuery)}
                            </h4>

                            {/* Description */}
                            {item.description && (
                              <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                                {renderHighlightedText(item.description, catalogSearchQuery)}
                              </p>
                            )}

                            {/* Lead time & tags */}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {item.leadTime && (
                                <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                                  <Clock className="w-2.5 h-2.5 text-gray-400" />
                                  {item.leadTime}
                                </span>
                              )}
                              {item.tags?.slice(0, 3).map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.2 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
                            <div>
                              <span className="font-mono font-bold text-sm text-[#2C2416] block">
                                ${item.price.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-gray-400 block -mt-0.5">
                                {item.unit || 'Fixed Fee'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenUseItemModal(item)}
                                className="text-[10px] font-semibold text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                title="Use in project budget or client invoice"
                              >
                                Use...
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => handleAddToCart(item)}
                                className="text-[10px] font-bold text-[#8B7355] bg-white group-hover:bg-[#2C2416] group-hover:text-[#D4AF37] px-2.5 py-1 rounded-lg border border-amber-200 group-hover:border-[#2C2416] transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>{inCartCount > 0 ? 'Add Another' : 'Add to POS'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
                    <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs font-bold text-gray-700">No catalog specifications found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 max-w-sm mx-auto">
                      No items matched your search query "{catalogSearchQuery}" in category "{selectedCatalogCategory}".
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCatalogSearchQuery('');
                          setSelectedCatalogCategory('ALL');
                        }}
                        className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-xl font-medium cursor-pointer hover:bg-gray-100"
                      >
                        Reset Search Filters
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewItemTitle(catalogSearchQuery);
                          setIsAddCatalogItemOpen(true);
                        }}
                        className="px-3 py-1 bg-[#2C2416] text-[#D4AF37] text-xs rounded-xl font-bold cursor-pointer hover:bg-black"
                      >
                        + Add as New Specification
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Line Item Adder */}
                <form onSubmit={handleAddCustomLineItem} className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2 tracking-wider">
                    Add One-Off Surcharge / Custom POS Retainer Item
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Item description..."
                      value={posCustomDesc}
                      onChange={e => setPosCustomDesc(e.target.value)}
                      className="p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white sm:col-span-1"
                    />
                    <input
                      type="number"
                      placeholder="Amount ($)"
                      value={posCustomPrice || ''}
                      onChange={e => setPosCustomPrice(Number(e.target.value))}
                      className="p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="p-2 text-xs font-bold bg-[#2C2416] hover:bg-black text-[#D4AF37] rounded-xl transition-colors cursor-pointer"
                    >
                      + Add Custom Line
                    </button>
                  </div>
                </form>
              </div>

              {/* POS Recent Slips Table */}
              <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-serif font-bold text-gray-900 text-sm">Settled POS Receipts & Slips</h4>
                  <span className="text-xs text-gray-400 font-mono">{visiblePOSTransactions.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-400 font-semibold text-[10px] uppercase border-b border-gray-100">
                      <tr>
                        <th className="py-2.5 px-3">Receipt #</th>
                        <th className="py-2.5 px-3">Client & Project</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3 text-right">Slip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {visiblePOSTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-gray-400">
                            No POS transactions on record.
                          </td>
                        </tr>
                      ) : (
                        visiblePOSTransactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-gray-50/60">
                            <td className="py-3 px-3 font-mono font-bold text-[#8B7355]">{tx.transactionNumber}</td>
                            <td className="py-3 px-3">
                              <p className="font-bold text-gray-900">{tx.clientName}</p>
                              <p className="text-[10px] text-gray-500">{tx.projectName}</p>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-mono">
                                {tx.paymentMethod.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold text-emerald-700">${tx.total.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => setSelectedPOSTransaction(tx)}
                                className="px-2.5 py-1 bg-amber-50 text-[#8B7355] hover:bg-[#2C2416] hover:text-[#D4AF37] rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                View Slip
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: Active POS Register & Checkout Terminal (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#2C2416] text-white rounded-3xl p-6 shadow-xl border border-amber-900/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-[#D4AF37] text-base">VERTEX POS Register</h3>
                        <p className="text-[10px] text-gray-400 font-mono">Terminal: Beverly Hills Studio 01</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-900/60 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ONLINE
                    </span>
                  </div>

                  {/* Project Target */}
                  <div className="mb-4">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Billing Estate Project
                    </label>
                    <select
                      value={posProjectId}
                      onChange={e => setPosProjectId(e.target.value)}
                      className="w-full p-2.5 bg-black/40 text-white border border-white/10 rounded-xl text-xs outline-none focus:border-[#D4AF37]"
                    >
                      {clientProjects.map(p => (
                        <option key={p.id} value={p.id} className="bg-gray-900 text-white">
                          {p.name} - Client: {p.clientName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cart Itemization List */}
                  <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                      Itemized Register ({posCart.length} items)
                    </span>

                    {posCart.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-500 italic border border-dashed border-white/10 rounded-2xl">
                        Register is clear. Select items from catalog.
                      </div>
                    ) : (
                      posCart.map(item => (
                        <div
                          key={item.id}
                          className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="font-bold text-white truncate">{item.description}</p>
                            <p className="text-[10px] text-gray-400 font-mono">${item.unitPrice.toLocaleString()} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-lg">
                              <button
                                onClick={() => handleUpdateCartQty(item.id, -1)}
                                className="text-gray-300 hover:text-white font-bold px-1"
                              >
                                -
                              </button>
                              <span className="text-xs font-mono font-bold px-1">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateCartQty(item.id, 1)}
                                className="text-gray-300 hover:text-white font-bold px-1"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-mono font-bold text-[#D4AF37] w-16 text-right">
                              ${item.total.toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleRemoveCartItem(item.id)}
                              className="text-gray-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Calculations */}
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/10 space-y-1.5 text-xs font-mono mb-4">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal:</span>
                      <span>${posSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Tax (8.0%):</span>
                      <span>${posTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 items-center">
                      <span>Escrow Buffer:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPosContingencyRate(0)}
                          className={`px-1.5 py-0.5 rounded text-[10px] ${posContingencyRate === 0 ? 'bg-[#D4AF37] text-black font-bold' : 'bg-white/10 text-gray-400'}`}
                        >
                          0%
                        </button>
                        <button
                          type="button"
                          onClick={() => setPosContingencyRate(0.05)}
                          className={`px-1.5 py-0.5 rounded text-[10px] ${posContingencyRate === 0.05 ? 'bg-[#D4AF37] text-black font-bold' : 'bg-white/10 text-gray-400'}`}
                        >
                          5%
                        </button>
                        <button
                          type="button"
                          onClick={() => setPosContingencyRate(0.1)}
                          className={`px-1.5 py-0.5 rounded text-[10px] ${posContingencyRate === 0.1 ? 'bg-[#D4AF37] text-black font-bold' : 'bg-white/10 text-gray-400'}`}
                        >
                          10%
                        </button>
                        <span className="ml-1">${posContingency.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10 text-sm">
                      <span className="font-serif text-[#D4AF37]">Total Settlement:</span>
                      <span className="text-[#D4AF37] text-base">${posTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment Gateway Options */}
                  <div className="space-y-2 mb-4">
                    <label className="block text-[10px] uppercase font-bold text-gray-400">
                      Payment Terminal Gateway
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPosPaymentMethod('CARD_TAP')}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          posPaymentMethod === 'CARD_TAP'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]'
                            : 'border-white/10 text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold truncate">Contactless / Chip</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPosPaymentMethod('WIRE_ESCROW')}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          posPaymentMethod === 'WIRE_ESCROW'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]'
                            : 'border-white/10 text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold truncate">Direct Wire Escrow</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPosPaymentMethod('ACH_DIRECT')}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          posPaymentMethod === 'ACH_DIRECT'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]'
                            : 'border-white/10 text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold truncate">Institutional ACH</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPosPaymentMethod('CARD_ON_FILE')}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          posPaymentMethod === 'CARD_ON_FILE'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]'
                            : 'border-white/10 text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold truncate">Amex Card on File</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Process Button */}
                <button
                  onClick={handleProcessCheckout}
                  disabled={posCart.length === 0 || posProcessing}
                  className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#B8860B] disabled:opacity-40 text-black font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {posProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isClient ? 'Processing Payment...' : 'Authorizing Reader & Clearing Escrow...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isClient ? `Pay $${posTotal.toLocaleString()}` : `Authorize & Charge $${posTotal.toLocaleString()}`}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEGAL PAPERWORK & DIGITAL SIGNATURE VAULT */}
      {/* ========================================================================= */}
      {activeTab === 'legal' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
              <div>
                <h3 className="font-serif font-bold text-gray-900 text-lg">Architectural Legal & Contract Vault</h3>
                <p className="text-xs text-gray-500">
                  AIA B101 Standard contracts, escrow disbursement authorizations, change order addenda, and partial lien waivers with SHA-256 digital seals.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUploadDocOpen(true)}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B8860B] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Paperwork</span>
                </button>
              </div>
            </div>

            {/* Documents List */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleLegalDocs.map(doc => {
                const isSigned = doc.status === 'SIGNED_SEALED';
                return (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl border border-gray-200/80 hover:border-[#D4AF37] transition-all bg-white hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-[10px] font-bold text-[#8B7355] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {doc.documentNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isSigned
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                        }`}>
                          {isSigned ? <ShieldCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{isSigned ? 'SIGNED & SEALED' : 'PENDING E-SIGN'}</span>
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-gray-900 text-sm leading-snug mb-1">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-gray-500 mb-3">
                        Project: <strong className="text-gray-700">{doc.projectName}</strong> • Client: {doc.clientName}
                      </p>

                      {/* Signatories badges */}
                      <div className="space-y-1 mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">
                          Signatory Execution Status
                        </span>
                        {doc.signers.map((s, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-700 font-medium">{s.name} ({s.role.split(' ')[0]})</span>
                            {s.hasSigned ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                                <Check className="w-3 h-3 text-emerald-600" /> Signed
                              </span>
                            ) : (
                              <span className="text-amber-700 font-bold text-[10px]">Awaiting Sign</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {doc.signatureCertificate && (
                        <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-[10px] font-mono text-emerald-900 truncate mb-3">
                          🔒 SHA-256 Seal: {doc.signatureCertificate.cryptoHash.substring(0, 24)}...
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedLegalDoc(doc)}
                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </button>

                      {!isSigned ? (
                        <button
                          onClick={() => setSigningDoc(doc)}
                          className="flex-1 px-3 py-2 bg-[#D4AF37] hover:bg-[#B8860B] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>E-Sign & Seal</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => addToast('success', `Downloading cryptographically verified PDF: ${doc.documentNumber}`)}
                          className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PAYMENTS & SETTLEMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Reference ID</th>
                  <th className="py-3.5 px-4">Applied Invoice</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Settlement Date</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-6 text-right">Amount Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visiblePayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No payment transactions recorded for your account yet.
                    </td>
                  </tr>
                ) : (
                  visiblePayments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-gray-800">{p.referenceNumber}</td>
                      <td className="py-4 px-4 font-semibold text-[#8B7355]">{p.invoiceNumber}</td>
                      <td className="py-4 px-4 text-gray-600">{p.paymentMethod}</td>
                      <td className="py-4 px-4 text-gray-500">{p.paymentDate}</td>
                      <td className="py-4 px-4 text-gray-600 font-medium">{p.projectName}</td>
                      <td className="py-4 px-6 text-right font-bold text-emerald-700">${p.amount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: EXPENSES */}
      {/* ========================================================================= */}
      {!isClient && activeTab === 'expenses' && (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Expense Description</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-900">{exp.description}</td>
                    <td className="py-4 px-4 text-gray-600">{exp.vendor}</td>
                    <td className="py-4 px-4 text-gray-500">{exp.category}</td>
                    <td className="py-4 px-4 text-gray-500">{exp.date}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">${exp.amount.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        exp.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        exp.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {exp.status === 'PENDING' && currentUser.role !== 'CLIENT' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => updateExpenseStatus(exp.id, 'REJECTED')}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => updateExpenseStatus(exp.id, 'APPROVED')}
                            className="px-3 py-1 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: POS TRANSACTION RECEIPT SLIP */}
      {/* ========================================================================= */}
      {selectedPOSTransaction && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-200 animate-in zoom-in-95">
            <button
              onClick={() => setSelectedPOSTransaction(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-1 text-lg font-bold"
            >
              ✕
            </button>

            {/* Thermal Slip Layout */}
            <div className="text-center pb-4 border-b border-dashed border-gray-300">
              <span className="font-serif text-2xl font-bold tracking-wider text-[#2C2416]">VERTEX</span>
              <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                Point of Sale Terminal Slip
              </p>
              <p className="text-[11px] text-gray-500 mt-1">1004 Wilshire Blvd, Beverly Hills, CA</p>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedPOSTransaction.terminalId}</p>
            </div>

            <div className="py-4 space-y-1 text-xs border-b border-dashed border-gray-300 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction Ref:</span>
                <span className="font-bold text-gray-900">{selectedPOSTransaction.transactionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date & Time:</span>
                <span>{selectedPOSTransaction.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Client Estate:</span>
                <span className="font-bold">{selectedPOSTransaction.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Project:</span>
                <span className="truncate max-w-[180px]">{selectedPOSTransaction.projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Auth Code:</span>
                <span className="text-emerald-700 font-bold">{selectedPOSTransaction.authCode}</span>
              </div>
            </div>

            {/* Itemization */}
            <div className="py-4 space-y-2 text-xs border-b border-dashed border-gray-300">
              {selectedPOSTransaction.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{it.description}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{it.quantity} x ${it.unitPrice.toLocaleString()}</p>
                  </div>
                  <span className="font-mono font-bold text-gray-900">${it.total.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-4 space-y-1.5 text-xs font-mono border-b border-dashed border-gray-300">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>${selectedPOSTransaction.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax (8%):</span>
                <span>${selectedPOSTransaction.tax.toLocaleString()}</span>
              </div>
              {selectedPOSTransaction.contingencyFee > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Escrow Buffer:</span>
                  <span>${selectedPOSTransaction.contingencyFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-sm pt-1 border-t border-gray-200">
                <span>TOTAL SETTLED:</span>
                <span className="text-[#8B7355]">${selectedPOSTransaction.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="py-4 text-center text-[10px] font-mono text-gray-400 space-y-1">
              <p>CRYPTOGRAPHIC RECEIPT SEAL</p>
              <p className="truncate text-[9px] text-gray-500">{selectedPOSTransaction.receiptHash}</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => addToast('info', 'Printing POS Thermal Receipt...')}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => setSelectedPOSTransaction(null)}
                className="flex-1 py-2.5 bg-[#2C2416] text-[#D4AF37] rounded-xl font-bold text-xs hover:bg-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: E-SIGNATURE (DIGITAL SIGNATURE CANVAS & SEAL) */}
      {/* ========================================================================= */}
      {signingDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95 my-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">Affix Cryptographic E-Signature</h3>
                <p className="text-xs text-gray-500">
                  Signing <strong className="text-[#8B7355]">{signingDoc.documentNumber}</strong> ({signingDoc.title})
                </p>
              </div>
              <button onClick={() => setSigningDoc(null)} className="text-gray-400 hover:text-black p-1 text-lg font-bold">
                ✕
              </button>
            </div>

            {/* Document summary box */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-xs mb-4">
              <div className="flex justify-between text-gray-600 mb-1">
                <span>Project: <strong>{signingDoc.projectName}</strong></span>
                <span>Effective Date: <strong>{signingDoc.effectiveDate}</strong></span>
              </div>
              <p className="text-[11px] text-gray-500 italic line-clamp-2">"{signingDoc.content.substring(0, 150)}..."</p>
            </div>

            {/* Signature Mode Selector */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSignatureMode('DRAW')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                  signatureMode === 'DRAW'
                    ? 'bg-[#2C2416] text-[#D4AF37] border-[#2C2416]'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Draw Signature
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('TYPE')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                  signatureMode === 'TYPE'
                    ? 'bg-[#2C2416] text-[#D4AF37] border-[#2C2416]'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Type Cursive Sign
              </button>
            </div>

            {/* Signature Canvas Area */}
            {signatureMode === 'DRAW' ? (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Sign with mouse, stylus or touch:</span>
                  <button
                    type="button"
                    onClick={clearSignatureCanvas}
                    className="text-[11px] text-gray-400 hover:text-red-500 underline cursor-pointer"
                  >
                    Clear Canvas
                  </button>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl bg-amber-50/20 p-1 relative">
                  <canvas
                    ref={canvasRef}
                    width={520}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-36 bg-white rounded-xl cursor-crosshair touch-none"
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 text-xs italic">
                      Sign on the baseline here ✍️
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                <label className="block text-xs text-gray-600">Enter Signatory Legal Name:</label>
                <input
                  type="text"
                  value={typedSignName}
                  onChange={e => setTypedSignName(e.target.value)}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-xl outline-none"
                />
                <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-2xl text-center">
                  <span className="font-serif italic text-2xl text-gray-900 tracking-wide">
                    {typedSignName || 'Signatory Name'}
                  </span>
                </div>
              </div>
            )}

            {/* Legal acknowledgment */}
            <label className="flex items-start gap-2 text-xs text-gray-600 mb-5 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                checked={signerAcknowledged}
                onChange={e => setSignerAcknowledged(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span>
                I declare under penalty of perjury that I am authorized to bind the counterparty and legally execute this document. An immutable SHA-256 cryptographic seal will be attached.
              </span>
            </label>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSigningDoc(null)}
                className="px-4 py-2.5 text-xs text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplySignature}
                disabled={!signerAcknowledged}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#B8860B] disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Affix Cryptographic Signature & Seal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW LEGAL DOCUMENT */}
      {/* ========================================================================= */}
      {selectedLegalDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl relative border border-gray-200 animate-in zoom-in-95 my-8">
            <button
              onClick={() => setSelectedLegalDoc(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black p-1 text-lg font-bold"
            >
              ✕
            </button>

            {/* Document Header */}
            <div className="flex justify-between items-start pb-6 border-b border-gray-200 mb-6">
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-[#2C2416]">VERTEX</span>
                <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                  Official Architectural Legal Instrument
                </p>
                <p className="text-xs text-gray-500 mt-1">Project: {selectedLegalDoc.projectName}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-base font-bold text-gray-900">{selectedLegalDoc.documentNumber}</span>
                <span className={`block text-xs font-bold mt-1 ${
                  selectedLegalDoc.status === 'SIGNED_SEALED' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  Status: {selectedLegalDoc.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 text-center">
              {selectedLegalDoc.title}
            </h3>

            {/* Content body */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-xs text-gray-800 leading-relaxed font-serif whitespace-pre-wrap max-h-72 overflow-y-auto mb-6">
              {selectedLegalDoc.content}
            </div>

            {/* Signatures footer */}
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-200 mb-6 text-xs">
              {selectedLegalDoc.signers.map((s, idx) => (
                <div key={idx} className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/80">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                    {s.role}
                  </span>
                  <p className="font-bold text-gray-900">{s.name}</p>
                  <p className="text-[11px] text-gray-500">{s.email}</p>
                  {s.hasSigned ? (
                    <div className="mt-2 pt-2 border-t border-amber-200 flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Executed: {s.signedAt || 'Verified Online'}</span>
                    </div>
                  ) : (
                    <div className="mt-2 pt-2 border-t border-amber-200 text-amber-700 font-semibold text-[11px]">
                      Pending Electronic Signature
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedLegalDoc.signatureCertificate && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-mono mb-6 space-y-1">
                <p className="font-bold">🔐 Cryptographic Certificate ID: {selectedLegalDoc.signatureCertificate.certificateId}</p>
                <p className="text-[10px] truncate">Hash: {selectedLegalDoc.signatureCertificate.cryptoHash}</p>
                <p className="text-[10px]">Timestamp: {selectedLegalDoc.signatureCertificate.signedAt}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() => addToast('info', 'Printing document...')}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
              <button
                onClick={() => setSelectedLegalDoc(null)}
                className="px-5 py-2 bg-[#2C2416] text-[#D4AF37] rounded-xl text-xs font-bold hover:bg-black"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD LEGAL PAPERWORK */}
      {/* ========================================================================= */}
      {isUploadDocOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-serif font-bold text-gray-900">Upload & Register Legal Paperwork</h3>
              <button onClick={() => setIsUploadDocOpen(false)} className="text-gray-400 hover:text-black p-1 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadLegalDocument} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Document Category</label>
                <select
                  value={docCategory}
                  onChange={e => setDocCategory(e.target.value as LegalDocumentCategory)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                >
                  <option value="CONTRACT">Master Architectural Services Contract (AIA B101)</option>
                  <option value="DRAW_AGREEMENT">Escrow Milestone Draw Authorization</option>
                  <option value="CHANGE_ORDER_ADDENDUM">Change Order Legal Addendum</option>
                  <option value="LIEN_WAIVER">Subcontractor Partial Lien Waiver</option>
                  <option value="PERMIT_PERFECTION">Municipal Zoning & Structural Permit</option>
                  <option value="INDEMNITY_INSURANCE">Site Safety & Insurance Certificate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target Project</label>
                <select
                  value={docProjectId}
                  onChange={e => setDocProjectId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                >
                  {clientProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Design Contract Schedule B"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              {/* Drag & Drop simulated upload zone */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Upload File (PDF, DOCX)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center bg-gray-50 hover:bg-amber-50/20 transition-colors">
                  <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-600">Drag & drop agreement or click to browse</p>
                  <input
                    type="file"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setDocFileName(e.target.files[0].name);
                      }
                    }}
                    className="mt-2 text-xs text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Legal Contract Terms / Clauses</label>
                <textarea
                  rows={3}
                  placeholder="Paste contract covenants or addendum terms..."
                  value={docContent}
                  onChange={e => setDocContent(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUploadDocOpen(false)}
                  className="px-4 py-2 text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Register in Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INVOICE STATEMENT MODAL */}
      {/* ========================================================================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative my-8 border border-amber-100 animate-in zoom-in-95">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black p-1 text-lg font-bold"
            >
              ✕
            </button>

            <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-[#2C2416]">VERTEX</span>
                <span className="text-[10px] block uppercase tracking-widest text-[#D4AF37] font-semibold">
                  Architectural Masterworks Inc.
                </span>
                <p className="text-xs text-gray-400 mt-2">1004 Wilshire Blvd, Suite 800, Beverly Hills, CA</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-bold text-gray-900">{selectedInvoice.invoiceNumber}</span>
                <span className={`block text-xs font-bold mt-1 ${
                  selectedInvoice.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  Status: {selectedInvoice.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs mb-6">
              <div>
                <span className="text-gray-400 uppercase font-bold text-[10px] block">Billed To</span>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{selectedInvoice.clientName}</p>
                <p className="text-gray-500">{selectedInvoice.clientEmail}</p>
                <p className="text-gray-600 mt-1 font-medium">Project: {selectedInvoice.projectName}</p>
              </div>
              <div className="text-right">
                <span className="text-gray-400 uppercase font-bold text-[10px] block">Invoice Dates</span>
                <p className="text-gray-600 mt-0.5">Issued: <strong className="text-gray-800">{selectedInvoice.issueDate}</strong></p>
                <p className="text-gray-600">Due: <strong className="text-gray-800">{selectedInvoice.dueDate}</strong></p>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4 text-left">Description</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-4 font-medium text-gray-800">{it.description}</td>
                      <td className="py-3 px-4 text-center">{it.quantity}</td>
                      <td className="py-3 px-4 text-right">${it.unitPrice.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold">${it.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-6">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span>${selectedInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Sales & Procurement Tax (8%):</span>
                  <span>${selectedInvoice.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 text-sm">
                  <span>Total Due:</span>
                  <span className="text-[#8B7355]">${selectedInvoice.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => addToast('info', 'Printing statement...')}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedInvoice.status !== 'PAID' && (
                  <button
                    onClick={() => {
                      setPayInvoiceId(selectedInvoice.id);
                      setPayAmount(selectedInvoice.total);
                      setSelectedInvoice(null);
                      setIsRecordPayOpen(true);
                    }}
                    className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B8860B] text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{isClient ? `Pay Invoice ($${selectedInvoice.total.toLocaleString()})` : `Record Settlement`}</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-5 py-2 bg-[#2C2416] text-[#D4AF37] rounded-xl text-xs font-bold hover:bg-black cursor-pointer"
                >
                  Close Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GENERATE INVOICE MODAL */}
      {/* ========================================================================= */}
      {isCreateInvoiceOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-100 animate-in zoom-in-95">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Generate Project Invoice</h3>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Project</label>
                <select
                  value={invProjectId}
                  onChange={e => setInvProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Line Item Description</label>
                <input
                  type="text"
                  value={invDesc}
                  onChange={e => setInvDesc(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    value={invAmount}
                    onChange={e => setInvAmount(Number(e.target.value))}
                    min={1000}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invDue}
                    onChange={e => setInvDue(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateInvoiceOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] text-white font-bold text-xs rounded-xl hover:bg-[#B8860B] cursor-pointer"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECORD PAYMENT MODAL */}
      {isRecordPayOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-100 animate-in zoom-in-95">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">
              {isClient ? 'Pay Invoice' : 'Record Escrow Settlement'}
            </h3>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Open Invoice</label>
                <select
                  value={payInvoiceId}
                  onChange={e => {
                    setPayInvoiceId(e.target.value);
                    const matched = invoices.find(i => i.id === e.target.value);
                    if (matched) setPayAmount(matched.total);
                  }}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white"
                >
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.projectName} (${inv.total.toLocaleString()}) [{inv.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Amount Paid ($)</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={e => setPayAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white"
                  >
                    <option value="Wire Transfer">Wire Transfer</option>
                    <option value="ACH Escrow">ACH Escrow</option>
                    <option value="Credit Card">Corporate Credit Card</option>
                    <option value="Check">Cashier Check</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Reference #</label>
                <input
                  type="text"
                  placeholder="e.g. WT-94829104"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRecordPayOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-[#B8860B] shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isClient ? `Pay $${payAmount.toLocaleString()}` : 'Confirm Settlement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW ARCHITECTURAL CATALOG ITEM MODAL */}
      {/* ========================================================================= */}
      {isAddCatalogItemOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-100 animate-in zoom-in-95 my-8">
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B7355] block">
                  Firm Master Catalog
                </span>
                <h3 className="text-lg font-serif font-bold text-gray-900 mt-0.5">
                  Add Specification / Procurement Item
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCatalogItemOpen(false)}
                className="text-gray-400 hover:text-black p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCatalogItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Service / Specification Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Murano Handblown Glass Chandelier Lot Inspection"
                  value={newItemTitle}
                  onChange={e => setNewItemTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:border-[#D4AF37] bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="Procurement Sample">Procurement Sample</option>
                    <option value="Design Technology">Design Technology</option>
                    <option value="Material Fabrication">Material Fabrication</option>
                    <option value="Municipal Filing">Municipal Filing</option>
                    <option value="Engineering Review">Engineering Review</option>
                    <option value="Escrow Retainer">Escrow Retainer</option>
                    <option value="Electrical Design">Electrical Design</option>
                    <option value="Site Survey">Site Survey</option>
                    <option value="CUSTOM">+ Custom Category...</option>
                  </select>
                </div>

                {newItemCategory === 'CUSTOM' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Custom Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Landscape Architecture"
                      value={newItemCustomCategory}
                      onChange={e => setNewItemCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      SKU / Spec Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PRC-GLAS-14"
                      value={newItemSku}
                      onChange={e => setNewItemSku(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none font-mono uppercase"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Base Unit Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newItemPrice || ''}
                    onChange={e => setNewItemPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Pricing Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Per Inspection, Fixed Fee, Per Session"
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Lead Time / Turnaround
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Business Days, Immediate, 2 Weeks"
                    value={newItemLeadTime}
                    onChange={e => setNewItemLeadTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Search Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Glass, Lighting, Italy, Luxury"
                    value={newItemTags}
                    onChange={e => setNewItemTags(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Scope Specification & Deliverables
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe technical verification parameters, contractor obligations, or quarry certification deliverables..."
                  value={newItemDescription}
                  onChange={e => setNewItemDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddCatalogItemOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 font-semibold hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2C2416] hover:bg-black text-[#D4AF37] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* USE / ALLOCATE CATALOG SPECIFICATION MODAL */}
      {/* ========================================================================= */}
      {isUseItemModalOpen && selectedCatalogItemForUse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-100 animate-in zoom-in-95 my-8">
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B7355] block">
                  Catalog Resource Allocation
                </span>
                <h3 className="text-lg font-serif font-bold text-gray-900 mt-0.5">
                  Use Architectural Specification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUseItemModalOpen(false)}
                className="text-gray-400 hover:text-black p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Selected Item Summary Card */}
            <div className="bg-amber-50/50 rounded-2xl p-3.5 border border-amber-200/80 mb-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-gray-700 border border-amber-200">
                  {selectedCatalogItemForUse.sku}
                </span>
                <span className="text-[10px] font-bold text-[#8B7355] uppercase">
                  {selectedCatalogItemForUse.category}
                </span>
              </div>
              <h4 className="font-bold text-sm text-gray-900">
                {selectedCatalogItemForUse.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-600 mt-2 pt-2 border-t border-amber-200/50">
                <span>Base Unit Price: <strong className="font-mono font-bold text-[#2C2416]">${selectedCatalogItemForUse.price.toLocaleString()}</strong> ({selectedCatalogItemForUse.unit || 'Standard'})</span>
                {selectedCatalogItemForUse.leadTime && (
                  <span className="text-[10px] text-gray-500 font-mono">Lead time: {selectedCatalogItemForUse.leadTime}</span>
                )}
              </div>
            </div>

            <form onSubmit={handleUseCatalogItemConfirm} className="space-y-3.5">
              {/* Destination Radio Cards */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Select Allocation Destination *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUseDestination('POS')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      useDestination === 'POS'
                        ? 'border-[#D4AF37] bg-amber-50/60 text-[#2C2416] font-bold shadow-2xs'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#8B7355]" />
                    <span className="text-xs">Active POS Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUseDestination('BUDGET')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      useDestination === 'BUDGET'
                        ? 'border-[#D4AF37] bg-amber-50/60 text-[#2C2416] font-bold shadow-2xs'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 text-[#8B7355]" />
                    <span className="text-xs">Project Budget</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUseDestination('INVOICE')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      useDestination === 'INVOICE'
                        ? 'border-[#D4AF37] bg-amber-50/60 text-[#2C2416] font-bold shadow-2xs'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-[#8B7355]" />
                    <span className="text-xs">Draft Invoice</span>
                  </button>
                </div>
              </div>

              {/* Target Project Selection (for Budget and Invoice) */}
              {(useDestination === 'BUDGET' || useDestination === 'INVOICE' || useDestination === 'POS') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Project *
                  </label>
                  <select
                    value={useTargetProjectId}
                    onChange={e => setUseTargetProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white font-medium"
                  >
                    {clientProjects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code}) — {p.clientName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Quantity / Units
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={useQuantity}
                    onChange={e => setUseQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Custom Unit Price ($ USD)
                  </label>
                  <input
                    type="number"
                    placeholder={selectedCatalogItemForUse.price.toString()}
                    value={useCustomPrice}
                    onChange={e => setUseCustomPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Allocation Notes & Engineering Specifications
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional scope instructions, contractor contact, or milestone release trigger..."
                  value={useNotes}
                  onChange={e => setUseNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Calculated Allocation Total:</span>
                <span className="font-mono font-bold text-sm text-[#2C2416]">
                  $
                  {(
                    (typeof useCustomPrice === 'number' && useCustomPrice > 0
                      ? useCustomPrice
                      : selectedCatalogItemForUse.price) * useQuantity
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUseItemModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 font-semibold hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2C2416] hover:bg-black text-[#D4AF37] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {useDestination === 'POS'
                      ? 'Add to POS Register'
                      : useDestination === 'BUDGET'
                      ? 'Add to Project Budget'
                      : 'Generate Client Invoice'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
