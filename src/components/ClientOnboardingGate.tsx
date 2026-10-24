import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  FileCheck2,
  Lock,
  Building,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  KeyRound,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Check
} from 'lucide-react';

export const ClientOnboardingGate: React.FC = () => {
  const { currentUser, onboardClient, addToast, switchRole } = useApp();

  const [companyName, setCompanyName] = useState(currentUser.company || 'Sterling Heritage Trust');
  const [phone, setPhone] = useState(currentUser.phone || '+1 (310) 880-9281');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'EMAIL' | 'SMS'>('EMAIL');

  // OTP Verification Flow State
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState<number>(60);
  const [otpSentTarget, setOtpSentTarget] = useState<string>('');

  useEffect(() => {
    let timer: any;
    if (step === 'OTP' && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  // Step 1: Send OTP Code
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreementChecked) {
      addToast('error', 'Please verify and agree to the Master Architectural Services Agreement.');
      return;
    }
    if (!companyName.trim()) {
      addToast('error', 'Please provide your Estate / Organization name.');
      return;
    }

    setIsSendingOtp(true);
    const target = deliveryMethod === 'EMAIL' ? currentUser.email : phone;
    setOtpSentTarget(target);

    setTimeout(() => {
      // Generate a realistic 6-digit cryptographic OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setIsSendingOtp(false);
      setStep('OTP');
      setResendCountdown(60);
      setEnteredOtp('');

      addToast(
        'info',
        `One-Time Passcode (${code}) dispatched via ${deliveryMethod === 'EMAIL' ? 'Encrypted Email' : 'SMS Gateway'} to ${target}`
      );
    }, 800);
  };

  // Step 2: Verify OTP and complete onboarding
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp.trim() && enteredOtp.trim() !== '123456') {
      addToast('error', 'Invalid verification code. Please check your delivery inbox or resend code.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      onboardClient(currentUser.id);
      setIsVerifying(false);
      addToast('success', 'Tenant identity verified. Welcome to your private VERTEX workspace.');
    }, 700);
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendCountdown > 0) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setResendCountdown(60);
    addToast(
      'info',
      `New One-Time Passcode (${code}) dispatched to ${otpSentTarget}`
    );
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 sm:p-10 space-y-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 mb-1">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Client Authentication & Estate Onboarding
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your client profile is currently <strong className="text-amber-700">Pending Verification</strong>.
            Authenticate via One-Time Passcode (Email or SMS) to unlock your private architectural dashboard, project drawings, and escrow statements.
          </p>
        </div>

        {/* Feature Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 mb-1" />
            <h4 className="text-xs font-bold text-slate-900">Isolated Tenant Ledger</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Strict role separation ensures you only access your authorized estate records.</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <FileCheck2 className="w-4 h-4 text-amber-600 mb-1" />
            <h4 className="text-xs font-bold text-slate-900">Escrow Transparency</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Real-time payment settlements, invoices, and design reviews.</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <Clock className="w-4 h-4 text-amber-600 mb-1" />
            <h4 className="text-xs font-bold text-slate-900">Forensic Audit Trail</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Every milestone sign-off and specification is cryptographically logged.</p>
          </div>
        </div>

        {/* STEP 1: VERIFICATION & DELIVERY CHANNEL SELECTION */}
        {step === 'DETAILS' && (
          <form onSubmit={handleRequestOtp} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Representative Name
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.name}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verified Account Email
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estate / Organization *
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sterling Heritage Trust"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* OTP Delivery Preference Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select One-Time Passcode (OTP) Delivery Channel:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setDeliveryMethod('EMAIL')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    deliveryMethod === 'EMAIL'
                      ? 'border-amber-400 bg-amber-50/70 shadow-xs ring-1 ring-amber-400'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-700 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Email OTP</h5>
                    <p className="text-[10px] text-slate-500 truncate max-w-[170px]">{currentUser.email}</p>
                  </div>
                </div>

                <div
                  onClick={() => setDeliveryMethod('SMS')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    deliveryMethod === 'SMS'
                      ? 'border-amber-400 bg-amber-50/70 shadow-xs ring-1 ring-amber-400'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-700 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Mobile SMS OTP</h5>
                    <p className="text-[10px] text-slate-500">{phone || '+1 (310) 880-9281'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={e => setAgreementChecked(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span className="text-xs text-slate-600 leading-snug">
                  I agree to the <strong className="text-slate-900">VERTEX Master Architectural Governance Terms</strong>, authorizing encrypted document exchange and escrow milestone approvals.
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => switchRole('ADMIN')}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
              >
                Switch back to Principal Architect (Admin)
              </button>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-black text-amber-400 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSendingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Dispatching OTP Security Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification OTP Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: ENTER OTP CODE */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 pt-1 animate-in fade-in duration-200">
            {/* Live Simulated OTP Notification Banner */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-950">
                    Security Passcode Dispatched ({deliveryMethod === 'EMAIL' ? 'Email' : 'SMS'})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnteredOtp(generatedOtp)}
                  className="text-[11px] font-bold text-amber-800 hover:underline bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs cursor-pointer"
                >
                  Auto-Fill ({generatedOtp})
                </button>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                A 6-digit verification code has been transmitted to <strong className="font-mono">{otpSentTarget}</strong>.
              </p>
            </div>

            <div className="space-y-2 text-center">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Enter 6-Digit One-Time Passcode
              </label>
              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={enteredOtp}
                  onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-3xl font-mono font-bold tracking-[0.4em] py-3 bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-2xl outline-none focus:bg-white transition-all shadow-inner text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Code expires in 10 minutes. For testing, enter the code above or <strong className="font-mono">123456</strong>.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-slate-500">Didn't receive the code?</span>
              <button
                type="button"
                disabled={resendCountdown > 0}
                onClick={handleResendOtp}
                className={`font-bold flex items-center gap-1 cursor-pointer ${
                  resendCountdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-amber-600 hover:underline'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${resendCountdown > 0 ? '' : 'animate-spin'}`} />
                <span>{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP Code'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                &larr; Change Email or Phone Number
              </button>

              <button
                type="submit"
                disabled={isVerifying || enteredOtp.length < 6}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-black text-amber-400 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <span>Verifying Cryptographic Passcode...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verify Code & Enter Workspace</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
