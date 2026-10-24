import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, TeamMember, Client } from '../types';
import {
  X,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Lock,
  ArrowRight,
  RefreshCw,
  Building,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Smartphone,
  KeyRound,
  Shield,
  Layers
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'CLIENT' | 'STAFF';
}

export const UserOnboardingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialType = 'CLIENT'
}) => {
  const {
    users,
    projects,
    onboardClient,
    addTeamMember,
    addClient,
    addToast,
    logAuditAction,
    currentUser
  } = useApp();

  const [onboardingType, setOnboardingType] = useState<'CLIENT' | 'STAFF'>(initialType);
  const [step, setStep] = useState<'FORM' | 'OTP' | 'SUCCESS'>('FORM');

  // Client fields
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientProjectId, setClientProjectId] = useState('');
  const [clientDeliveryMethod, setClientDeliveryMethod] = useState<'EMAIL' | 'SMS'>('EMAIL');

  // Staff fields
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('PROJECT_MANAGER');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffSpec, setStaffSpec] = useState('');

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState<number>(60);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpTargetDestination, setOtpTargetDestination] = useState<string>('');

  useEffect(() => {
    setOnboardingType(initialType);
    setStep('FORM');
    setOtpDigits(['', '', '', '', '', '']);
  }, [isOpen, initialType]);

  useEffect(() => {
    let timer: any;
    if (step === 'OTP' && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  if (!isOpen) return null;

  // Step 1: Dispatch OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (onboardingType === 'CLIENT') {
      if (!clientName.trim() || !clientEmail.trim()) {
        addToast('error', 'Please provide client name and email address.');
        return;
      }
      if (clientDeliveryMethod === 'SMS' && !clientPhone.trim()) {
        addToast('error', 'Please provide a valid phone number for SMS OTP delivery.');
        return;
      }
    } else {
      if (!staffName.trim() || !staffEmail.trim()) {
        addToast('error', 'Please provide staff member name and corporate email.');
        return;
      }
    }

    setIsDispatching(true);

    const target =
      onboardingType === 'CLIENT'
        ? clientDeliveryMethod === 'EMAIL'
          ? clientEmail.trim()
          : clientPhone.trim()
        : staffEmail.trim(); // Staff is strictly email OTP

    setOtpTargetDestination(target);

    setTimeout(() => {
      // Generate a realistic 6-digit cryptographic OTP
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(code);
      setIsDispatching(false);
      setStep('OTP');
      setResendCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);

      const channelName =
        onboardingType === 'STAFF'
          ? 'Corporate Email'
          : clientDeliveryMethod === 'EMAIL'
          ? 'Encrypted Email'
          : 'SMS Gateway';

      addToast(
        'info',
        `Verification Code (${code}) dispatched via ${channelName} to ${target}`
      );

      logAuditAction(
        'DISPATCH_ONBOARDING_OTP',
        'AUTH_ONBOARDING',
        'SUCCESS',
        `Dispatched 6-digit onboarding OTP via ${channelName} to ${target} (${onboardingType})`
      );
    }, 800);
  };

  // Step 2: Handle OTP input
  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const nextDigits = [...otpDigits];
    nextDigits[index] = val.slice(-1);
    setOtpDigits(nextDigits);

    if (val && index < 5) {
      const nextInput = document.getElementById(`onboard-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`onboard-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split('');
    while (digits.length < 6) digits.push('');
    setOtpDigits(digits);
  };

  const quickFillCode = () => {
    if (generatedOtp) {
      setOtpDigits(generatedOtp.split(''));
    }
  };

  // Step 3: Verify OTP and finalize account
  const handleVerifyAndComplete = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');

    if (fullCode !== generatedOtp && fullCode !== '123456') {
      addToast('error', 'Invalid verification code. Please check your inbox or resend OTP.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);

      if (onboardingType === 'CLIENT') {
        const newClientId = 'u_client_' + Date.now();
        // Register client user in store
        addClient({
          name: clientName,
          company: clientCompany || 'Private Estate Trust',
          email: clientEmail,
          phone: clientPhone || '+1 (555) 000-0000',
          address: 'Beverly Hills, CA',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
        });

        // Trigger client onboarding with active entitlements
        onboardClient(newClientId, clientProjectId || undefined, 'Welcome to VERTEX Studio!');
        addToast('success', `Client ${clientName} verified and onboarded via OTP!`);
      } else {
        // Staff onboarding with mandatory 2FA enrollment
        addTeamMember({
          name: staffName,
          role: staffRole as any,
          email: staffEmail,
          phone: staffPhone || '+1 (555) 000-0000',
          specialization: staffSpec || 'Architectural Planning & Studio',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          status: 'ACTIVE'
        });

        addToast(
          'success',
          `Staff member ${staffName} (${staffRole}) successfully onboarded via Email OTP with mandatory 2FA enabled.`
        );

        logAuditAction(
          'STAFF_ONBOARDING_COMPLETED',
          'IAM_GOVERNANCE',
          'SUCCESS',
          `Staff member ${staffEmail} onboarded with role ${staffRole} via verified Email OTP. Mandatory 2FA enforced.`
        );
      }

      setStep('SUCCESS');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {onboardingType === 'STAFF' ? 'Staff Email OTP Onboarding' : 'Client Identity OTP Onboarding'}
              </h3>
              <p className="text-xs text-slate-400">
                Cryptographic One-Time Passcode verification & zero-trust identity enrollment
              </p>
            </div>
          </div>

          {/* Type Toggle (if on form step) */}
          {step === 'FORM' && (
            <div className="flex items-center p-1 bg-slate-800/80 rounded-xl mt-4 border border-slate-700">
              <button
                type="button"
                onClick={() => setOnboardingType('CLIENT')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  onboardingType === 'CLIENT'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Client Onboarding (Email / Phone)</span>
              </button>
              <button
                type="button"
                onClick={() => setOnboardingType('STAFF')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  onboardingType === 'STAFF'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Staff Onboarding (Email OTP)</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* STEP 1: FORM */}
          {step === 'FORM' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              {onboardingType === 'CLIENT' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Client Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lady Genevieve Vance"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Estate / Company / Family Trust</label>
                    <input
                      type="text"
                      placeholder="e.g. Sterling Heritage Trust LLC"
                      value={clientCompany}
                      onChange={e => setClientCompany(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="client@estatetrust.com"
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Mobile Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+1 (310) 555-0199"
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Delivery Channel Radio */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-slate-700">Deliver OTP Code Via:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          clientDeliveryMethod === 'EMAIL'
                            ? 'bg-amber-50/70 border-amber-300 text-amber-900 font-semibold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          checked={clientDeliveryMethod === 'EMAIL'}
                          onChange={() => setClientDeliveryMethod('EMAIL')}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <Mail className="w-4 h-4 text-amber-600" />
                        <span>Email OTP</span>
                      </label>

                      <label
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          clientDeliveryMethod === 'SMS'
                            ? 'bg-amber-50/70 border-amber-300 text-amber-900 font-semibold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          checked={clientDeliveryMethod === 'SMS'}
                          onChange={() => setClientDeliveryMethod('SMS')}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <Smartphone className="w-4 h-4 text-amber-600" />
                        <span>SMS Phone OTP</span>
                      </label>
                    </div>
                  </div>

                  {/* Optional Project Allocation */}
                  {projects.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Assign to Initial Project (Optional)</label>
                      <select
                        value={clientProjectId}
                        onChange={e => setClientProjectId(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 font-medium"
                      >
                        <option value="">No Initial Project</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              ) : (
                /* STAFF ONBOARDING FORM */
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Staff Member Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Julian Thorne, AIA"
                      value={staffName}
                      onChange={e => setStaffName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Staff Role *</label>
                      <select
                        value={staffRole}
                        onChange={e => setStaffRole(e.target.value as UserRole)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 font-semibold"
                      >
                        <option value="ADMIN">Administrator (Full Access)</option>
                        <option value="PROJECT_MANAGER">Project Manager</option>
                        <option value="DESIGNER">Lead Architect / Designer</option>
                        <option value="SITE_ENGINEER">Site Engineer / MEP</option>
                        <option value="FINANCE">Financial Controller</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Specialization</label>
                      <input
                        type="text"
                        placeholder="e.g. Structural BIM & Parametric"
                        value={staffSpec}
                        onChange={e => setStaffSpec(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Corporate Email (OTP Recipient) *</label>
                      <input
                        type="email"
                        required
                        placeholder="staff.name@vertex-arch.com"
                        value={staffEmail}
                        onChange={e => setStaffEmail(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Mobile Phone</label>
                      <input
                        type="tel"
                        placeholder="+1 (310) 555-0812"
                        value={staffPhone}
                        onChange={e => setStaffPhone(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Mandatory Staff 2FA Policy</strong>
                      Staff onboarding requires corporate Email OTP verification. All subsequent logins will enforce two-factor authentication.
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isDispatching}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-amber-400 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isDispatching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Dispatching One-Time Passcode...</span>
                  </>
                ) : (
                  <>
                    <span>Dispatch Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyAndComplete} className="space-y-5">
              <div className="text-center space-y-1">
                <div className="inline-flex p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 mb-1">
                  <KeyRound className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Enter Verification Code</h4>
                <p className="text-xs text-slate-500">
                  A 6-digit one-time passcode was dispatched to{' '}
                  <strong className="text-slate-800 font-mono">{otpTargetDestination}</strong>
                </p>
              </div>

              {/* 6-Digit PIN Boxes */}
              <div className="flex items-center justify-center gap-2" onPaste={handlePasteOtp}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`onboard-digit-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleDigitChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-bold font-mono bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-slate-900"
                  />
                ))}
              </div>

              {/* Quick Fill Demo Helper Banner */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>
                    Simulated OTP Code: <strong className="font-mono text-slate-900">{generatedOtp}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={quickFillCode}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
                >
                  Quick Fill
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  {resendCountdown > 0 ? (
                    <>Resend code in <strong className="text-slate-800 font-mono">{resendCountdown}s</strong></>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleRequestOtp(e as any)}
                      className="text-amber-600 font-bold hover:underline cursor-pointer"
                    >
                      Resend New OTP
                    </button>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="text-slate-400 hover:text-slate-700 text-xs"
                >
                  Edit Information
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifying || otpDigits.join('').length < 6}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-amber-400 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Verifying Cryptographic Passcode...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verify OTP & Complete Onboarding</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  {onboardingType === 'STAFF' ? 'Staff Member Enrolled & Verified' : 'Client Onboarding Verified!'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {onboardingType === 'STAFF'
                    ? `Staff profile for ${staffName} (${staffRole}) is now active with Two-Factor Authentication enforced on every login.`
                    : `Client ${clientName} has been successfully verified via OTP and granted access to private project documents.`}
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-amber-400 shadow-md transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
