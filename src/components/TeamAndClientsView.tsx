import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TeamMember, Client } from '../types';
import { CompanyManagementView } from './CompanyManagementView';
import { IAMGovernanceView } from './IAMGovernanceView';
import { OnboardingStatusTracker } from './OnboardingStatusTracker';
import {
  Users,
  UserPlus,
  UserCheck,
  Building,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Search,
  Plus,
  Shield,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  Key
} from 'lucide-react';

export const TeamAndClientsView: React.FC = () => {
  const {
    teamMembers,
    clients,
    companies,
    users,
    addTeamMember,
    addClient,
    isCreateMemberOpen,
    setIsCreateMemberOpen,
    isCreateClientOpen,
    setIsCreateClientOpen,
    currentUser,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'team' | 'clients' | 'companies' | 'iam' | 'onboarding'>('team');
  const [searchTerm, setSearchTerm] = useState('');

  const pendingClientsCount = users.filter(
    u => (u.role === 'CLIENT' || u.onboardingStatus !== undefined) && u.onboardingStatus === 'PENDING_ONBOARDING'
  ).length;

  // New Team Member Form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamMember['role']>('DESIGNER');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberSpec, setNewMemberSpec] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState('');

  // New Client Form state
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  const filteredTeam = teamMembers.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    addTeamMember({
      name: newMemberName,
      role: newMemberRole,
      email: newMemberEmail,
      phone: newMemberPhone || '+1 (555) 000-0000',
      specialization: newMemberSpec || 'Architecture & Planning',
      avatar: newMemberAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'ACTIVE'
    });

    setIsCreateMemberOpen(false);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) return;

    addClient({
      name: newClientName,
      company: newClientCompany || 'Private Estate Trust',
      email: newClientEmail,
      phone: newClientPhone || '+1 (555) 000-0000',
      address: newClientAddress || 'Beverly Hills, CA',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    });

    setIsCreateClientOpen(false);
    setNewClientName('');
    setNewClientCompany('');
    setNewClientEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2C2416]">
            Governance, Directory & IAM
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Architects, interior designers, trade partner companies ("caranies"), client accounts, and Zero-Trust IAM access control.
          </p>
        </div>

        {currentUser.role !== 'CLIENT' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateClientOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 hover:bg-gray-50 text-gray-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Add Client Account</span>
            </button>
            <button
              onClick={() => setIsCreateMemberOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#B8860B] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Onboard Staff</span>
            </button>
          </div>
        )}
      </div>

      {/* Primary Navigation Tabs */}
      <div className="bg-white p-2 sm:p-3 rounded-2xl border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'team'
                ? 'bg-[#2C2416] text-[#D4AF37]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Studio Team ({teamMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'clients'
                ? 'bg-[#2C2416] text-[#D4AF37]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Client Roster ({clients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'companies'
                ? 'bg-[#2C2416] text-[#D4AF37]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Companies & Trade Partners ({companies.length})</span>
          </button>

          {(currentUser.role === 'ADMIN' || currentUser.role === 'PROJECT_MANAGER') && (
            <>
              <button
                onClick={() => setActiveTab('onboarding')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'onboarding'
                    ? 'bg-[#2C2416] text-[#D4AF37]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Onboarding Tracker</span>
                {pendingClientsCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-white rounded-full font-bold animate-pulse">
                    {pendingClientsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('iam')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'iam'
                    ? 'bg-[#2C2416] text-[#D4AF37]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>IAM & 2FA Governance ({users.length})</span>
              </button>
            </>
          )}
        </div>

        {(activeTab === 'team' || activeTab === 'clients') && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search directory..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#D4AF37] outline-none"
            />
          </div>
        )}
      </div>

      {/* TAB 1: TEAM */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map(member => (
            <div
              key={member.id}
              className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-100 shadow-xs"
                  />
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-[#8B7355] border border-amber-200/60 uppercase">
                    {member.role.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-gray-900 text-lg">{member.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{member.specialization}</p>

                <div className="space-y-1.5 pt-4 mt-4 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{member.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold">Active Projects:</span>
                <span className="font-bold text-[#8B7355] bg-amber-50 px-2 py-0.5 rounded-md">
                  {member.activeProjectsCount} assigned
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: CLIENTS */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <div
              key={client.id}
              className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-100 shadow-xs"
                  />
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 uppercase">
                    Client Account
                  </span>
                </div>

                <h3 className="font-serif font-bold text-gray-900 text-lg">{client.name}</h3>
                <p className="text-xs text-[#8B7355] font-semibold mt-0.5">{client.company}</p>

                <div className="space-y-1.5 pt-4 mt-4 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 pt-1 truncate">
                    {client.address}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold">Active Commissions:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {client.activeProjectsCount} Projects
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: COMPANIES & TRADE PARTNERS ("CARANIES") */}
      {activeTab === 'companies' && <CompanyManagementView />}

      {/* TAB 4: ONBOARDING STATUS TRACKER */}
      {activeTab === 'onboarding' && <OnboardingStatusTracker />}

      {/* TAB 5: IAM & 2FA GOVERNANCE */}
      {activeTab === 'iam' && <IAMGovernanceView />}

      {/* Onboard Team Member Modal */}
      {isCreateMemberOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif font-bold text-gray-900">Onboard Team Member</h3>
              <button onClick={() => setIsCreateMemberOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  placeholder="e.g. Liam Sterling"
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                  <select
                    value={newMemberRole}
                    onChange={e => setNewMemberRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none bg-white"
                  >
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="ARCHITECT">Architect</option>
                    <option value="DESIGNER">Lead Designer</option>
                    <option value="SITE_ENGINEER">Site Engineer</option>
                    <option value="FINANCE">Finance Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={newMemberSpec}
                    onChange={e => setNewMemberSpec(e.target.value)}
                    placeholder="e.g. Calacatta Veining"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={e => setNewMemberEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newMemberPhone}
                    onChange={e => setNewMemberPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateMemberOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] text-white font-bold text-xs rounded-xl hover:bg-[#B8860B]"
                >
                  Confirm Staff Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isCreateClientOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif font-bold text-gray-900">Add Client Account</h3>
              <button onClick={() => setIsCreateClientOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Client Representative Name *</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  placeholder="e.g. Arthur Pendelton"
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Organization / Trust Name</label>
                <input
                  type="text"
                  value={newClientCompany}
                  onChange={e => setNewClientCompany(e.target.value)}
                  placeholder="e.g. Pendelton Capital Group"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={e => setNewClientEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newClientPhone}
                    onChange={e => setNewClientPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Estate / Billing Address</label>
                <input
                  type="text"
                  value={newClientAddress}
                  onChange={e => setNewClientAddress(e.target.value)}
                  placeholder="Street, City, State"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateClientOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800"
                >
                  Create Client Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
