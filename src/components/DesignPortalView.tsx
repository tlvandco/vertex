import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DesignConcept, MarketArticle, Inquiry } from '../types';
import { ArchitecturalTools } from './ArchitecturalTools';
import {
  Sparkles,
  Upload,
  Layers,
  Palette,
  Send,
  Eye,
  CheckCircle2,
  BookOpen,
  DollarSign,
  Share2,
  Maximize2,
  ChevronRight,
  Filter,
  BookmarkPlus,
  Compass,
  Phone,
  Mail,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sliders,
  Image as ImageIcon,
  Building,
  Tag,
  ArrowRight,
  ExternalLink,
  Download,
  Info,
  Inbox,
  Clock,
  CheckCircle,
  UserCheck,
  MessageSquare,
  AlertCircle,
  Calendar,
  ArrowUpRight
} from 'lucide-react';

const CURATED_ARCHITECTURAL_IMAGES = [
  {
    label: 'Minimalist Living Salon',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    style: 'Minimalist',
    room: 'Living Room'
  },
  {
    label: 'Warm Travertine Bathroom',
    url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',
    style: 'Modern Luxury',
    room: 'Bathroom'
  },
  {
    label: 'Fumed Oak Culinary Kitchen',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    style: 'Modern Luxury',
    room: 'Kitchen'
  },
  {
    label: 'Parisian Master Sanctuary',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    style: 'Parisian Classic',
    room: 'Bedroom'
  },
  {
    label: 'Executive Penthouse Study',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    style: 'Contemporary Spa',
    room: 'Office'
  },
  {
    label: 'Monolithic Dining Salon',
    url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
    style: 'Brutalist Warm',
    room: 'Dining Room'
  }
];

export const DesignPortalView: React.FC = () => {
  const {
    designConcepts,
    addDesignConcept,
    updateDesignConcept,
    deleteDesignConcept,
    promoteConceptToPortfolio,
    createDesignRequest,
    inquiries,
    submitInquiry,
    updateInquiryStatus,
    articles,
    currentUser,
    setIsCreateProjectOpen,
    setEditingProjectData,
    clients,
    addToast
  } = useApp();

  const isClient = currentUser.role === 'CLIENT';
  const isStaff = currentUser.role === 'DESIGNER' || currentUser.role === 'ADMIN' || currentUser.role === 'PROJECT_MANAGER';

  type TabType = 'request' | 'gallery' | 'tools' | 'contact' | 'inquiries' | 'articles';
  const [activeTab, setActiveTab] = useState<TabType>('request');
  const [inquiryStaffFilter, setInquiryStaffFilter] = useState<'ALL' | 'NEW' | 'CONTACTED' | 'RESOLVED'>('ALL');

  // RBAC Tab Enforcer: "Get in touch" is strictly reserved for clients alone.
  useEffect(() => {
    if (!isClient && activeTab === 'contact') {
      setActiveTab('tools');
    }
    if (!isStaff && activeTab === 'inquiries') {
      setActiveTab('request');
    }
  }, [isClient, isStaff, activeTab]);

  // AI Design Generation State
  const [projectName, setProjectName] = useState('Beverly Hills Penthouse Salon');
  const [clientName, setClientName] = useState(currentUser.name || 'Sterling Heritage Trust');
  const [clientEmail, setClientEmail] = useState(currentUser.email || 'client@sterling.com');
  const [roomType, setRoomType] = useState('Living Room');
  const [roomDimensions, setRoomDimensions] = useState('28 x 20 ft (11ft Ceiling)');
  const [budgetRange, setBudgetRange] = useState('$80,000 - $120,000');
  const [stylePreference, setStylePreference] = useState('Minimalist');
  const [colorScheme, setColorScheme] = useState('Warm Travertine, Brushed Brass, Fumed Oak, Bouclé');
  const [lightingScheme, setLightingScheme] = useState('Concealed Warm LED Cove (2700K) + Flos Architectural Downlights');
  const [materials, setMaterials] = useState('Navona Roman Travertine, Quarter-sawn White Oak, Patinated Bronze');
  const [designRequirements, setDesignRequirements] = useState('Integrated ethanol bio-fireplace wall, acoustic fabric wall panels, flush frameless pivot doors, and hidden AV credenza.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedConcepts, setLastGeneratedConcepts] = useState<DesignConcept[] | null>(null);

  // Contact / Inquiry State
  const [inqName, setInqName] = useState(currentUser.name || '');
  const [inqEmail, setInqEmail] = useState(currentUser.email || '');
  const [inqPhone, setInqPhone] = useState(currentUser.phone || '+1 (310) 880-9281');
  const [inqCompany, setInqCompany] = useState(currentUser.company || 'Private Client Trust');
  const [inqType, setInqType] = useState<'RESIDENTIAL' | 'COMMERCIAL' | 'CONSULTATION'>('RESIDENTIAL');
  const [inqSpace, setInqSpace] = useState('Full Estate Fit-out');
  const [inqTimeline, setInqTimeline] = useState('1-3 months');
  const [inqMessage, setInqMessage] = useState('');
  const [inqContactPref, setInqContactPref] = useState<'EMAIL' | 'PHONE' | 'BOTH'>('EMAIL');

  // Gallery & Concept CRUD State
  const [galleryFilter, setGalleryFilter] = useState('ALL');
  const [selectedConceptForModal, setSelectedConceptForModal] = useState<DesignConcept | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<MarketArticle | null>(null);

  // Concept Modal (Add / Edit)
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const [editingConcept, setEditingConcept] = useState<DesignConcept | null>(null);
  const [conceptTitle, setConceptTitle] = useState('');
  const [conceptRoom, setConceptRoom] = useState('Living Room');
  const [conceptStyle, setConceptStyle] = useState('Minimalist');
  const [conceptDesc, setConceptDesc] = useState('');
  const [conceptImage, setConceptImage] = useState('');
  const [conceptColors, setConceptColors] = useState('#EFECE6, #D4AF37, #8B7355, #2C2416');
  const [conceptCost, setConceptCost] = useState('$65,000 - $90,000');
  const [conceptTags, setConceptTags] = useState('Travertine, Minimalist, Luxury');
  const [conceptIsPortfolio, setConceptIsPortfolio] = useState(false);

  const styleOptions = [
    { id: 'Minimalist', label: 'Minimalist Monolith', desc: 'Clean planes, microcement, warm diffuse lighting' },
    { id: 'Modern Luxury', label: 'Modern Luxury', desc: 'Sculptural stone, fumed oak, concealed tech' },
    { id: 'Parisian Classic', label: 'Parisian Classic', desc: 'Heritage moldings, herringbone, velvet bouclé' },
    { id: 'Contemporary Spa', label: 'Contemporary Spa', desc: 'Roman travertine, rain coves, organic linen' },
    { id: 'Japandi Organic', label: 'Japandi Organic', desc: 'Wabi-sabi timber, lime plaster, washi paper screens' },
    { id: 'Brutalist Warm', label: 'Brutalist Warm', desc: 'Textured board-formed concrete, bronze accents, leather' }
  ];

  // Open Create Concept Modal
  const openCreateConceptModal = () => {
    setEditingConcept(null);
    setConceptTitle('');
    setConceptRoom('Living Room');
    setConceptStyle('Minimalist');
    setConceptDesc('Architectural living environment defined by monolithic Roman travertine slabs, flush frameless joinery, and concealed ambient cove lighting.');
    setConceptImage(CURATED_ARCHITECTURAL_IMAGES[0].url);
    setConceptColors('#E8E4DC, #C5A059, #8C7355, #241E15');
    setConceptCost('$75,000 - $110,000');
    setConceptTags('travertine, minimalist, ambient-lighting, bespoke');
    setConceptIsPortfolio(false);
    setIsConceptModalOpen(true);
  };

  // Open Edit Concept Modal
  const openEditConceptModal = (concept: DesignConcept) => {
    setEditingConcept(concept);
    setConceptTitle(concept.title);
    setConceptRoom(concept.roomType);
    setConceptStyle(concept.style);
    setConceptDesc(concept.description);
    setConceptImage(concept.imageUrl);
    setConceptColors(concept.colorPalette.join(', '));
    setConceptCost(concept.estimatedCost);
    setConceptTags(concept.tags.join(', '));
    setConceptIsPortfolio(!!concept.isPortfolioItem);
    setIsConceptModalOpen(true);
  };

  // Save Concept (Add or Edit)
  const handleSaveConcept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptTitle.trim() || !conceptImage.trim()) {
      addToast('error', 'Please provide a title and image URL for the concept.');
      return;
    }

    const paletteArray = conceptColors
      .split(',')
      .map(c => c.trim())
      .filter(c => c.startsWith('#') || c.length >= 3);

    const tagsArray = conceptTags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (editingConcept) {
      updateDesignConcept(editingConcept.id, {
        title: conceptTitle,
        roomType: conceptRoom,
        style: conceptStyle,
        description: conceptDesc,
        imageUrl: conceptImage,
        colorPalette: paletteArray.length ? paletteArray : ['#D4AF37', '#8B7355', '#2C2416'],
        estimatedCost: conceptCost,
        tags: tagsArray,
        isPortfolioItem: conceptIsPortfolio
      });
      addToast('success', `Updated concept "${conceptTitle}".`);
    } else {
      addDesignConcept({
        title: conceptTitle,
        roomType: conceptRoom,
        style: conceptStyle,
        description: conceptDesc,
        imageUrl: conceptImage,
        colorPalette: paletteArray.length ? paletteArray : ['#E8E4DC', '#C5A059', '#8C7355'],
        estimatedCost: conceptCost,
        tags: tagsArray,
        isPortfolioItem: conceptIsPortfolio
      });
      addToast('success', `Created new Studio Concept "${conceptTitle}".`);
    }

    setIsConceptModalOpen(false);
  };

  // Delete Concept
  const handleDeleteConcept = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from the Studio Concept gallery?`)) {
      deleteDesignConcept(id);
      addToast('info', `Removed "${title}" from Studio Concepts.`);
    }
  };

  // Generate Design Proposals
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      addToast('error', 'Please provide a project or room title.');
      return;
    }

    setIsGenerating(true);
    addToast('info', 'AI Architectural Engine is compiling material schedules & photorealistic proposals...');

    setTimeout(async () => {
      const res = await createDesignRequest({
        projectName,
        clientName,
        clientEmail,
        roomType,
        roomDimensions,
        budgetRange,
        stylePreference,
        colorScheme,
        designRequirements: `${designRequirements} | Materials: ${materials} | Lighting: ${lightingScheme}`
      });

      setIsGenerating(false);
      setLastGeneratedConcepts(res.generatedConcepts);
      addToast('success', `Generated ${res.generatedConcepts.length} bespoke architectural proposals.`);
    }, 1200);
  };

  // Submit Inquiry (Get in touch)
  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inqName.trim() || !inqEmail.trim()) {
      addToast('error', 'Name and email are required.');
      return;
    }

    submitInquiry({
      name: inqName,
      email: inqEmail,
      phone: inqPhone,
      companyName: inqCompany,
      inquiryType: inqType,
      spaceType: inqSpace,
      timeline: inqTimeline,
      message: inqMessage || 'Requesting architectural consultation for prime residential estate fit-out.',
      preferredContact: inqContactPref
    });

    addToast('success', 'Your inquiry has been encrypted and submitted to the Managing Principals.');
    setInqMessage('');
  };

  const filteredConcepts =
    galleryFilter === 'ALL'
      ? designConcepts
      : designConcepts.filter(
          c =>
            c.roomType.toLowerCase().includes(galleryFilter.toLowerCase()) ||
            c.style.toLowerCase().includes(galleryFilter.toLowerCase())
        );

  return (
    <div className="space-y-6">
      {/* Design Portal Header Banner */}
      <div className="bg-gradient-to-r from-[#2C2416] via-[#45361F] to-[#1F190F] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                VERTEX Studio & Atelier
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Architectural Design Portal
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Synthesize bespoke architectural schemes, manage interactive studio concept models, or connect directly with our design principals.
            </p>
          </div>

          {/* Header Action Button: Client gets "Get In Touch", Staff gets "Architectural Tools" */}
          <div className="flex items-center gap-3 shrink-0">
            {isClient ? (
              <button
                onClick={() => setActiveTab('contact')}
                className="px-5 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#B8860B] text-[#2C2416] font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#2C2416]" />
                <span>Get In Touch</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('tools')}
                className="px-5 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#B8860B] text-[#2C2416] font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#2C2416]" />
                <span>Architectural Tools</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('gallery')}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer border border-white/20"
            >
              <Palette className="w-4 h-4 text-[#D4AF37]" />
              <span>Studio Concepts ({designConcepts.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mt-8 overflow-x-auto scrollbar-none pt-4 border-t border-white/10">
          {[
            { id: 'request' as const, label: 'AI Design Engine', icon: Sparkles },
            { id: 'gallery' as const, label: 'Studio Concepts & Masterworks', icon: Palette },
            { id: 'tools' as const, label: 'Architectural Tools & Specs', icon: Compass },
            ...(isClient ? [{ id: 'contact' as const, label: 'Get In Touch (Consultation)', icon: Send }] : []),
            ...(isStaff ? [{ id: 'inquiries' as const, label: `Client Inquiries (${inquiries.filter(i => i.status === 'NEW').length} New)`, icon: Inbox }] : []),
            { id: 'articles' as const, label: 'Editorial & Material Trends', icon: BookOpen }
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37] text-[#2C2416] shadow-md font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: AI DESIGN GENERATION ENGINE */}
      {activeTab === 'request' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-gray-900">
                  Architectural Synthesis Engine
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure spatial geometry, material palette, and lighting to generate photorealistic render proposals.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                v4.8 Architectural Core
              </span>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Project / Room Title *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="e.g. Master Bedroom Sanctuary"
                    required
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Room Classification
                  </label>
                  <select
                    value={roomType}
                    onChange={e => setRoomType(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="Living Room">Living Salon</option>
                    <option value="Bedroom">Master Sanctuary Bedroom</option>
                    <option value="Kitchen">Culinary Kitchen & Scullery</option>
                    <option value="Bathroom">Monolithic Spa Bathroom</option>
                    <option value="Office">Executive Library & Study</option>
                    <option value="Dining Room">Formal Dining Salon</option>
                  </select>
                </div>
              </div>

              {/* Architectural Style Cards */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Architectural Language & Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {styleOptions.map(st => (
                    <div
                      key={st.id}
                      onClick={() => setStylePreference(st.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        stylePreference === st.id
                          ? 'border-[#D4AF37] bg-amber-50/60 shadow-xs ring-1 ring-[#D4AF37]'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">{st.label}</span>
                        {stylePreference === st.id && (
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Room Dimensions & Volume
                  </label>
                  <input
                    type="text"
                    value={roomDimensions}
                    onChange={e => setRoomDimensions(e.target.value)}
                    placeholder="e.g. 28 x 20 ft, 11ft ceiling"
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Estimated Budget Tier
                  </label>
                  <select
                    value={budgetRange}
                    onChange={e => setBudgetRange(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="$35,000 - $60,000">$35,000 - $60,000 (Essential Luxury)</option>
                    <option value="$80,000 - $120,000">$80,000 - $120,000 (Signature Bespoke)</option>
                    <option value="$150,000 - $250,000">$150,000 - $250,000 (Couture Materiality)</option>
                    <option value="Above $300,000">Above $300,000 (Full Estate Atelier)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Primary Material Selections
                </label>
                <input
                  type="text"
                  value={materials}
                  onChange={e => setMaterials(e.target.value)}
                  placeholder="e.g. Navona Roman Travertine, Quarter-sawn White Oak, Patinated Bronze"
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lighting & Luminaire Scheme
                </label>
                <input
                  type="text"
                  value={lightingScheme}
                  onChange={e => setLightingScheme(e.target.value)}
                  placeholder="e.g. Concealed Warm Cove (2700K) + Flos Architectural Downlights"
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Specific Spatial Requirements & Custom Brief
                </label>
                <textarea
                  rows={3}
                  value={designRequirements}
                  onChange={e => setDesignRequirements(e.target.value)}
                  placeholder="Enter acoustic parameters, ethanol fireplace wall, concealed AV, motorized sheer drapes..."
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing High-Resolution Architectural Renders...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Bespoke Architectural Proposals</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated Result Preview Area */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-gray-900 text-base">
                  {lastGeneratedConcepts ? 'Generated Proposals' : 'Studio Concept Gallery'}
                </h4>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className="text-xs text-[#D4AF37] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>View All ({designConcepts.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-4">
                {(lastGeneratedConcepts || designConcepts.slice(0, 2)).map(concept => (
                  <div
                    key={concept.id}
                    className="border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white"
                  >
                    <div className="relative h-48 bg-gray-900">
                      <img
                        src={concept.imageUrl}
                        alt={concept.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-[#D4AF37] px-2.5 py-0.5 rounded-md text-[10px] font-bold">
                        {concept.roomType} • {concept.style}
                      </div>
                      {concept.isPortfolioItem && (
                        <div className="absolute top-2.5 right-2.5 bg-[#D4AF37] text-black px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs">
                          Featured
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <h5 className="font-bold text-gray-900 text-sm">{concept.title}</h5>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {concept.description}
                      </p>

                      {/* Color Palette chips */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-gray-400 font-semibold mr-1">Palette:</span>
                        {concept.colorPalette.map((hex, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-gray-200 shadow-2xs"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs">
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold block uppercase">Procurement Estimate</span>
                          <span className="font-bold text-[#8B7355]">{concept.estimatedCost}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedConceptForModal(concept)}
                            className="px-3 py-1.5 bg-[#2C2416] text-[#D4AF37] hover:bg-black rounded-lg font-bold text-xs transition-colors cursor-pointer"
                          >
                            Inspect Concept
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDIO CONCEPTS & PORTFOLIO (WITH COMPLETE CRUD) */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div>
              <h3 className="text-lg font-serif font-bold text-gray-900">
                Studio Concept Catalog & Masterworks
              </h3>
              <p className="text-xs text-gray-500">
                Curated room concepts, moodboards, and finishes developed by the VERTEX atelier team.
              </p>
            </div>

            <button
              onClick={openCreateConceptModal}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#B8860B] text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Studio Concept</span>
            </button>
          </div>

          {/* Gallery Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {['ALL', 'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Minimalist', 'Classic', 'Modern'].map(cat => (
              <button
                key={cat}
                onClick={() => setGalleryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  galleryFilter === cat
                    ? 'bg-[#2C2416] text-[#D4AF37] font-bold shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Concept Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConcepts.map(concept => (
              <div
                key={concept.id}
                className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 bg-gray-900 overflow-hidden">
                    <img
                      src={concept.imageUrl}
                      alt={concept.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-[#D4AF37] px-2.5 py-0.5 rounded-md text-[11px] font-bold">
                      {concept.roomType} • {concept.style}
                    </div>

                    {concept.isPortfolioItem && (
                      <div className="absolute top-3 right-3 bg-[#D4AF37] text-black px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-bold text-gray-900 text-base leading-snug">
                        {concept.title}
                      </h4>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {concept.description}
                    </p>

                    {/* Color Palette */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-gray-400 font-semibold mr-1">Palette:</span>
                      {concept.colorPalette.map((hex, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-gray-200 shadow-2xs"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {concept.tags.map((t, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">Cost Range</span>
                      <span className="font-bold text-[#8B7355]">{concept.estimatedCost}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditConceptModal(concept)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Edit Concept"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteConcept(concept.id, concept.title)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Concept"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedConceptForModal(concept)}
                        className="px-3 py-1.5 bg-[#2C2416] text-[#D4AF37] hover:bg-black rounded-lg font-bold text-xs transition-colors cursor-pointer ml-1"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GET IN TOUCH (RESTRICTED TO CLIENTS ALONE) */}
      {isClient && activeTab === 'contact' && (
        <div className="space-y-8">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-[#8B7355] border border-amber-200 shadow-xs mb-1">
                <Send className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#2C2416]">
                Client Consultation & Space Inquiry
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Initiate a confidential project discussion with our architectural principals, design directors, and luxury procurement specialists.
              </p>
            </div>

            <form onSubmit={handleSubmitInquiry} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={inqName}
                    onChange={e => setInqName(e.target.value)}
                    placeholder="e.g. Lady Vivienne Montgomery"
                    required
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={inqEmail}
                    onChange={e => setInqEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={inqPhone}
                    onChange={e => setInqPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Company / Estate Trust</label>
                  <input
                    type="text"
                    value={inqCompany}
                    onChange={e => setInqCompany(e.target.value)}
                    placeholder="e.g. Sterling Heritage Trust"
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Engagement Type</label>
                  <select
                    value={inqType}
                    onChange={e => setInqType(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="RESIDENTIAL">Luxury Residential</option>
                    <option value="COMMERCIAL">Executive Commercial</option>
                    <option value="CONSULTATION">Advisory & Feasibility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Timeline</label>
                  <select
                    value={inqTimeline}
                    onChange={e => setInqTimeline(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="Immediate (< 1 month)">Immediate (&lt; 1 month)</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6+ months">6+ months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred Contact</label>
                  <select
                    value={inqContactPref}
                    onChange={e => setInqContactPref(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="EMAIL">Email Brief</option>
                    <option value="PHONE">Direct Phone Call</option>
                    <option value="BOTH">Both Channels</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message & Architectural Vision</label>
                <textarea
                  rows={4}
                  value={inqMessage}
                  onChange={e => setInqMessage(e.target.value)}
                  placeholder="Describe your architectural goals, site coordinates, volume specifications, and target materials..."
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#2C2416] hover:bg-black text-[#D4AF37] font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Confidential Architectural Brief</span>
              </button>
            </form>
          </div>

          {/* Client's Tracked Consultation Inquiries */}
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="font-serif font-bold text-gray-900 text-sm">
                  My Consultation Inquiries & Direct Line
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">
                Private Advisory Channel
              </span>
            </div>

            {inquiries.filter(i => (currentUser.email && i.email.toLowerCase() === currentUser.email.toLowerCase()) || (currentUser.name && i.name.toLowerCase() === currentUser.name.toLowerCase())).length > 0 ? (
              <div className="space-y-3">
                {inquiries
                  .filter(i => (currentUser.email && i.email.toLowerCase() === currentUser.email.toLowerCase()) || (currentUser.name && i.name.toLowerCase() === currentUser.name.toLowerCase()))
                  .map(inq => (
                    <div key={inq.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900">{inq.spaceType || 'Estate Space'}</span>
                          <span className="text-[10px] text-gray-400 font-mono">• {new Date(inq.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-1">{inq.message}</p>
                        <div className="text-[10px] text-gray-400 font-mono">
                          Timeline: {inq.timeline} | Channel: {inq.preferredContact}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {inq.status === 'NEW' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-[#8B7355] border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {inq.status === 'CONTACTED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                            <UserCheck className="w-3 h-3" />
                            <span>Director Assigned</span>
                          </span>
                        )}
                        {inq.status === 'RESOLVED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            <span>Brief Formalized</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-3 text-center italic">
                No previous inquiries recorded for your account. Submit the brief above to establish a direct advisory line with our senior design principals.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB: ARCHITECTURAL STUDIO TOOLS & STANDARD WORKBENCH */}
      {activeTab === 'tools' && (
        <ArchitecturalTools />
      )}

      {/* TAB: CLIENT INQUIRIES & LEADS REVIEW (STAFF ONLY) */}
      {isStaff && activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-serif font-bold text-gray-900 text-lg">
                    Client Consultation & Advisory Queue
                  </h3>
                </div>
                <p className="text-xs text-gray-500">
                  Manage incoming client advisory briefs, assign senior directors, and transition leads into projects.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl text-xs font-semibold">
                {(['ALL', 'NEW', 'CONTACTED', 'RESOLVED'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setInquiryStaffFilter(f)}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      inquiryStaffFilter === f
                        ? 'bg-[#2C2416] text-[#D4AF37] font-bold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f === 'ALL' ? 'All Leads' : f}
                    {f === 'NEW' && ` (${inquiries.filter(i => i.status === 'NEW').length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Total Inbound</span>
                <span className="text-lg font-bold text-gray-900 font-mono mt-0.5 block">{inquiries.length} Inquiries</span>
              </div>
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80">
                <span className="text-[10px] text-amber-800 uppercase font-bold tracking-wider block">New / Pending</span>
                <span className="text-lg font-bold text-[#8B7355] font-mono mt-0.5 block">
                  {inquiries.filter(i => i.status === 'NEW').length} Leads
                </span>
              </div>
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80">
                <span className="text-[10px] text-blue-800 uppercase font-bold tracking-wider block">Contacted</span>
                <span className="text-lg font-bold text-blue-900 font-mono mt-0.5 block">
                  {inquiries.filter(i => i.status === 'CONTACTED').length} Active
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
                <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider block">Resolved / Converted</span>
                <span className="text-lg font-bold text-emerald-900 font-mono mt-0.5 block">
                  {inquiries.filter(i => i.status === 'RESOLVED').length} Formalized
                </span>
              </div>
            </div>

            {/* Inquiries List */}
            <div className="space-y-4 pt-2">
              {inquiries
                .filter(inq => inquiryStaffFilter === 'ALL' || inq.status === inquiryStaffFilter)
                .map(inq => (
                  <div
                    key={inq.id}
                    className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/70">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm">{inq.name}</h4>
                          {inq.companyName && (
                            <span className="text-xs text-gray-500 font-medium">({inq.companyName})</span>
                          )}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-gray-600 border border-gray-200 font-semibold">
                            {inq.inquiryType}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <a href={`mailto:${inq.email}`} className="flex items-center gap-1 hover:text-[#D4AF37]">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{inq.email}</span>
                          </a>
                          {inq.phone && (
                            <a href={`tel:${inq.phone}`} className="flex items-center gap-1 hover:text-[#D4AF37]">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{inq.phone}</span>
                            </a>
                          )}
                          <span className="text-[11px] text-gray-400 font-mono">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Status & Quick Action Buttons */}
                      <div className="flex items-center gap-2">
                        {inq.status === 'NEW' && (
                          <button
                            onClick={() => updateInquiryStatus(inq.id, 'CONTACTED')}
                            className="px-3 py-1.5 bg-[#2C2416] text-[#D4AF37] hover:bg-black text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Mark Contacted</span>
                          </button>
                        )}
                        {inq.status === 'CONTACTED' && (
                          <button
                            onClick={() => {
                              updateInquiryStatus(inq.id, 'RESOLVED');
                              const matchedClient = clients.find(c => c.email.toLowerCase() === inq.email.toLowerCase());
                              setEditingProjectData({
                                id: '',
                                name: inq.companyName ? `${inq.companyName} Architectural Build` : `${inq.name}'s Residence`,
                                code: `PRJ-${String(Math.floor(100 + Math.random() * 900))}`,
                                location: 'Beverly Hills, CA',
                                budget: 650000,
                                spent: 0,
                                status: 'PLANNING',
                                progress: 5,
                                description: `Converted from inbound client inquiry. Scope: ${inq.spaceType || 'Full Architectural Scope'}. Requirement Brief: ${inq.message}`,
                                clientId: matchedClient?.id || 'c1',
                                clientName: inq.name,
                                clientEmail: inq.email,
                                startDate: new Date().toISOString().split('T')[0],
                                endDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
                                team: [],
                                coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
                                createdAt: new Date().toISOString().split('T')[0]
                              });
                              setIsCreateProjectOpen(true);
                              addToast('success', `Lead converted! Project brief pre-filled for ${inq.name}`);
                            }}
                            className="px-3 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Convert to Project</span>
                          </button>
                        )}
                        {inq.status === 'RESOLVED' && (
                          <button
                            onClick={() => updateInquiryStatus(inq.id, 'NEW')}
                            className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                          >
                            Re-open Lead
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-gray-200/60">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Space Requirement</span>
                        <span className="font-semibold text-gray-800">{inq.spaceType}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-gray-200/60">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Target Timeline</span>
                        <span className="font-semibold text-gray-800">{inq.timeline}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-gray-200/60">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Preferred Channel</span>
                        <span className="font-semibold text-gray-800">{inq.preferredContact}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-gray-200/60 text-xs text-gray-700">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Architectural Brief:</span>
                      <p className="leading-relaxed">{inq.message}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MARKET TRENDS & EDITORIAL ARTICLES */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map(art => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 bg-gray-900 overflow-hidden relative">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-[#D4AF37] px-2.5 py-0.5 rounded text-[10px] font-bold">
                      {art.category}
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {art.readTime} • {art.date}
                    </span>
                    <h4 className="font-serif font-bold text-gray-900 text-base group-hover:text-[#8B7355] transition-colors leading-snug">
                      {art.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#8B7355] font-bold">
                    <span>By {art.author}</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Editorial &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT STUDIO CONCEPT MODAL */}
      {isConceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-[#2C2416] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-white">
                    {editingConcept ? 'Edit Studio Concept' : 'Add New Studio Concept'}
                  </h3>
                  <p className="text-[11px] text-gray-300">
                    Define architectural specifications, image rendering, and material palette.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsConceptModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConcept} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Concept Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kyoto Minimalist Salon"
                    value={conceptTitle}
                    onChange={e => setConceptTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Room Classification</label>
                  <select
                    value={conceptRoom}
                    onChange={e => setConceptRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Living Room">Living Room</option>
                    <option value="Bedroom">Master Bedroom</option>
                    <option value="Kitchen">Kitchen & Scullery</option>
                    <option value="Bathroom">Spa Bathroom</option>
                    <option value="Office">Executive Office</option>
                    <option value="Dining Room">Dining Salon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Architectural Style</label>
                  <select
                    value={conceptStyle}
                    onChange={e => setConceptStyle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Minimalist">Minimalist</option>
                    <option value="Modern Luxury">Modern Luxury</option>
                    <option value="Parisian Classic">Parisian Classic</option>
                    <option value="Contemporary Spa">Contemporary Spa</option>
                    <option value="Japandi Organic">Japandi Organic</option>
                    <option value="Brutalist Warm">Brutalist Warm</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Estimated Cost Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $75,000 - $110,000"
                    value={conceptCost}
                    onChange={e => setConceptCost(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Curated Previews Picker */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1.5">
                  High-Resolution Architectural Render (Select or Paste URL)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {CURATED_ARCHITECTURAL_IMAGES.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setConceptImage(img.url)}
                      className={`h-14 rounded-lg overflow-hidden border cursor-pointer relative ${
                        conceptImage === img.url ? 'ring-2 ring-[#D4AF37] border-transparent' : 'border-gray-200'
                      }`}
                      title={img.label}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={conceptImage}
                  onChange={e => setConceptImage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Architectural Description & Narrative
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe materials, lighting integration, spatial transitions..."
                  value={conceptDesc}
                  onChange={e => setConceptDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Color Palette (Hex Codes, comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="#E8E4DC, #C5A059, #8C7355, #241E15"
                    value={conceptColors}
                    onChange={e => setConceptColors(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Search Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="travertine, minimalist, ambient, bronze"
                    value={conceptTags}
                    onChange={e => setConceptTags(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={conceptIsPortfolio}
                    onChange={e => setConceptIsPortfolio(e.target.checked)}
                    className="rounded text-[#D4AF37] focus:ring-[#D4AF37] h-4 w-4"
                  />
                  <span className="font-bold text-gray-900">
                    Feature as Masterwork in Public Studio Portfolio
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsConceptModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingConcept ? 'Update Concept' : 'Save Concept to Studio'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Concept Inspection Modal */}
      {selectedConceptForModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 border border-amber-100 animate-in zoom-in-95">
            <button
              onClick={() => setSelectedConceptForModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-64 rounded-2xl overflow-hidden mb-5 bg-gray-900">
              <img
                src={selectedConceptForModal.imageUrl}
                alt={selectedConceptForModal.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#8B7355] uppercase">
                  {selectedConceptForModal.roomType} • {selectedConceptForModal.style}
                </span>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mt-1">
                  {selectedConceptForModal.title}
                </h3>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed">
                {selectedConceptForModal.description}
              </p>

              <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Material Palette</span>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedConceptForModal.colorPalette.map((hex, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border border-gray-300 shadow-xs"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Estimated Procurement</span>
                  <span className="text-base font-bold text-[#8B7355]">{selectedConceptForModal.estimatedCost}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    openEditConceptModal(selectedConceptForModal);
                    setSelectedConceptForModal(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Edit Concept
                </button>
                <button
                  onClick={() => setSelectedConceptForModal(null)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2C2416] text-[#D4AF37] hover:bg-black cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl relative my-8 border border-amber-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black p-1 text-lg font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs uppercase font-bold text-[#8B7355]">{selectedArticle.category}</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1 mb-2">
              {selectedArticle.title}
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Published by {selectedArticle.author} on {selectedArticle.date} • {selectedArticle.readTime}
            </p>

            <div className="h-72 rounded-2xl overflow-hidden mb-6">
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-sm text-gray-700 leading-relaxed space-y-4 whitespace-pre-line font-serif">
              {selectedArticle.content}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2 bg-[#2C2416] text-[#D4AF37] rounded-xl text-xs font-bold hover:bg-black cursor-pointer"
              >
                Close Editorial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
