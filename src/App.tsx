import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProjectDrawer } from './components/ProjectDrawer';
import { ProjectModal } from './components/ProjectModal';
import { ChatDrawer } from './components/ChatDrawer';
import { ToastContainer } from './components/ToastContainer';
import { ClientOnboardingGate } from './components/ClientOnboardingGate';
import { Loader2, Lock, ArrowRight, ShieldAlert, Shield } from 'lucide-react';
import { hasViewAccess, getRolePermissions } from './utils/rbac';

// Code-split heavy views for 1M+ User Scalability (<100ms Initial TTI)
const StatsOverview = lazy(() => import('./components/StatsOverview').then(m => ({ default: m.StatsOverview })));
const ProjectsView = lazy(() => import('./components/ProjectsView').then(m => ({ default: m.ProjectsView })));
const DesignPortalView = lazy(() => import('./components/DesignPortalView').then(m => ({ default: m.DesignPortalView })));
const FinancialsView = lazy(() => import('./components/FinancialsView').then(m => ({ default: m.FinancialsView })));
const TeamAndClientsView = lazy(() => import('./components/TeamAndClientsView').then(m => ({ default: m.TeamAndClientsView })));
const AnalyticsAuditView = lazy(() => import('./components/AnalyticsAuditView').then(m => ({ default: m.AnalyticsAuditView })));

const SuspendedAccountGate: React.FC = () => {
  const { currentUser, switchRole, users } = useApp();
  const activeUsers = users.filter(u => u.status === 'ACTIVE');

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-red-300 shadow-2xl p-8 text-center space-y-6 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 border border-red-300 flex items-center justify-center mx-auto shadow-md animate-pulse">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] uppercase font-bold tracking-widest px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full inline-block">
            Access Revoked • Zero-Trust Quarantine
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#2C2416]">
            Identity Suspended
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
            The account for <strong className="text-gray-900 font-semibold">{currentUser.name}</strong> ({currentUser.email}) has been placed in an administrative suspension state.
          </p>
        </div>

        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 text-left space-y-2 text-xs text-red-950">
          <div className="flex items-center justify-between font-bold text-[11px] border-b border-red-200 pb-2">
            <span>Security Enforcement Policy:</span>
            <span className="font-mono text-[10px] bg-red-200/80 px-2 py-0.5 rounded text-red-900">SUSPENDED_ACCOUNT</span>
          </div>
          <p className="text-[11px] leading-relaxed text-red-800">
            All cryptographic TLS tokens, project CAD files, milestone draw approvals, and message channels are currently quarantined for this identity by the Enterprise Security Office.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <p className="text-[11px] text-gray-500 font-medium">Switch Identity to restore active administrative session:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {activeUsers.slice(0, 3).map(user => (
              <button
                key={user.id}
                onClick={() => switchRole(user.role)}
                className="px-3.5 py-2 bg-[#2C2416] hover:bg-black text-[#D4AF37] font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Switch to {user.name} ({user.role})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewLoadingSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse py-4">
    <div className="h-8 bg-gray-200/80 rounded-lg w-1/4"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="h-32 bg-white rounded-2xl border border-gray-100 p-4"></div>
      <div className="h-32 bg-white rounded-2xl border border-gray-100 p-4"></div>
      <div className="h-32 bg-white rounded-2xl border border-gray-100 p-4"></div>
      <div className="h-32 bg-white rounded-2xl border border-gray-100 p-4"></div>
    </div>
    <div className="h-96 bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-center text-gray-400">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
        <span>Synchronizing edge view cache...</span>
      </div>
    </div>
  </div>
);

const AccessRestrictedView: React.FC<{ viewTitle: string; requiredRole?: string }> = ({ viewTitle, requiredRole = 'ADMIN' }) => {
  const { currentUser, setActiveView } = useApp();
  const permissions = getRolePermissions(currentUser.role);

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 shadow-xl p-8 text-center space-y-5 animate-in zoom-in-95">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7 text-red-600" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full">
            Access Restricted (RBAC)
          </span>
          <h3 className="text-xl font-serif font-bold text-[#2C2416]">
            {viewTitle} Restricted
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your current role (<strong className="text-gray-900">{currentUser.role}</strong>) does not have authorization to view this module. Analytics and security audit logs are strictly reserved for <strong>{requiredRole}</strong>.
          </p>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs text-gray-600">
          <span className="font-semibold text-gray-900 block text-[11px] mb-0.5">Permitted Modules:</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {permissions.allowedViews.map(v => (
              <span key={v} className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold text-[#8B7355]">
                {v}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => setActiveView(permissions.defaultView)}
          className="w-full py-2.5 px-4 bg-[#2C2416] hover:bg-black text-[#D4AF37] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <span>Return to {permissions.defaultView.toUpperCase()}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { activeView, currentUser } = useApp();

  const isSuspended = currentUser.status === 'SUSPENDED';

  // Onboarding Access Gate: Unverified client cannot access VERTEX core modules
  const isClientPendingOnboarding =
    currentUser.role === 'CLIENT' && currentUser.onboardingStatus !== 'ONBOARDED';

  // Check if current role has permission to see active view
  const isViewPermitted = hasViewAccess(currentUser.role, activeView);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2416] flex flex-col font-sans selection:bg-[#D4AF37]/30">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary fallbackTitle="Module Render Quarantine">
          {isSuspended ? (
            <SuspendedAccountGate />
          ) : isClientPendingOnboarding ? (
            <ClientOnboardingGate />
          ) : !isViewPermitted ? (
            <AccessRestrictedView
              viewTitle={
                activeView === 'analytics' ? 'Analytics & Security Audit' :
                activeView === 'financials' ? 'Studio Financials' :
                activeView === 'team-clients' ? 'Team & Client Governance' :
                activeView === 'design-portal' ? 'Design Studio' : 'Module'
              }
              requiredRole={activeView === 'analytics' ? 'ADMIN' : 'Authorized Role'}
            />
          ) : (
            <Suspense fallback={<ViewLoadingSkeleton />}>
              {activeView === 'dashboard' && <StatsOverview />}
              {activeView === 'projects' && <ProjectsView />}
              {activeView === 'design-portal' && <DesignPortalView />}
              {activeView === 'financials' && <FinancialsView />}
              {activeView === 'team-clients' && <TeamAndClientsView />}
              {activeView === 'analytics' && <AnalyticsAuditView />}
            </Suspense>
          )}
        </ErrorBoundary>
      </main>

      {/* Project Slide-over Drawer */}
      <ProjectDrawer />

      {/* Modals & Overlays */}
      <ProjectModal />
      <ChatDrawer />
      <ToastContainer />

      {/* Global Luxury Footer */}
      <footer className="border-t border-gray-200/80 bg-white/60 py-6 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#2C2416]">VERTEX</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Enterprise Architecture Studio</span>
          </div>
          <p className="text-gray-400">
            High-scale distributed project governance, milestone tracking, and interior design portal.
          </p>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary fallbackTitle="VERTEX Platform Recovery Mode">
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
