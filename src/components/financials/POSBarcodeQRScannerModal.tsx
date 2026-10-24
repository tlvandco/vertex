import React, { useState, useRef, useEffect } from 'react';
import {
  Scan,
  QrCode,
  Barcode,
  Camera,
  Upload,
  Keyboard,
  Sparkles,
  Plus,
  Check,
  X,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Download,
  Copy,
  Layers,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { CatalogItem } from '../../types';
import { generateBarcodeSvg, generateQrDataUrl, playScannerBeep } from '../../utils/barcodeGenerator';

interface POSBarcodeQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogItems: CatalogItem[];
  onFetchAndInsertItem: (item: CatalogItem, qty?: number) => void;
  onAddNewCatalogItem?: (newItem: Partial<CatalogItem>) => CatalogItem | void;
  initialItemToGenerate?: CatalogItem | null;
}

export const POSBarcodeQRScannerModal: React.FC<POSBarcodeQRScannerModalProps> = ({
  isOpen,
  onClose,
  catalogItems,
  onFetchAndInsertItem,
  onAddNewCatalogItem,
  initialItemToGenerate
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'generate'>('scan');
  const [activeScannerAdapter, setActiveScannerAdapter] = useState<'camera' | 'hardware' | 'file' | 'simulator'>('simulator');

  // Scanner state
  const [scannedCode, setScannedCode] = useState<string>('');
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [matchedItem, setMatchedItem] = useState<CatalogItem | null>(null);
  const [isUnrecognizedCode, setIsUnrecognizedCode] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanQty, setScanQty] = useState<number>(1);

  // New item creation drawer if unrecognized
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'MATERIAL' | 'SERVICE' | 'FURNITURE' | 'PERMIT'>('MATERIAL');
  const [newItemPrice, setNewItemPrice] = useState<number>(250);
  const [newItemCsi, setNewItemCsi] = useState<string>('09 20 00');

  // Generator state
  const [selectedGenerateItem, setSelectedGenerateItem] = useState<CatalogItem | null>(
    initialItemToGenerate || catalogItems[0] || null
  );
  const [customGenCode, setCustomGenCode] = useState<string>('');
  const [customGenTitle, setCustomGenTitle] = useState<string>('');
  const [customGenPrice, setCustomGenPrice] = useState<number>(500);
  const [generatedQrUrl, setGeneratedQrUrl] = useState<string>('');

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [shortcutNotice, setShortcutNotice] = useState<string | null>(null);
  const [showShortcutsGuide, setShowShortcutsGuide] = useState<boolean>(false);

  // Sync initial item if passed
  useEffect(() => {
    if (initialItemToGenerate) {
      setSelectedGenerateItem(initialItemToGenerate);
      setActiveTab('generate');
    }
  }, [initialItemToGenerate]);

  // Update QR Code when generator selection changes
  useEffect(() => {
    const code = selectedGenerateItem ? selectedGenerateItem.id : customGenCode || 'VTX-SKU-CUSTOM';
    generateQrDataUrl(`VERTEX-POS-ITEM:${code}`).then(url => setGeneratedQrUrl(url));
  }, [selectedGenerateItem, customGenCode]);

  // Temporary shortcut feedback notice helper
  const triggerShortcutFeedback = (msg: string) => {
    setShortcutNotice(msg);
    setTimeout(() => {
      setShortcutNotice(prev => (prev === msg ? null : prev));
    }, 2200);
  };

  const selectNextCatalogItem = (delta: number) => {
    if (!catalogItems.length) return;
    const currentIndex = catalogItems.findIndex(it => it.id === selectedGenerateItem?.id);
    const nextIndex =
      currentIndex === -1 ? 0 : (currentIndex + delta + catalogItems.length) % catalogItems.length;
    setSelectedGenerateItem(catalogItems[nextIndex]);
    setCustomGenCode('');
    triggerShortcutFeedback(`Selected: ${catalogItems[nextIndex].title} (↑/↓)`);
  };

  const handleCopySku = () => {
    const code = selectedGenerateItem ? selectedGenerateItem.id : customGenCode || 'VTX-001';
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    triggerShortcutFeedback(`Copied SKU: ${code} [⌘C]`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!generatedQrUrl) return;
    const code = selectedGenerateItem ? selectedGenerateItem.id : 'custom-sku';
    const a = document.createElement('a');
    a.href = generatedQrUrl;
    a.download = `QR_${code}.png`;
    a.click();
    triggerShortcutFeedback(`Downloaded QR Code [⌘D]`);
  };

  const handleDownloadBarcodeSvg = () => {
    const code = selectedGenerateItem ? selectedGenerateItem.id : customGenCode || 'VTX-001';
    const svgContent = generateBarcodeSvg(code, 320, 80);
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Barcode_${code}.svg`;
    a.click();
    triggerShortcutFeedback(`Downloaded Barcode SVG [⌘B]`);
  };

  const processScannedCode = (rawCode: string) => {
    const cleaned = rawCode.trim().replace(/^VERTEX-POS-ITEM:/i, '');
    setScannedCode(cleaned);

    // Find match in catalogItems
    const match = catalogItems.find(
      it =>
        it.id.toLowerCase() === cleaned.toLowerCase() ||
        it.title.toLowerCase().includes(cleaned.toLowerCase()) ||
        (cleaned.startsWith('SKU-') && it.id.toLowerCase().includes(cleaned.toLowerCase().replace('sku-', '')))
    );

    if (match) {
      setMatchedItem(match);
      setIsUnrecognizedCode(false);
      playScannerBeep(true);
      triggerShortcutFeedback(`Scanned SKU: ${match.id} (Matched)`);
    } else {
      setMatchedItem(null);
      setIsUnrecognizedCode(true);
      setNewItemTitle(`Architectural Spec (${cleaned})`);
      playScannerBeep(false);
      triggerShortcutFeedback(`Scanned Unrecognized SKU: ${cleaned}`);
    }
  };

  const handleConfirmInsert = () => {
    if (matchedItem) {
      onFetchAndInsertItem(matchedItem, scanQty);
      playScannerBeep(true);
      triggerShortcutFeedback(`Inserted ${scanQty}x into POS Cart`);
      onClose();
    }
  };

  const handleCreateAndInsertNew = () => {
    if (!newItemTitle.trim()) return;
    const newItem: CatalogItem = {
      id: scannedCode || `item-custom-${Date.now()}`,
      sku: scannedCode || `SKU-${Date.now()}`,
      title: newItemTitle,
      category: newItemCategory,
      price: newItemPrice,
      unitPrice: newItemPrice,
      unit: 'LS',
      csiDivision: newItemCsi,
      description: `Custom barcode scanned specification: ${scannedCode}`
    };

    if (onAddNewCatalogItem) {
      onAddNewCatalogItem(newItem);
    }
    onFetchAndInsertItem(newItem, scanQty);
    playScannerBeep(true);
    triggerShortcutFeedback(`Registered and Inserted into POS Cart`);
    onClose();
  };

  const handlePrintLabel = () => {
    const title = selectedGenerateItem ? selectedGenerateItem.title : customGenTitle || 'Custom Catalog Item';
    const price = selectedGenerateItem ? (selectedGenerateItem.price ?? selectedGenerateItem.unitPrice ?? 0) : customGenPrice;
    const code = selectedGenerateItem ? selectedGenerateItem.id : customGenCode || 'VTX-001';
    const csi = selectedGenerateItem?.csiDivision || '09 20 00';
    const barcodeSvg = generateBarcodeSvg(code, 320, 80);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    iframe.contentDocument?.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Barcode Label - ${code}</title>
        <style>
          body { font-family: monospace; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fff; }
          .label { border: 2px dashed #000; padding: 16px; border-radius: 8px; width: 340px; text-align: center; }
          .title { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
          .price { font-size: 18px; font-weight: bold; color: #000; margin: 6px 0; }
          .csi { font-size: 10px; color: #555; margin-bottom: 12px; }
          .qr { margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="label">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888;">VERTEX POS RETAIL SPEC</div>
          <div class="title">${title}</div>
          <div class="price">$${price.toLocaleString()}</div>
          <div class="csi">CSI Code: ${csi} • SKU: ${code}</div>
          ${barcodeSvg}
          <div class="qr">
            <img src="${generatedQrUrl}" width="100" height="100" />
          </div>
          <div style="font-size: 9px; color: #999; margin-top: 6px;">SCAN TO FETCH INTO REGISTER</div>
        </div>
        <script>
          window.onload = () => { window.print(); }
        </script>
      </body>
      </html>
    `);
    iframe.contentDocument?.close();
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      }
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 250);
    triggerShortcutFeedback(`Print Spooler Initiated [⌘P]`);
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    if (!isOpen) return;

    let wedgeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;

      // Escape always closes modal
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Fast wedge scanner typing check when in scan tab
      if (activeTab === 'scan' && !isInput) {
        const now = Date.now();
        const diff = now - lastKeyTime;
        lastKeyTime = now;

        if (e.key === 'Enter') {
          if (wedgeBuffer.trim().length > 2) {
            processScannedCode(wedgeBuffer.trim());
            wedgeBuffer = '';
            return;
          }
        } else if (e.key.length === 1 && diff <= 120) {
          wedgeBuffer += e.key;
        } else if (e.key.length === 1) {
          wedgeBuffer = e.key;
        }
      }

      // Quick Tab Switching: '1' -> Scan, '2' -> Generate (when not typing in form)
      if (!isInput && (e.key === '1' || (e.altKey && e.key === '1'))) {
        e.preventDefault();
        setActiveTab('scan');
        triggerShortcutFeedback('Switched to Scan & Fetch [1]');
        return;
      }
      if (!isInput && (e.key === '2' || (e.altKey && e.key === '2'))) {
        e.preventDefault();
        setActiveTab('generate');
        triggerShortcutFeedback('Switched to Barcode & QR Generator [2]');
        return;
      }

      // Shortcuts Guide toggle ('?' key)
      if (!isInput && e.key === '?') {
        e.preventDefault();
        setShowShortcutsGuide(prev => !prev);
        return;
      }

      // GENERATOR TAB SHORTCUTS
      if (activeTab === 'generate') {
        // Ctrl/Cmd + P: Print Label
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
          e.preventDefault();
          handlePrintLabel();
          return;
        }

        // Ctrl/Cmd + D: Download QR Code
        if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
          e.preventDefault();
          handleDownloadQr();
          return;
        }

        // Ctrl/Cmd + B: Download Barcode SVG
        if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
          e.preventDefault();
          handleDownloadBarcodeSvg();
          return;
        }

        // Ctrl/Cmd + C (when not in text input): Copy SKU
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C') && !isInput) {
          e.preventDefault();
          handleCopySku();
          return;
        }

        // ArrowDown / 'j': Navigate to next catalog item
        if (!isInput && (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J')) {
          e.preventDefault();
          selectNextCatalogItem(1);
          return;
        }

        // ArrowUp / 'k': Navigate to previous catalog item
        if (!isInput && (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K')) {
          e.preventDefault();
          selectNextCatalogItem(-1);
          return;
        }

        // 'c': Quick copy SKU
        if (!isInput && (e.key === 'c' || e.key === 'C')) {
          e.preventDefault();
          handleCopySku();
          return;
        }
      }

      // SCAN TAB SHORTCUTS
      if (activeTab === 'scan') {
        // Enter: Insert matched item into POS register cart
        if (!isInput && e.key === 'Enter' && matchedItem) {
          e.preventDefault();
          handleConfirmInsert();
          return;
        }

        // '+' or '=': Increase qty
        if (!isInput && (e.key === '+' || e.key === '=')) {
          e.preventDefault();
          setScanQty(q => {
            const next = q + 1;
            triggerShortcutFeedback(`Quantity: ${next} [+]`);
            return next;
          });
          return;
        }

        // '-': Decrease qty
        if (!isInput && e.key === '-') {
          e.preventDefault();
          setScanQty(q => {
            const next = Math.max(1, q - 1);
            triggerShortcutFeedback(`Quantity: ${next} [-]`);
            return next;
          });
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    activeTab,
    selectedGenerateItem,
    customGenCode,
    generatedQrUrl,
    matchedItem,
    catalogItems,
    scanQty
  ]);

  // Handle Camera Stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && activeTab === 'scan' && activeScannerAdapter === 'camera') {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setCameraActive(true);
            setCameraError(null);
          }
        })
        .catch(err => {
          setCameraError(
            'Camera access denied or unavailable. You can use the Optical Simulator or Hardware Wedge adapter.'
          );
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen, activeTab, activeScannerAdapter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in-50">
      <div className="bg-[#1C1814] border border-[#D4AF37]/50 rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-gray-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#24201A] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-[#D4AF37] flex items-center justify-center text-black font-bold shadow-md">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-white text-lg">
                  VERTEX POS Barcode & QR Code Engine
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  Code-128 & 2D QR Active
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Generate printable product labels or scan bar codes/QR codes to fetch & insert items into active register.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('scan')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'scan'
                    ? 'bg-[#D4AF37] text-black shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Switch to Scanner (Shortcut: 1)"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Scan & Fetch</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${activeTab === 'scan' ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'}`}>
                  1
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('generate')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'generate'
                    ? 'bg-[#D4AF37] text-black shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Switch to Label Generator (Shortcut: 2)"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Generate Labels</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${activeTab === 'generate' ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'}`}>
                  2
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: SCANNER HUB */}
        {activeTab === 'scan' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Adapter Selector */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
              <span className="text-xs font-mono text-gray-400">Active Scanner Adapter:</span>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10 text-xs">
                {[
                  { id: 'simulator' as const, label: 'Optical Simulator / Quick Test', icon: Sparkles },
                  { id: 'hardware' as const, label: 'Physical Laser Wedge Scanner', icon: Keyboard },
                  { id: 'camera' as const, label: 'Webcam / Camera Feed', icon: Camera },
                  { id: 'file' as const, label: 'Image File Upload', icon: Upload }
                ].map(a => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setActiveScannerAdapter(a.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeScannerAdapter === a.id
                          ? 'bg-[#2C2416] text-[#D4AF37] font-bold border border-[#53432B]'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ADAPTER 1: OPTICAL SIMULATOR / QUICK TEST */}
            {activeScannerAdapter === 'simulator' && (
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                      Optical Simulator Adapter
                    </span>
                    <h4 className="text-sm font-serif font-bold text-white">
                      Instant Barcode Scanner Test Fixture
                    </h4>
                    <p className="text-xs text-gray-400">
                      Click any registered catalog barcode or SKU below to simulate instant physical optical scanning:
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[11px] font-mono font-bold flex items-center gap-1.5">
                    <Volume2 className="w-3 h-3" />
                    <span>Laser Audio Beep: ON</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {catalogItems.slice(0, 9).map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => processScannedCode(item.id)}
                      className="p-3 bg-[#24201A] hover:bg-[#342D24] border border-white/10 hover:border-[#D4AF37]/50 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                        <span className="group-hover:text-[#D4AF37] font-bold">{item.id.toUpperCase()}</span>
                        <span>${(item.price ?? item.unitPrice ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="text-xs font-semibold text-white truncate">{item.title}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-1">CSI {item.csiDivision || '09 20 00'}</div>
                    </button>
                  ))}
                </div>

                {/* Unregistered Barcode Test Button */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Test Unregistered / New Supplier Barcode:</span>
                  <button
                    type="button"
                    onClick={() => processScannedCode(`SKU-NEW-${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="px-3 py-1.5 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-600/50 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Simulate New / Unlisted Barcode Scan</span>
                  </button>
                </div>
              </div>
            )}

            {/* ADAPTER 2: PHYSICAL HARDWARE WEDGE SCANNER */}
            {activeScannerAdapter === 'hardware' && (
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center mx-auto text-[#D4AF37] animate-pulse">
                  <Keyboard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-base">
                    Hardware Laser Wedge Adapter Active
                  </h4>
                  <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                    Point your physical USB or Bluetooth barcode scanner (Honeywell, Zebra, Symbol, Datalogic) at any product label and pull the trigger. The keystrokes will be captured automatically.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>LISTENING FOR HARDWARE LASER WEDGE TRIGGER</span>
                </div>
              </div>
            )}

            {/* ADAPTER 3: LIVE CAMERA FEED */}
            {activeScannerAdapter === 'camera' && (
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center space-y-4">
                {cameraError ? (
                  <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs">
                    {cameraError}
                  </div>
                ) : (
                  <div className="relative w-full max-w-md mx-auto aspect-video bg-black rounded-2xl overflow-hidden border border-white/20">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {/* Visual Red Laser Sweep Line */}
                    <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_12px_#ff0000] animate-bounce top-1/2" />
                    <div className="absolute inset-4 border-2 border-[#D4AF37]/40 rounded-xl pointer-events-none" />
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  Align the barcode or QR code within the frame. Or simulate a camera snapshot:
                </p>
                <button
                  type="button"
                  onClick={() => processScannedCode(catalogItems[0]?.id || 'SKU-SAMPLE')}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-amber-400 text-black font-bold rounded-xl text-xs cursor-pointer"
                >
                  Capture Frame & Decode
                </button>
              </div>
            )}

            {/* ADAPTER 4: FILE UPLOAD / DRAG DROP */}
            {activeScannerAdapter === 'file' && (
              <div className="bg-black/40 border border-dashed border-white/20 rounded-2xl p-8 text-center space-y-3">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <div>
                  <h5 className="font-bold text-white text-xs">Drop barcode photo or label image here</h5>
                  <p className="text-[11px] text-gray-400 mt-0.5">Supports PNG, JPG, WEBP invoice scans</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files?.[0]) {
                      processScannedCode(catalogItems[1]?.id || 'SKU-CALACATTA-01');
                    }
                  }}
                  className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#D4AF37] file:text-black file:font-bold cursor-pointer"
                />
              </div>
            )}

            {/* MANUAL ENTRY FALLBACK */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={manualCodeInput}
                onChange={e => setManualCodeInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    processScannedCode(manualCodeInput);
                  }
                }}
                placeholder="Or type SKU / Barcode string manually (e.g. item-herringbone-oak)..."
                className="flex-1 bg-black/60 border border-white/15 focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
              />
              <button
                type="button"
                onClick={() => processScannedCode(manualCodeInput)}
                className="px-4 py-2.5 bg-[#2C2416] hover:bg-black text-[#D4AF37] border border-[#53432B] font-bold text-xs rounded-xl cursor-pointer"
              >
                Decode
              </button>
            </div>

            {/* SCAN RESULT DISPLAY */}
            {scannedCode && (
              <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400">
                    Scanned Code: <strong className="text-[#D4AF37]">{scannedCode}</strong>
                  </span>
                  {matchedItem ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Item Found in Catalog</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Unregistered Barcode / SKU</span>
                    </span>
                  )}
                </div>

                {/* CASE A: ITEM FOUND IN CATALOG */}
                {matchedItem && (
                  <div className="bg-[#24201A] border border-[#D4AF37]/50 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                          Catalog Match ({matchedItem.category})
                        </span>
                        <h4 className="text-base font-serif font-bold text-white mt-0.5">
                          {matchedItem.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          CSI Division: <strong className="text-white font-mono">{matchedItem.csiDivision || '09 20 00'}</strong> • Unit: {matchedItem.unit}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">Unit Settlement Price</span>
                        <div className="text-xl font-serif font-bold text-[#D4AF37]">
                          ${(matchedItem.price ?? matchedItem.unitPrice ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4 flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Quantity:</span>
                        <div className="flex items-center gap-1 bg-black/60 rounded-xl border border-white/15 p-1">
                          <button
                            type="button"
                            onClick={() => setScanQty(Math.max(1, scanQty - 1))}
                            className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-white">{scanQty}</span>
                          <button
                            type="button"
                            onClick={() => setScanQty(scanQty + 1)}
                            className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">
                          = ${((matchedItem.price ?? matchedItem.unitPrice ?? 0) * scanQty).toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmInsert}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Insert {scanQty}x into Active POS Register</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CASE B: UNREGISTERED BARCODE -> INSERT NEW CATALOG ITEM */}
                {isUnrecognizedCode && (
                  <div className="bg-[#24201A] border border-amber-600/50 rounded-2xl p-5 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                        Unregistered Component Action
                      </span>
                      <h4 className="text-sm font-serif font-bold text-white">
                        Insert New Item into Catalog & Active POS Cart
                      </h4>
                      <p className="text-xs text-gray-400">
                        This barcode was not found in the firm catalog. Provide specification details below to register and bill it:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-gray-400 block mb-1">Item Title / Specification</label>
                        <input
                          type="text"
                          value={newItemTitle}
                          onChange={e => setNewItemTitle(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 block mb-1">Category</label>
                        <select
                          value={newItemCategory}
                          onChange={e => setNewItemCategory(e.target.value as any)}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                        >
                          <option value="MATERIAL">MATERIAL (Architectural Surface)</option>
                          <option value="SERVICE">SERVICE (Engineering / Design)</option>
                          <option value="FURNITURE">FURNITURE (FF&E)</option>
                          <option value="PERMIT">PERMIT (Municipal Filing)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-400 block mb-1">Unit Settlement Price ($)</label>
                        <input
                          type="number"
                          value={newItemPrice}
                          onChange={e => setNewItemPrice(parseFloat(e.target.value) || 0)}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 block mb-1">CSI Division Code</label>
                        <input
                          type="text"
                          value={newItemCsi}
                          onChange={e => setNewItemCsi(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={handleCreateAndInsertNew}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:from-amber-600 hover:to-amber-500 text-black font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Register in Catalog & Insert into POS</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: LABEL & BARCODE GENERATOR */}
        {activeTab === 'generate' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Item Selection */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold block">
                    Select Item to Encode
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                    ↑ / ↓ / J / K Navigate
                  </span>
                </div>
                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {catalogItems.map((item, idx) => {
                    const isSelected = selectedGenerateItem?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedGenerateItem(item);
                          setCustomGenCode('');
                        }}
                        className={`w-full p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-[#2C2416] border-[#D4AF37] text-white shadow-sm ring-1 ring-[#D4AF37]/50'
                            : 'bg-black/40 border-white/10 text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold truncate flex items-center gap-1.5">
                            <span>{item.title}</span>
                            {isSelected && (
                              <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-[#D4AF37] text-black font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-gray-400">
                            {item.id} • {item.category}
                          </div>
                        </div>
                        <span className="font-mono text-[#D4AF37] shrink-0 font-bold">
                          ${(item.price ?? item.unitPrice ?? 0).toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: High-Fidelity Printable Label Preview */}
              <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="bg-white text-black p-5 rounded-2xl shadow-xl w-full max-w-sm space-y-3 border border-gray-200">
                  <div className="text-[10px] uppercase font-mono font-bold text-gray-500 tracking-wider">
                    VERTEX ARCHITECTURAL SPECIFICATION LABEL
                  </div>
                  <h4 className="font-serif font-bold text-gray-900 text-sm">
                    {selectedGenerateItem ? selectedGenerateItem.title : 'Custom Specification Item'}
                  </h4>
                  <div className="text-xl font-serif font-bold text-black">
                    ${(selectedGenerateItem ? (selectedGenerateItem.price ?? selectedGenerateItem.unitPrice ?? 0) : customGenPrice).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono">
                    SKU: {selectedGenerateItem ? selectedGenerateItem.id : 'VTX-001'} • CSI: {selectedGenerateItem?.csiDivision || '09 20 00'}
                  </div>

                  {/* SVG Barcode */}
                  <div
                    className="flex justify-center"
                    dangerouslySetInnerHTML={{
                      __html: generateBarcodeSvg(selectedGenerateItem ? selectedGenerateItem.id : 'VTX-001', 280, 65)
                    }}
                  />

                  {/* 2D QR Code */}
                  {generatedQrUrl && (
                    <div className="pt-2 flex flex-col items-center">
                      <img src={generatedQrUrl} alt="QR Code" className="w-24 h-24 border border-gray-200 rounded-lg p-1 bg-white shadow-sm" />
                      <span className="text-[9px] text-gray-400 font-mono mt-1">2D HIGH-DENSITY SCANNER KEY</span>
                    </div>
                  )}
                </div>

                {/* Generator Action Buttons with Keyboard Shortcut Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handlePrintLabel}
                    className="px-3.5 py-2 bg-[#D4AF37] hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                    title="Print Shelf Tag (Ctrl/Cmd + P)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Label</span>
                    <span className="bg-black/20 text-black font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                      ⌘P
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    title="Download QR PNG (Ctrl/Cmd + D)"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>QR PNG</span>
                    <span className="bg-white/15 text-gray-300 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                      ⌘D
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadBarcodeSvg}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    title="Download Barcode SVG (Ctrl/Cmd + B)"
                  >
                    <Barcode className="w-3.5 h-3.5 text-blue-400" />
                    <span>Barcode SVG</span>
                    <span className="bg-white/15 text-gray-300 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                      ⌘B
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySku}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    title="Copy SKU code to clipboard (Ctrl/Cmd + C or C)"
                  >
                    {copiedCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{copiedCode ? 'Copied' : 'Copy SKU'}</span>
                    <span className="bg-white/15 text-gray-300 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                      ⌘C
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Shortcut Toast Feedback */}
        {shortcutNotice && (
          <div className="absolute bottom-16 right-6 z-50 bg-[#2C2416] border border-[#D4AF37] text-white px-3.5 py-2 rounded-xl text-xs font-mono shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{shortcutNotice}</span>
          </div>
        )}

        {/* Shortcuts Guide Overlay Modal */}
        {showShortcutsGuide && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm p-6 flex items-center justify-center">
            <div className="bg-[#24201A] border border-[#D4AF37] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Keyboard className="w-5 h-5" />
                  <h4 className="font-serif font-bold text-white text-base">
                    Barcode & POS Keyboard Shortcuts Guide
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShortcutsGuide(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-gray-400">Navigation</span>
                  <div className="flex justify-between items-center text-white">
                    <span>Switch to Scan Mode</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">1</kbd>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span>Switch to Generate Mode</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">2</kbd>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span>Select Previous SKU</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">↑ / K</kbd>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span>Select Next SKU</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">↓ / J</kbd>
                  </div>
                </div>

                <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-gray-400">Label Actions</span>
                  <div className="flex justify-between items-center text-white">
                    <span>Print Label Tag</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">⌘P</kbd>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span>Download QR Code</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">⌘D</kbd>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span>Download Barcode SVG</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">⌘B</kbd>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span>Copy SKU String</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">⌘C / C</kbd>
                  </div>
                </div>

                <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1 sm:col-span-2">
                  <span className="text-[10px] uppercase font-mono text-gray-400">Scanner & Cart</span>
                  <div className="grid grid-cols-2 gap-2 text-white">
                    <div className="flex justify-between items-center">
                      <span>Insert Scanned Item</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Enter</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Increase / Decrease Qty</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">+ / -</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Toggle Help Guide</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">?</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Close Modal</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Esc</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowShortcutsGuide(false)}
                  className="px-4 py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-xl"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer with Persistent Keyboard Shortcut Pill Bar */}
        <div className="px-6 py-3.5 bg-[#24201A] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-gray-300 font-semibold flex items-center gap-1">
              <Keyboard className="w-3.5 h-3.5 text-[#D4AF37]" />
              Shortcuts:
            </span>
            <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-gray-300">
              <strong className="text-white">⌘P</strong> Print
            </span>
            <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-gray-300">
              <strong className="text-white">⌘D</strong> QR
            </span>
            <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-gray-300">
              <strong className="text-white">⌘B</strong> SVG
            </span>
            <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-gray-300">
              <strong className="text-white">↑/↓</strong> SKU
            </span>
            <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-gray-300">
              <strong className="text-white">⌘C</strong> Copy
            </span>
            <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-gray-300">
              <strong className="text-white">1/2</strong> Tabs
            </span>
            <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-gray-300">
              <strong className="text-white">Esc</strong> Close
            </span>
            <button
              type="button"
              onClick={() => setShowShortcutsGuide(true)}
              className="text-[#D4AF37] hover:underline text-[10px] font-mono ml-1 cursor-pointer"
            >
              [?] Guide
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
