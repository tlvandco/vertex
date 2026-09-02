import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, IAMPermission } from '../types';
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  Briefcase,
  Search,
  Plus,
  Send,
  Lock,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Filter,
  Check,
  X,
  FileText,
  KeyRound,
  ExternalLink,
  Eye,
  RefreshCw
} from 'lucide-react';

export const OnboardingStatusTracker: React.FC = () => {
  const {
    users,
    projects,
    onboardClient,
    rejectClientOnboarding,
    createPendingClient,
    currentUser,
    switchRole,
    setChatOpen,
    setActiveChannelId,
    channels,
    createChatChannel,
    addToast
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'PENDING' | 'ALL' | 'ONBOARDED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForApproval, setSelectedUserForApproval] = useState<User | null>(null);
  const [selectedUserForRejection, setSelectedUserForRejection] = useState<User | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Approval Modal Form State
  const [approvalProjectId, setApprovalProjectId] = useState<string>('');
  const [customWelcomeNote, setCustomWelcomeNote] = useState<string>('');

  // Rejection Modal Form State
  const [rejectionReason, setRejectionReason] = useState<string>('KYC documentation incomplete or failed compliance verification.');

  // New Client Registration Simulation State
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientProjectId, setNewClientProjectId] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');

  // Filter clients
  const clientUsers = users.filter(u => u.role === 'CLIENT' || u.onboardingStatus !== undefined);

  const pendingClients = clientUsers.filter(u => u.onboardingStatus === 'PENDING_ONBOARDING');
  const onboardedClients = clientUsers.filter(u => u.onboardingStatus === 'ONBOARDED');
  const rejectedClients = clientUsers.filter(u => u.onboardingStatus === 'REJECTED');
  const mfaEnforcedCount = clientUsers.filter(u => u.twoFactorEnforced).length;

  const filteredList = clientUsers.filter(user => {
    // Filter by status
    if (activeFilter === 'PENDING' && user.onboardingStatus !== 'PENDING_ONBOARDING') return false;
    if (activeFilter === 'ONBOARDED' && user.onboardingStatus !== 'ONBOARDED') return false;
    if (activeFilter === 'REJECTED' && user.onboardingStatus !== 'REJECTED') return false;

    // Filter by search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      (user.company && user.company.toLowerCase().includes(q)) ||
      (user.phone && user.phone.toLowerCase().includes(q))
    );
  });

  const handleOpenApprovalModal = (user: User) => {
    setSelectedUserForApproval(user);
    const existingProject = user.assignedProjectIds && user.assignedProjectIds.length > 0
      ? user.assignedProjectIds[0]
      : (projects[0]?.id || '');
    setApprovalProjectId(existingProject);
    setCustomWelcomeNote(`We are pleased to grant you full administrative access to your estate portal and draw statements.`);
  };

  const handleConfirmApproval = () => {
    if (!selectedUserForApproval) return;
    onboardClient(selectedUserForApproval.id, approvalProjectId, customWelcomeNote);
    setSelectedUserForApproval(null);
  };

  const handleQuickApprove = (userId: string) => {
    const target = users.find(u => u.id === userId);
    const defaultProj = target?.assignedProjectIds?.[0] || projects[0]?.id;
    onboardClient(userId, defaultProj);
  };

  const handleOpenRejectionModal = (user: User) => {
    setSelectedUserForRejection(user);
    setRejectionReason('KYC compliance check required additional identity verification or active legal retainer.');
  };

  const handleConfirmRejection = () => {
    if (!selectedUserForRejection) return;
    rejectClientOnboarding(selectedUserForRejection.id, rejectionReason);
    setSelectedUserForRejection(null);
  };

  const handleCreatePendingApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) {
      addToast('error', 'Client Name and Email are required.');
      return;
    }

    createPendingClient({
      name: newClientName.trim(),
      email: newClientEmail.trim(),
      company: newClientCompany.trim() || 'Private Heritage Trust',
      phone: newClientPhone.trim() || '+1 (555) 000-0000',
      assignedProjectId: newClientProjectId || undefined,
      notes: newClientNotes.trim() || 'Prospective client inquiry for new residential development.'
    });

    setIsInviteModalOpen(false);
    setNewClientName('');
    setNewClientEmail('');
    setNewClientCompany('');
    setNewClientPhone('');
    setNewClientProjectId('');
    setNewClientNotes('');
    setActiveFilter('PENDING');
  };

  const handleOpenDirectChat = (user: User) => {
    // Check if direct channel already exists between currentUser and this target user
    const matched = channels.find(
      c =>
        (c.type === 'DIRECT' || c.category === 'DIRECT_MESSAGE' || c.category === 'CLIENT_SUPPORT') &&
        c.members &&
        c.members.some(m => m.toLowerCase() === user.name.toLowerCase() || m === user.id) &&
        c.members.some(m => m.toLowerCase() === currentUser.name.toLowerCase() || m === currentUser.id)
    );

    if (matched) {
      setActiveChannelId(matched.id);
    } else {
      const newCh = createChatChannel({
        name: user.name,
        type: 'DIRECT',
        category: user.role === 'CLIENT' ? 'CLIENT_SUPPORT' : 'DIRECT_MESSAGE',
        members: [user.name],
        subtext: user.role === 'CLIENT' ? 'Client Support' : user.specialization || user.role.replace('_', ' ')
      });
      setActiveChannelId(newCh.id);
    }
    setChatOpen(true);
  };

  return (
    <div id="onboarding-status-tracker" className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#2C2416] via-[#3a2f1e] to-[#2C2416] text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37]">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-white tracking-tight">
                  Onboarding Status Tracker
                </h3>
                <span className="text-xs text-[#D4AF37] font-medium tracking-wide uppercase">
                  Client Tenant Verification & Role Entitlements
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed mt-1">
              Review incoming client account requests, assign estate access, automatically grant Tier-4 role permissions, and dispatch automated welcome notification channels.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              id="simulate-client-registration-btn"
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Client Application</span>
            </button>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div
            onClick={() => setActiveFilter('PENDING')}
            className={`p-3 rounded-xl transition-all cursor-pointer border ${
              activeFilter === 'PENDING'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Review</span>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="text-2xl font-bold font-serif text-white mt-1">{pendingClients.length}</div>
            <p className="text-[10px] text-gray-300 mt-0.5">Awaiting admin verification</p>
          </div>

          <div
            onClick={() => setActiveFilter('ONBOARDED')}
            className={`p-3 rounded-xl transition-all cursor-pointer border ${
              activeFilter === 'ONBOARDED'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Verified Active</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-white mt-1">{onboardedClients.length}</div>
            <p className="text-[10px] text-gray-300 mt-0.5">Full tenant entitlements</p>
          </div>

          <div
            onClick={() => setActiveFilter('REJECTED')}
            className={`p-3 rounded-xl transition-all cursor-pointer border ${
              activeFilter === 'REJECTED'
                ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Rejected</span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-white mt-1">{rejectedClients.length}</div>
            <p className="text-[10px] text-gray-300 mt-0.5">Access suspended / restricted</p>
          </div>

          <div
            onClick={() => setActiveFilter('ALL')}
            className={`p-3 rounded-xl transition-all cursor-pointer border ${
              activeFilter === 'ALL'
                ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Zero-Trust MFA</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <div className="text-2xl font-bold font-serif text-white mt-1">{mfaEnforcedCount}</div>
            <p className="text-[10px] text-gray-300 mt-0.5">2FA security enforced</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'PENDING'
                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Pending Approvals</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-amber-200 text-amber-900 rounded-full font-bold">
              {pendingClients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-[#2C2416] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Accounts ({clientUsers.length})
          </button>

          <button
            onClick={() => setActiveFilter('ONBOARDED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'ONBOARDED'
                ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved ({onboardedClients.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'REJECTED'
                ? 'bg-rose-100 text-rose-900 font-bold border border-rose-300'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <UserX className="w-3.5 h-3.5 text-rose-600" />
            <span>Rejected ({rejectedClients.length})</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client or trust..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main Client Tracker Cards / Table */}
      <div className="p-4 sm:p-6 space-y-4">
        {filteredList.length === 0 ? (
          <div className="py-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-gray-700">No client accounts matching current filter</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
              {activeFilter === 'PENDING'
                ? 'All pending client accounts have been reviewed. Use the "Simulate Client Application" button to create a test application.'
                : 'Try adjusting your search criteria or switching to a different status tab.'}
            </p>
            {activeFilter === 'PENDING' && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="mt-3 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simulate New Pending Client</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map(user => {
              const isPending = user.onboardingStatus === 'PENDING_ONBOARDING';
              const isOnboarded = user.onboardingStatus === 'ONBOARDED';
              const isRejected = user.onboardingStatus === 'REJECTED';
              const assignedProjectObj = projects.find(p => user.assignedProjectIds?.includes(p.id));

              return (
                <div
                  key={user.id}
                  id={`client-card-${user.id}`}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    isPending
                      ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300 hover:bg-amber-50/50 shadow-xs'
                      : isOnboarded
                      ? 'bg-white border-gray-200/90 hover:border-emerald-200 hover:bg-emerald-50/10'
                      : 'bg-rose-50/20 border-rose-200/70 hover:border-rose-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Client Information */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            isPending
                              ? 'bg-amber-400'
                              : isOnboarded
                              ? 'bg-emerald-500'
                              : 'bg-rose-500'
                          }`}
                          title={`Status: ${user.onboardingStatus || 'ACTIVE'}`}
                        />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base font-serif truncate">
                            {user.name}
                          </h4>

                          {/* Status Badge */}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Admin Approval</span>
                            </span>
                          )}

                          {isOnboarded && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified & Onboarded</span>
                            </span>
                          )}

                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <UserX className="w-3 h-3 text-rose-600" />
                              <span>Access Restricted</span>
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            {user.securityTier || 'TIER_4_CLIENT'}
                          </span>
                        </div>

                        {/* Details row: Company, email, phone, timestamp */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1 text-gray-700 font-medium">
                            <Building className="w-3.5 h-3.5 text-[#8B7355]" />
                            <span>{user.company || 'Private Client Trust'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>{user.email}</span>
                          </span>
                          {user.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span>{user.phone}</span>
                            </span>
                          )}
                          {user.submittedAt && (
                            <span className="text-gray-400 italic">
                              Submitted: {user.submittedAt}
                            </span>
                          )}
                        </div>

                        {/* Assigned Estate / Request info */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <div className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-gray-100/90 text-gray-700 border border-gray-200/80">
                            <Briefcase className="w-3 h-3 text-[#8B7355]" />
                            <span>Assigned Estate:</span>
                            <span className="font-semibold text-gray-900">
                              {assignedProjectObj ? assignedProjectObj.name : 'Pending Project Assignment'}
                            </span>
                          </div>

                          <div className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            <Shield className="w-3 h-3" />
                            <span>2FA:</span>
                            <span className="font-semibold">{user.twoFactorStatus || 'ENROLLED'}</span>
                          </div>
                        </div>

                        {/* Onboarding Notes / Justification */}
                        {user.onboardingNotes && (
                          <div className="mt-1 text-xs text-gray-600 bg-white/70 p-2 rounded-lg border border-gray-100">
                            <span className="font-semibold text-gray-700">Application Brief: </span>
                            <span>{user.onboardingNotes}</span>
                          </div>
                        )}

                        {/* Entitlements preview */}
                        <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">Granted Permissions:</span>
                          {(isOnboarded ? (user.permissions || []) : ['VIEW_FINANCIALS', 'EXECUTE_LEGAL_CONTRACTS', 'DESIGN_PORTAL_WRITE', 'CLIENT_PORTAL_VIEW']).map(perm => (
                            <span
                              key={perm}
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                                isOnboarded
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isPending
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200/70'
                                  : 'bg-gray-100 text-gray-400 line-through'
                              }`}
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Controls for this Account */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                      {isPending && (
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                          <button
                            id={`approve-client-btn-${user.id}`}
                            onClick={() => handleOpenApprovalModal(user)}
                            className="flex-1 lg:flex-initial px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                            title="Approve Client Account and Dispatch Welcome Notification"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Account</span>
                          </button>

                          <button
                            id={`reject-client-btn-${user.id}`}
                            onClick={() => handleOpenRejectionModal(user)}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Reject Client Registration"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}

                      {isOnboarded && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleOpenDirectChat(user)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#8B7355] border border-amber-200/80 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Open Direct Welcome & Support Channel"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Welcome Channel</span>
                          </button>

                          <button
                            onClick={() => switchRole('CLIENT')}
                            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Simulate Client View"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-500" />
                            <span>Test Client View</span>
                          </button>
                        </div>
                      )}

                      {isRejected && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenApprovalModal(user)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Re-evaluate & Approve</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approval Confirmation & Welcome Packet Modal */}
      {selectedUserForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-serif text-lg">
                    Approve Client Onboarding
                  </h3>
                  <p className="text-xs text-gray-500">
                    Authorize tenant access for {selectedUserForApproval.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForApproval(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Brief */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
              <img
                src={selectedUserForApproval.avatar}
                alt={selectedUserForApproval.name}
                className="w-10 h-10 rounded-full object-cover border"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900">{selectedUserForApproval.name}</p>
                <p className="text-xs text-gray-500">{selectedUserForApproval.email} • {selectedUserForApproval.company}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Tier-4 Client
              </span>
            </div>

            {/* Granted Role Entitlements */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Automatic Role Entitlements to Grant:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>3D Design & Specs Approval</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Escrow Draws & Billing Ledger</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Digital Contract Execution</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Zero-Trust 2FA Key Enforced</span>
                </div>
              </div>
            </div>

            {/* Estate Project Binding */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Assign Project / Estate Contract:</label>
              <select
                value={approvalProjectId}
                onChange={e => setApprovalProjectId(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-hidden focus:border-[#D4AF37]"
              >
                <option value="">No Project Assigned (Global Portal Only)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code}) - ${p.budget.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Welcome Message */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                <span>Welcome Notification Message (Auto-dispatched):</span>
                <span className="text-[11px] text-[#8B7355] font-normal">Sent to direct collaboration channel</span>
              </label>
              <textarea
                value={customWelcomeNote}
                onChange={e => setCustomWelcomeNote(e.target.value)}
                rows={3}
                placeholder="Optional custom welcome message from the Principal Architect..."
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedUserForApproval(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-onboard-client-btn"
                type="button"
                onClick={handleConfirmApproval}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Authorize & Dispatch Welcome</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Confirmation Modal */}
      {selectedUserForRejection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-serif text-lg">
                    Reject Client Onboarding
                  </h3>
                  <p className="text-xs text-gray-500">
                    Deny access for {selectedUserForRejection.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForRejection(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Rejecting this client will restrict all tenant access, revoke draft permissions, and log an audit trail entry.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Reason for Rejection / Audit Record:</label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-rose-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedUserForRejection(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-reject-client-btn"
                type="button"
                onClick={handleConfirmRejection}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <UserX className="w-4 h-4" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulate New Client Application Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#D4AF37]/20 text-[#8B7355]">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-serif text-lg">
                    Simulate Client Registration
                  </h3>
                  <p className="text-xs text-gray-500">
                    Add a new pending client account to test the review queue
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePendingApplication} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arthur Pendelton"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Client Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. arthur@pendelton.com"
                    value={newClientEmail}
                    onChange={e => setNewClientEmail(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Company / Family Trust</label>
                  <input
                    type="text"
                    placeholder="e.g. Pendelton Family Office"
                    value={newClientCompany}
                    onChange={e => setNewClientCompany(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 880-9922"
                    value={newClientPhone}
                    onChange={e => setNewClientPhone(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Requested Estate / Project</label>
                <select
                  value={newClientProjectId}
                  onChange={e => setNewClientProjectId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-[#D4AF37]"
                >
                  <option value="">Select Project Inquired</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Application Notes / Scope</label>
                <textarea
                  value={newClientNotes}
                  onChange={e => setNewClientNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Requesting 3D conceptual designs and contract signoff for new residential construction."
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:opacity-95 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
