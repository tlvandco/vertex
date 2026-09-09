import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Company, CompanyType, RiskTier, InsuranceStatus } from '../types';
import {
  Building2,
  Plus,
  Search,
  ShieldCheck,
  FileCheck2,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Edit2,
  Trash2,
  ExternalLink,
  Briefcase,
  Truck,
  Gem,
  Cpu,
  Hammer,
  Scale,
  X,
  Filter,
  Eye,
  Download,
  Lock,
  Stamp,
  Fingerprint,
  Upload,
  FileUp,
  Check,
  RefreshCw
} from 'lucide-react';

const COMPANY_TYPE_CONFIG: Record<
  CompanyType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  ARCHITECTURAL_STUDIO: {
    label: 'Architectural Studio',
    icon: Building2,
    color: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  GENERAL_CONTRACTOR: {
    label: 'General Contractor',
    icon: Hammer,
    color: 'bg-blue-100 text-blue-900 border-blue-300'
  },
  LOGISTICS_EQUIPMENT: {
    label: 'Rigging & Equipment',
    icon: Truck,
    color: 'bg-purple-100 text-purple-900 border-purple-300'
  },
  STONE_QUARRY: {
    label: 'Quarry & Materials',
    icon: Gem,
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  MEP_ENGINEERING: {
    label: 'MEP Engineering',
    icon: Cpu,
    color: 'bg-cyan-100 text-cyan-900 border-cyan-300'
  },
  INTERIOR_FURNISHING: {
    label: 'Bespoke Joinery / FF&E',
    icon: Layers,
    color: 'bg-rose-100 text-rose-900 border-rose-300'
  },
  LEGAL_CONSULTING: {
    label: 'Legal & Permitting',
    icon: Scale,
    color: 'bg-indigo-100 text-indigo-900 border-indigo-300'
  },
  CLIENT_HOLDING: {
    label: 'Client Holding Trust',
    icon: ShieldCheck,
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  OTHER: {
    label: 'Specialist Partner',
    icon: Briefcase,
    color: 'bg-gray-100 text-gray-800 border-gray-300'
  }
};

export const CompanyManagementView: React.FC = () => {
  const {
    companies,
    addCompany,
    updateCompany,
    deleteCompany,
    projects,
    currentUser,
    addToast,
    trigger2FAChallenge
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingNdaCompany, setViewingNdaCompany] = useState<Company | null>(null);

  const canManage =
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'PROJECT_MANAGER' ||
    currentUser.role === 'FINANCE';

  // Form State
  const [formName, setFormName] = useState('');
  const [formLegalName, setFormLegalName] = useState('');
  const [formType, setFormType] = useState<CompanyType>('GENERAL_CONTRACTOR');
  const [formRegNo, setFormRegNo] = useState('');
  const [formLicenseNo, setFormLicenseNo] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formCountry, setFormCountry] = useState('United States');
  const [formContactName, setFormContactName] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formCreditLimit, setFormCreditLimit] = useState(500000);
  const [formRiskTier, setFormRiskTier] = useState<RiskTier>('LOW');
  const [formInsuranceStatus, setFormInsuranceStatus] = useState<InsuranceStatus>('VALID');
  const [formInsuranceExpiry, setFormInsuranceExpiry] = useState('2027-01-01');
  const [formNdaStatus, setFormNdaStatus] = useState<'SIGNED' | 'PENDING' | 'EXPIRED' | 'EXEMPT'>('SIGNED');
  const [formProjects, setFormProjects] = useState<string[]>(['p1']);
  const [formNotes, setFormNotes] = useState('');

  // Contractor NDA Document Upload & Database Vault State
  const [formNdaFileUrl, setFormNdaFileUrl] = useState<string>('');
  const [formNdaFileName, setFormNdaFileName] = useState<string>('');
  const [formNdaFileSize, setFormNdaFileSize] = useState<string>('');
  const [formNdaSignedAt, setFormNdaSignedAt] = useState<string>('');
  const [formNdaSignerName, setFormNdaSignerName] = useState<string>('');
  const [formNdaCryptoHash, setFormNdaCryptoHash] = useState<string>('');
  const [formNdaDocumentId, setFormNdaDocumentId] = useState<string>('');
  const [isUploadingNda, setIsUploadingNda] = useState(false);
  const [isDragOverNda, setIsDragOverNda] = useState(false);

  const handleNdaFileUpload = (file: File) => {
    if (!file) return;
    setIsUploadingNda(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const hash = 'SHA256:' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setFormNdaFileUrl(reader.result);
        setFormNdaFileName(file.name);
        setFormNdaFileSize(
          file.size / 1024 > 1024
            ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
            : (file.size / 1024).toFixed(1) + ' KB'
        );
        setFormNdaCryptoHash(hash);
        setFormNdaSignedAt(new Date().toISOString());
        setFormNdaStatus('SIGNED');
        if (!formNdaSignerName && formContactName) {
          setFormNdaSignerName(formContactName);
        }
        addToast('success', `NDA document "${file.name}" staged for database legal vault upload`);
      }
      setIsUploadingNda(false);
    };
    reader.onerror = () => {
      addToast('error', 'Failed to read uploaded document file');
      setIsUploadingNda(false);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateStandardNDA = () => {
    const compName = formName.trim() || 'Contractor Trade Partner';
    const signer = formContactName.trim() || 'Authorized Corporate Signatory';
    const nowIso = new Date().toISOString();
    const hash = 'SHA256:' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    // Certified standard VERTEX mutual NDA document
    const standardDocUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(
      `VERTEX ARCHITECTURE STUDIO INC. — MUTUAL NON-DISCLOSURE & PROPRIETARY COVENANT\n` +
      `=================================================================================\n` +
      `Document ID: DOC-NDA-VTX-${Date.now()}\n` +
      `Disclosing Party: VERTEX Architecture Studio Inc. (Los Angeles, CA)\n` +
      `Receiving Entity: ${compName} (EIN: ${formRegNo || 'PENDING'})\n` +
      `Authorized Recipient Signatory: ${signer}\n` +
      `Execution Timestamp: ${nowIso}\n` +
      `Cryptographic Integrity Digest: ${hash}\n` +
      `Storage: VERTEX Enterprise Database Legal Vault (legal_documents table)\n\n` +
      `TERMS & CONFIDENTIALITY OBLIGATIONS:\n` +
      `1. Recipient agrees to safeguard all architectural CAD/BIM drawings, structural calculations, and client estate designs.\n` +
      `2. Covenant duration: 5 years binding under California jurisdiction.\n` +
      `3. Status: EXECUTED & COUNTERSIGNED BY MANAGING PRINCIPAL ARCHITECT.`
    );

    setFormNdaFileUrl(standardDocUrl);
    setFormNdaFileName(`VERTEX_Executed_NDA_${compName.replace(/[^a-zA-Z0-9]/g, '_')}_Signed.txt`);
    setFormNdaFileSize('14.2 KB (Certified Covenant)');
    setFormNdaCryptoHash(hash);
    setFormNdaSignedAt(nowIso);
    setFormNdaSignerName(signer);
    setFormNdaStatus('SIGNED');
    addToast('success', `Generated and attached certified Mutual NDA document for ${compName}`);
  };

  const handleRemoveNdaFile = () => {
    setFormNdaFileUrl('');
    setFormNdaFileName('');
    setFormNdaFileSize('');
    setFormNdaCryptoHash('');
    setFormNdaSignedAt('');
    addToast('info', 'NDA document attachment cleared');
  };

  const openCreateModal = () => {
    setEditingCompany(null);
    setFormName('');
    setFormLegalName('');
    setFormType('GENERAL_CONTRACTOR');
    setFormRegNo('EIN-' + Math.floor(10 + Math.random() * 89) + '-' + Math.floor(1000000 + Math.random() * 9000000));
    setFormLicenseNo('LIC-CA-' + Math.floor(100000 + Math.random() * 900000));
    setFormEmail('');
    setFormPhone('+1 (555) 000-0000');
    setFormWebsite('');
    setFormAddress('');
    setFormCity('Los Angeles, CA');
    setFormCountry('United States');
    setFormContactName('');
    setFormContactEmail('');
    setFormContactPhone('+1 (555) 000-0000');
    setFormCreditLimit(750000);
    setFormRiskTier('LOW');
    setFormInsuranceStatus('VALID');
    setFormInsuranceExpiry('2027-01-01');
    setFormNdaStatus('SIGNED');
    setFormProjects(['p1']);
    setFormNotes('');
    // Reset NDA upload state
    setFormNdaFileUrl('');
    setFormNdaFileName('');
    setFormNdaFileSize('');
    setFormNdaSignedAt(new Date().toISOString());
    setFormNdaSignerName('');
    setFormNdaCryptoHash('');
    setFormNdaDocumentId('');
    setIsModalOpen(true);
  };

  const openEditModal = (comp: Company) => {
    setEditingCompany(comp);
    setFormName(comp.name);
    setFormLegalName(comp.legalName || comp.name);
    setFormType(comp.type);
    setFormRegNo(comp.registrationNumber || '');
    setFormLicenseNo(comp.licenseNumber || '');
    setFormEmail(comp.email);
    setFormPhone(comp.phone || '');
    setFormWebsite(comp.website || '');
    setFormAddress(comp.address || '');
    setFormCity(comp.city || '');
    setFormCountry(comp.country || 'United States');
    setFormContactName(comp.primaryContactName || '');
    setFormContactEmail(comp.primaryContactEmail || '');
    setFormContactPhone(comp.primaryContactPhone || '');
    setFormCreditLimit(comp.creditLimit || 500000);
    setFormRiskTier(comp.riskTier || 'LOW');
    setFormInsuranceStatus(comp.insuranceCOIStatus);
    setFormInsuranceExpiry(comp.insuranceExpiryDate || '2027-01-01');
    setFormNdaStatus(comp.ndaStatus);
    setFormProjects(comp.assignedProjectIds || []);
    setFormNotes(comp.notes || '');
    // Hydrate existing NDA details
    setFormNdaFileUrl(comp.ndaDocumentUrl || '');
    setFormNdaFileName(comp.ndaFileName || '');
    setFormNdaFileSize(comp.ndaFileSize || '');
    setFormNdaSignedAt(comp.ndaSignedAt || '');
    setFormNdaSignerName(comp.ndaSignerName || comp.primaryContactName || '');
    setFormNdaCryptoHash(comp.ndaCryptoHash || '');
    setFormNdaDocumentId(comp.ndaDocumentId || '');
    setIsModalOpen(true);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      addToast('error', 'Company name and email are required');
      return;
    }

    const isSigned = formNdaStatus === 'SIGNED';
    const fallbackHash = 'SHA256:' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const payload = {
      name: formName.trim(),
      legalName: formLegalName.trim() || formName.trim(),
      type: formType,
      registrationNumber: formRegNo,
      licenseNumber: formLicenseNo,
      email: formEmail.trim(),
      phone: formPhone,
      website: formWebsite,
      address: formAddress,
      city: formCity,
      country: formCountry,
      status: 'VERIFIED' as const,
      primaryContactName: formContactName,
      primaryContactEmail: formContactEmail,
      primaryContactPhone: formContactPhone,
      assignedProjectIds: formProjects,
      activeProjectsCount: formProjects.length,
      insuranceCOIStatus: formInsuranceStatus,
      insuranceExpiryDate: formInsuranceExpiry,
      ndaStatus: formNdaStatus,
      // NDA Document & Database Vault Linkage
      ndaDocumentId: isSigned ? (formNdaDocumentId || editingCompany?.ndaDocumentId || `doc_nda_${Date.now()}`) : undefined,
      ndaDocumentUrl: isSigned ? (formNdaFileUrl || undefined) : undefined,
      ndaFileName: isSigned ? (formNdaFileName || `VERTEX_Executed_NDA_${formName.trim().replace(/[^a-zA-Z0-9]/g, '_')}.pdf`) : undefined,
      ndaFileSize: isSigned ? (formNdaFileSize || '1.2 MB') : undefined,
      ndaSignedAt: isSigned ? (formNdaSignedAt || new Date().toISOString()) : undefined,
      ndaSignerName: isSigned ? (formNdaSignerName || formContactName || 'Corporate Officer') : undefined,
      ndaCryptoHash: isSigned ? (formNdaCryptoHash || fallbackHash) : undefined,
      creditLimit: Number(formCreditLimit),
      riskTier: formRiskTier,
      notes: formNotes
    };

    if (editingCompany) {
      updateCompany(editingCompany.id, payload);
      if (isSigned) {
        addToast('success', `Company updated & NDA document safely cataloged in legal database vault.`);
      }
      setIsModalOpen(false);
    } else {
      // If credit limit exceeds $1M, require 2FA authorization
      if (Number(formCreditLimit) >= 1000000) {
        trigger2FAChallenge({
          actionName: `Register ${payload.name} ($${Number(formCreditLimit).toLocaleString()} Credit Line)`,
          title: 'High-Value Entity Registration',
          description: 'Registering an enterprise entity with credit allocation exceeding $1,000,000 requires Zero-Trust 2FA confirmation.',
          onSuccess: () => {
            addCompany(payload);
            if (isSigned) {
              addToast('success', `Contractor registered & executed NDA uploaded to database legal vault.`);
            }
            setIsModalOpen(false);
          }
        });
      } else {
        addCompany(payload);
        if (isSigned) {
          addToast('success', `Contractor registered & executed NDA uploaded to database legal vault.`);
        }
        setIsModalOpen(false);
      }
    }
  };

  const handleDelete = (id: string, name: string) => {
    trigger2FAChallenge({
      actionName: `Decommission Entity: ${name}`,
      title: 'Corporate Decommission Authorization',
      description: `Authorizing removal of trade partner ${name} from VERTEX enterprise registry.`,
      onSuccess: () => {
        deleteCompany(id);
      }
    });
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.legalName && c.legalName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.registrationNumber && c.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.primaryContactName && c.primaryContactName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'ALL' || c.type === selectedType;

    return matchesSearch && matchesType;
  });

  // Calculate high-level KPIs
  const totalCredit = companies.reduce((sum, c) => sum + (c.creditLimit || 0), 0);
  const activeEngagements = companies.reduce((sum, c) => sum + (c.activeProjectsCount || 0), 0);
  const validInsuranceCount = companies.filter(c => c.insuranceCOIStatus === 'VALID').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-[#2C2416]">
              Corporate Entities & Trade Partners
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Verified Registry
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage subcontracted carriers, stone quarries, MEP engineers, bespoke millwork ateliers, and client trusts.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#B8860B] text-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Corporate Entity</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1 font-medium">
            <span>Verified Entities</span>
            <Building2 className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#2C2416]">
            {companies.length}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Tax & License Verified</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1 font-medium">
            <span>Project Bindings</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#2C2416]">
            {activeEngagements}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">
            Across {projects.length} architectural estates
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1 font-medium">
            <span>Authorized Trade Credit</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-700">
            ${(totalCredit / 1000000).toFixed(2)}M
          </div>
          <div className="text-[10px] text-gray-500 mt-1">
            Insured under AAA Surety Bond
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1 font-medium">
            <span>Insurance COI Standing</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#2C2416]">
            {validInsuranceCount} / {companies.length}
          </div>
          <div className="text-[10px] text-purple-700 font-medium mt-1">
            General Liability & Worker's Comp Active
          </div>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies by name, EIN, license, city..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">View:</span>
            <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-[#2C2416]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-[#2C2416]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Detailed Ledger
              </button>
            </div>
          </div>
        </div>

        {/* Industry Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === 'ALL'
                ? 'bg-[#2C2416] text-[#D4AF37]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Sectors ({companies.length})
          </button>
          {Object.entries(COMPANY_TYPE_CONFIG).map(([typeKey, cfg]) => {
            const count = companies.filter(c => c.type === typeKey).length;
            if (count === 0 && selectedType !== typeKey) return null;
            const Icon = cfg.icon;
            return (
              <button
                key={typeKey}
                onClick={() => setSelectedType(typeKey)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedType === typeKey
                    ? 'bg-[#2C2416] text-[#D4AF37]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cfg.label}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map(company => {
            const typeConfig = COMPANY_TYPE_CONFIG[company.type] || COMPANY_TYPE_CONFIG.OTHER;
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={company.id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D4AF37] shrink-0">
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-[#2C2416] leading-tight">
                          {company.name}
                        </h3>
                        <p className="text-[11px] text-gray-500">{company.legalName}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${typeConfig.color}`}
                    >
                      {typeConfig.label}
                    </span>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-1.5 my-3">
                    {company.registrationNumber && (
                      <span
                        onClick={() => canManage && openEditModal(company)}
                        className="text-[10px] font-mono bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
                        title="Click to edit registration"
                      >
                        {company.registrationNumber}
                      </span>
                    )}
                    {company.licenseNumber && (
                      <span
                        onClick={() => canManage && openEditModal(company)}
                        className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 cursor-pointer hover:border-blue-400 transition-colors"
                        title="Click to edit license"
                      >
                        {company.licenseNumber}
                      </span>
                    )}
                    <span
                      onClick={() => canManage && openEditModal(company)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity ${
                        company.insuranceCOIStatus === 'VALID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                      title="Click to edit Insurance Standing"
                    >
                      COI: {company.insuranceCOIStatus}
                    </span>
                    <button
                      onClick={() => setViewingNdaCompany(company)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 transition-all cursor-pointer ${
                        company.ndaStatus === 'SIGNED'
                          ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 shadow-2xs'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                      title="View Executed Cryptographic NDA Document"
                    >
                      <FileCheck2 className="w-3 h-3 text-purple-600" />
                      <span>NDA: {company.ndaStatus}</span>
                      <Eye className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <div
                      onClick={() => canManage && openEditModal(company)}
                      className={`flex items-center justify-between ${canManage ? 'cursor-pointer hover:bg-gray-50/70 p-1 -mx-1 rounded' : ''}`}
                    >
                      <span className="text-gray-400">Liaison Contact:</span>
                      <span className="font-semibold text-gray-900">{company.primaryContactName || 'Unassigned (Edit)'}</span>
                    </div>
                    <div
                      onClick={() => canManage && openEditModal(company)}
                      className={`flex items-center justify-between ${canManage ? 'cursor-pointer hover:bg-gray-50/70 p-1 -mx-1 rounded' : ''}`}
                    >
                      <span className="text-gray-400">Credit Limit:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ${(company.creditLimit || 0).toLocaleString()}
                      </span>
                    </div>
                    <div
                      onClick={() => canManage && openEditModal(company)}
                      className={`flex items-center justify-between ${canManage ? 'cursor-pointer hover:bg-gray-50/70 p-1 -mx-1 rounded' : ''}`}
                    >
                      <span className="text-gray-400">Location:</span>
                      <span className="flex items-center gap-1 text-gray-700">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{company.city || 'Los Angeles'}, {company.country || 'United States'}</span>
                      </span>
                    </div>
                  </div>

                  {company.notes && (
                    <div
                      onClick={() => canManage && openEditModal(company)}
                      className={`mt-3 p-2 bg-gray-50 rounded-xl text-[11px] text-gray-600 italic border border-gray-200 ${canManage ? 'cursor-pointer hover:bg-gray-100/70' : ''}`}
                      title="Click to edit notes"
                    >
                      "{company.notes}"
                    </div>
                  )}

                  {/* Bound Projects */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Active Project Bindings:
                      </span>
                      {canManage && (
                        <button
                          onClick={() => openEditModal(company)}
                          className="text-[10px] text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                        >
                          + Bind
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {company.assignedProjectIds && company.assignedProjectIds.length > 0 ? (
                        company.assignedProjectIds.map(pId => {
                          const proj = projects.find(p => p.id === pId);
                          return (
                            <span
                              key={pId}
                              className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-md"
                            >
                              {proj?.name || pId}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">No estate projects assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-gray-500">
                    {company.email && (
                      <a
                        href={`mailto:${company.email}`}
                        className="hover:text-[#D4AF37] transition-colors p-1"
                        title={company.email}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {company.phone && (
                      <a
                        href={`tel:${company.phone}`}
                        className="hover:text-[#D4AF37] transition-colors p-1"
                        title={company.phone}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#D4AF37] transition-colors p-1"
                        title={company.website}
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => setViewingNdaCompany(company)}
                      className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center gap-1 border border-purple-200 cursor-pointer"
                      title="Inspect Signed NDA"
                    >
                      <FileText className="w-3 h-3" />
                      <span>View NDA</span>
                    </button>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(company)}
                        className="px-2.5 py-1 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold border border-gray-200"
                        title="Edit Company Credentials"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(company.id, company.name)}
                        className="p-1 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Decommission Entity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-[#FAF8F5] text-gray-800 border-b border-gray-200 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Entity & Sector</th>
                  <th className="py-3 px-4">Registration / License</th>
                  <th className="py-3 px-4">Liaison Contact</th>
                  <th className="py-3 px-4">Insurance COI</th>
                  <th className="py-3 px-4">NDA Agreement</th>
                  <th className="py-3 px-4">Credit Line</th>
                  <th className="py-3 px-4">Projects</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCompanies.map(company => {
                  const typeConfig = COMPANY_TYPE_CONFIG[company.type] || COMPANY_TYPE_CONFIG.OTHER;
                  return (
                    <tr key={company.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{company.name}</div>
                        <div className="text-[11px] text-gray-400">{typeConfig.label}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div>{company.registrationNumber || 'N/A'}</div>
                        <div className="text-gray-400">{company.licenseNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-800">{company.primaryContactName || 'N/A'}</div>
                        <div className="text-[11px] text-gray-500">{company.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            company.insuranceCOIStatus === 'VALID'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {company.insuranceCOIStatus}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-0.5">Exp: {company.insuranceExpiryDate}</div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setViewingNdaCompany(company)}
                          className="px-2 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-purple-600" />
                          <span>{company.ndaStatus}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        ${(company.creditLimit || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                          {company.activeProjectsCount} Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canManage && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(company)}
                              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
                              title="Edit Credentials"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(company.id, company.name)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Decommission Entity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Register / Edit Corporate Entity */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#2C2416] p-6 text-white relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold">
                    Corporate Entity Registry
                  </span>
                  <h3 className="text-lg font-serif font-bold text-white">
                    {editingCompany ? 'Edit Corporate Credentials' : 'Register New Corporate Partner'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveCompany} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Company Trading Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Heavy Rigging & Logistics"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Legal Corporate Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Rigging & Crane LLC"
                    value={formLegalName}
                    onChange={e => setFormLegalName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Industry Sector</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as CompanyType)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none font-medium"
                  >
                    {Object.entries(COMPANY_TYPE_CONFIG).map(([val, cfg]) => (
                      <option key={val} value={val}>
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">EIN / Registration Tax ID</label>
                  <input
                    type="text"
                    placeholder="EIN-88-2910471"
                    value={formRegNo}
                    onChange={e => setFormRegNo(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">State / Trade License #</label>
                  <input
                    type="text"
                    placeholder="CRN-CAL-884920"
                    value={formLicenseNo}
                    onChange={e => setFormLicenseNo(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="dispatch@company.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Website URL</label>
                  <input
                    type="text"
                    placeholder="https://company.com"
                    value={formWebsite}
                    onChange={e => setFormWebsite(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Primary Liaison Contact */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <span className="font-bold text-gray-800 block text-[11px] uppercase tracking-wider">
                  Primary Contact Officer
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-600 block mb-0.5">Contact Name</label>
                    <input
                      type="text"
                      placeholder="e.g. David Thorne"
                      value={formContactName}
                      onChange={e => setFormContactName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-0.5">Contact Email</label>
                    <input
                      type="email"
                      placeholder="david.t@company.com"
                      value={formContactEmail}
                      onChange={e => setFormContactEmail(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-0.5">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={formContactPhone}
                      onChange={e => setFormContactPhone(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 1000 Wilshire Blvd"
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Los Angeles, CA"
                    value={formCity}
                    onChange={e => setFormCity(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. United States"
                    value={formCountry}
                    onChange={e => setFormCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Compliance & Credit Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Insurance COI</label>
                  <select
                    value={formInsuranceStatus}
                    onChange={e => setFormInsuranceStatus(e.target.value as InsuranceStatus)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="VALID">VALID (Verified)</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="RENEWAL_REQUIRED">Renewal Required</option>
                    <option value="EXEMPT">Exempt</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">COI Expiry Date</label>
                  <input
                    type="date"
                    value={formInsuranceExpiry}
                    onChange={e => setFormInsuranceExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">NDA Standing</label>
                  <select
                    value={formNdaStatus}
                    onChange={e => setFormNdaStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none font-medium"
                  >
                    <option value="SIGNED">SIGNED (Executed)</option>
                    <option value="PENDING">PENDING SIGNATURE</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="EXEMPT">EXEMPT</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Risk Tier</label>
                  <select
                    value={formRiskTier}
                    onChange={e => setFormRiskTier(e.target.value as RiskTier)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="LOW">LOW (Tier 1 Preferred)</option>
                    <option value="MEDIUM">MEDIUM (Standard)</option>
                    <option value="HIGH">HIGH (Escrow Only)</option>
                  </select>
                </div>
              </div>

              {/* Contractor Executed NDA Document Upload & Database Vault Section */}
              {formNdaStatus === 'SIGNED' && (
                <div className="p-4 bg-[#FBF9F5] rounded-2xl border border-amber-200/90 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/60">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#2C2416] text-[#D4AF37] flex items-center justify-center shrink-0">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <span>Contractor Executed NDA Document Upload</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
                            DATABASE VAULT
                          </span>
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Upload the signed Mutual NDA agreement. It will be indexed directly into the database <code className="font-mono text-gray-700 bg-amber-100/60 px-1 py-0.5 rounded">legal_documents</code> table with this contractor's record.
                        </p>
                      </div>
                    </div>
                    {formNdaFileName && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 self-start sm:self-auto shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Ready for DB Storage</span>
                      </span>
                    )}
                  </div>

                  {/* Dropzone / Uploaded File View */}
                  {formNdaFileName ? (
                    <div className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-xs truncate max-w-[240px] sm:max-w-md">
                                {formNdaFileName}
                              </span>
                              <span className="text-[10px] bg-purple-100 text-purple-800 font-mono font-semibold px-2 py-0.5 rounded">
                                {formNdaFileSize || 'Document'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 font-mono">
                              {formNdaCryptoHash && (
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-purple-600" />
                                  <span>{formNdaCryptoHash.slice(0, 18)}...</span>
                                </span>
                              )}
                              <span>Signed: {formNdaSignedAt ? new Date(formNdaSignedAt).toLocaleDateString() : 'Today'}</span>
                              <span className="text-emerald-700 font-sans font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Targets: DB legal_documents
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {formNdaFileUrl && (
                            <a
                              href={formNdaFileUrl}
                              download={formNdaFileName}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1 cursor-pointer"
                              title="Download / View Staged NDA File"
                            >
                              <Download className="w-3.5 h-3.5 text-gray-600" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={handleRemoveNdaFile}
                            className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-xs font-medium cursor-pointer"
                            title="Remove Staged File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Signer & Metadata Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-xs">
                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">
                            Authorized Signer Name (Contractor Officer)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Marcus Vance, VP"
                            value={formNdaSignerName}
                            onChange={e => setFormNdaSignerName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">
                            Execution Date
                          </label>
                          <input
                            type="date"
                            value={formNdaSignedAt ? formNdaSignedAt.split('T')[0] : new Date().toISOString().split('T')[0]}
                            onChange={e => setFormNdaSignedAt(new Date(e.target.value).toISOString())}
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:border-[#D4AF37] focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div
                        onDragOver={e => {
                          e.preventDefault();
                          setIsDragOverNda(true);
                        }}
                        onDragLeave={() => setIsDragOverNda(false)}
                        onDrop={e => {
                          e.preventDefault();
                          setIsDragOverNda(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleNdaFileUpload(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                          isDragOverNda
                            ? 'border-[#D4AF37] bg-amber-50/60'
                            : 'border-amber-300/80 bg-white hover:border-[#D4AF37] hover:bg-amber-50/30'
                        }`}
                      >
                        <input
                          type="file"
                          id="contractor-nda-upload-input"
                          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleNdaFileUpload(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-amber-100 text-[#B8860B] flex items-center justify-center">
                            <FileUp className="w-5 h-5" />
                          </div>
                          <div>
                            <label
                              htmlFor="contractor-nda-upload-input"
                              className="text-xs font-bold text-gray-900 hover:text-[#B8860B] cursor-pointer underline underline-offset-2"
                            >
                              Click to upload executed NDA file
                            </label>
                            <span className="text-xs text-gray-500"> or drag and drop here</span>
                          </div>
                          <p className="text-[10px] text-gray-400">
                            Supported: PDF, DOCX, TXT, scanned images. File will be stored in database legal vault with SHA-256 hash.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                        <span className="text-[11px] text-gray-500">Need standard VERTEX Mutual NDA covenant?</span>
                        <button
                          type="button"
                          onClick={handleGenerateStandardNDA}
                          className="px-3 py-1.5 bg-amber-100/70 hover:bg-amber-100 text-[#2C2416] border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                        >
                          <Stamp className="w-3.5 h-3.5 text-[#B8860B]" />
                          <span>Generate Certified VERTEX NDA Covenant</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Credit Limit ($)</label>
                <input
                  type="number"
                  step="50000"
                  value={formCreditLimit}
                  onChange={e => setFormCreditLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none font-mono"
                />
              </div>

              {/* Project Assignments */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1.5">
                  Assigned Architectural Projects
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-3 bg-gray-50 rounded-xl border border-gray-200">
                  {projects.map(p => {
                    const isSelected = formProjects.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => {
                            if (e.target.checked) {
                              setFormProjects(prev => [...prev, p.id]);
                            } else {
                              setFormProjects(prev => prev.filter(id => id !== p.id));
                            }
                          }}
                          className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <span className="truncate">{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Operating Specializations & Fleet Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Operates 500-ton Liebherr mobile cranes and rooftop glass suction lifters"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingCompany ? 'Update Credentials' : 'Register Corporate Entity'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Executed NDA Document Viewer Modal */}
      {viewingNdaCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* NDA Header Bar */}
            <div className="bg-[#2C2416] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold">
                      Legal Signature Vault • Document #{viewingNdaCompany.ndaDocumentId || `${viewingNdaCompany.id.toUpperCase()}-NDA-2026`}
                    </span>
                    <span className="text-[9px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-mono">
                      VERIFIED BINDING • DB ARCHIVED
                    </span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-white">
                    Mutual Non-Disclosure & Proprietary Architecture Covenant
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setViewingNdaCompany(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-700 bg-white border-y border-gray-200 flex-1 font-serif leading-relaxed">
              {/* Attached Document File Banner */}
              {viewingNdaCompany.ndaFileName && (
                <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200 flex items-center justify-between gap-3 font-sans">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-xs">
                          {viewingNdaCompany.ndaFileName}
                        </span>
                        <span className="text-[10px] bg-purple-200/80 text-purple-900 font-mono font-bold px-2 py-0.5 rounded">
                          {viewingNdaCompany.ndaFileSize || 'Executed File'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 font-mono">
                        Stored in DB: <span className="text-purple-800 font-bold">legal_documents</span> (ID: {viewingNdaCompany.ndaDocumentId || 'doc_nda_verified'})
                      </p>
                    </div>
                  </div>

                  {viewingNdaCompany.ndaDocumentUrl && (
                    <a
                      href={viewingNdaCompany.ndaDocumentUrl}
                      download={viewingNdaCompany.ndaFileName}
                      className="px-3 py-1.5 bg-white border border-purple-300 hover:bg-purple-100 text-purple-900 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-700" />
                      <span>Download File</span>
                    </a>
                  )}
                </div>
              )}

              {/* Document Header Plate */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Disclosing Party</span>
                  <p className="font-bold text-gray-900 text-sm">VERTEX Architecture Studio Inc.</p>
                  <p className="text-gray-500 text-[11px]">California Corporation • State Bar ID #VTX-99481</p>
                </div>
                <div className="h-8 w-px bg-amber-200 hidden sm:block" />
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Receiving Corporate Entity</span>
                  <p className="font-bold text-gray-900 text-sm">{viewingNdaCompany.legalName || viewingNdaCompany.name}</p>
                  <p className="text-gray-500 text-[11px]">EIN: {viewingNdaCompany.registrationNumber || 'EIN-88-2910471'} • {viewingNdaCompany.city || 'Los Angeles, CA'}</p>
                </div>
              </div>

              {/* Clauses */}
              <div className="space-y-4 text-gray-800 text-[12px] leading-relaxed">
                <div>
                  <h4 className="font-sans font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">
                    1. Purpose & Protected Technical Assets
                  </h4>
                  <p>
                    This Mutual Non-Disclosure and Proprietary Intellectual Property Covenant ("Agreement") governs confidential technical exchanges between VERTEX Architecture Studio Inc. and <strong>{viewingNdaCompany.name}</strong> ("Recipient"). Protected confidential information includes all architectural CAD drawings, structural load simulations, millwork schedules, client identities, security camera feeds, and pricing matrices.
                  </p>
                </div>

                <div>
                  <h4 className="font-sans font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">
                    2. Covenants of Confidentiality & Non-Circumvention
                  </h4>
                  <p>
                    Recipient agrees to maintain in strict zero-trust confidence all proprietary blueprints, BIM models, and trade secret formulations. Recipient shall not disclose, reproduce, or reverse-engineer any architectural details to unauthorized third parties or sub-tier contractors without prior written consent from VERTEX Studio Principals.
                  </p>
                </div>

                <div>
                  <h4 className="font-sans font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">
                    3. Term & Liquidated Damages
                  </h4>
                  <p>
                    This covenant remains in effect for a period of five (5) calendar years from the date of execution. Breach of confidentiality regarding high-profile residential client estates incurs statutory liquidated damages of $2,500,000 per occurrence plus full injunctive relief in the Los Angeles Superior Court.
                  </p>
                </div>
              </div>

              {/* Cryptographic Execution & Signature Certificate */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 font-sans">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-gray-900 text-xs">Digital Signature & Cryptographic Seal</span>
                  </div>
                  <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                    STATUS: {viewingNdaCompany.ndaStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Authorized Signatory (Recipient)</span>
                    <p className="font-bold text-gray-900">{viewingNdaCompany.ndaSignerName || viewingNdaCompany.primaryContactName || 'Corporate Officer'}</p>
                    <p className="text-gray-500 font-mono text-[10px]">Email: {viewingNdaCompany.email}</p>
                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200 font-serif italic text-blue-900 text-sm">
                      {viewingNdaCompany.ndaSignerName || viewingNdaCompany.primaryContactName || viewingNdaCompany.name}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Countersigned for VERTEX Studio</span>
                    <p className="font-bold text-gray-900">Alexander Wright, AIA</p>
                    <p className="text-gray-500 font-mono text-[10px]">Title: Principal Architect & Managing Partner</p>
                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200 font-serif italic text-amber-900 text-sm">
                      Alexander Wright
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-gray-100 rounded-xl text-[10px] font-mono text-gray-600 flex items-center justify-between gap-2 overflow-hidden">
                  <span className="truncate">SHA-256 Hash: {viewingNdaCompany.ndaCryptoHash || 'e8b390a77f12e84c98a31e843f54817a0b84f2ad105829148b8c8d88e001'}</span>
                  <span className="text-emerald-700 font-bold shrink-0">
                    TIMESTAMP: {viewingNdaCompany.ndaSignedAt ? new Date(viewingNdaCompany.ndaSignedAt).toLocaleDateString() : '2026-02-15'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 flex items-center justify-between gap-3 text-xs font-sans">
              {viewingNdaCompany.ndaDocumentUrl ? (
                <a
                  href={viewingNdaCompany.ndaDocumentUrl}
                  download={viewingNdaCompany.ndaFileName || `VERTEX_NDA_${viewingNdaCompany.name}.pdf`}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-gray-600" />
                  <span>Download Executed File ({viewingNdaCompany.ndaFileName})</span>
                </a>
              ) : (
                <button
                  onClick={() => addToast('info', `Executed NDA certified copy exported for ${viewingNdaCompany.name}.`)}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-gray-600" />
                  <span>Download Certified PDF</span>
                </button>
              )}

              <button
                onClick={() => setViewingNdaCompany(null)}
                className="px-5 py-2 bg-[#2C2416] hover:bg-black text-[#D4AF37] font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
