import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  Key,
  CheckCircle2,
  AlertTriangle,
  X,
  Fingerprint,
  RefreshCw,
  Clock,
  Mail,
  Sparkles
} from 'lucide-react';

export const TwoFactorChallengeModal: React.FC = () => {
  const {
    is2FAChallengeOpen,
    setIs2FAChallengeOpen,
    current2FAChallenge,
    currentUser,
    addToast
  } = useApp();

  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'EMAIL_OTP' | 'TOTP_APP'>('EMAIL_OTP');

  // Dynamic realistic 6-digit TOTP / OTP suggestion generated for quick test
  const [currentOtpCode, setCurrentOtpCode] = useState('849201');

  useEffect(() => {
    if (!is2FAChallengeOpen) {
      setOtpCode(['', '', '', '', '', '']);
      setErrorMsg(null);
      return;
    }

    // Generate fresh OTP code on open
    const generated = String(Math.floor(100000 + Math.random() * 900000));
    setCurrentOtpCode(generated);

    // 30-second interval simulation
    setSecondsRemaining(30);
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          const nextCode = String(Math.floor(100000 + Math.random() * 900000));
          setCurrentOtpCode(nextCode);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [is2FAChallengeOpen]);

  if (!is2FAChallengeOpen || !current2FAChallenge) return null;

  const targetEmail = current2FAChallenge.targetUser?.email || currentUser.email;

  const handleDigitChange = (index: number, val: string) => {
    setErrorMsg(null);
    if (!/^\d*$/.test(val)) return;

    const updated = [...otpCode];
    updated[index] = val.slice(-1);
    setOtpCode(updated);

    if (val && index < 5) {
      const nextInput = document.getElementById(`2fa-digit-${index + 1}`);
      nextInput?.focus();
    }

    const fullCode = updated.join('');
    if (fullCode.length === 6) {
      submitVerification(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`2fa-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const submitVerification = (codeToVerify: string) => {
    if (codeToVerify.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsVerifying(false);
      if (/^\d{6}$/.test(codeToVerify)) {
        current2FAChallenge.onSuccess(codeToVerify);
      } else {
        setErrorMsg('Invalid verification code. Please check your email or authenticator app.');
      }
    }, 600);
  };

  const fillQuickCode = () => {
    const digits = currentOtpCode.split('');
    setOtpCode(digits);
    submitVerification(currentOtpCode);
  };

  const simulateBiometric = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      current2FAChallenge.onSuccess('BIO-WEBAUTHN-PASSKEY');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with Modern Titanium Dark */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={() => setIs2FAChallengeOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold block">
                Two-Factor Security Verification
              </span>
              <h3 className="text-base font-bold text-white">
                {current2FAChallenge.title || 'Staff 2FA Login Challenge'}
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {current2FAChallenge.description ||
              `A privileged staff role requires secondary identity authentication. Enter the 6-digit OTP code dispatched to your registered address.`}
          </p>

          {/* Method Selector Tabs */}
          <div className="flex items-center p-1 bg-slate-800/80 rounded-xl mt-4 border border-slate-700">
            <button
              type="button"
              onClick={() => setAuthMethod('EMAIL_OTP')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === 'EMAIL_OTP'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email OTP</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('TOTP_APP')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === 'TOTP_APP'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Authenticator App</span>
            </button>
          </div>
        </div>

        {/* Action / Identity Target Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-medium truncate pr-2">
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">Staff Target: <strong>{current2FAChallenge.actionName}</strong></span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
            {targetEmail}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* OTP Digit Input Boxes */}
          <div className="space-y-3 text-center">
            <label className="text-xs font-semibold text-slate-700 block">
              {authMethod === 'EMAIL_OTP'
                ? `Enter 6-digit OTP code sent to ${targetEmail}`
                : 'Enter 6-digit code from your Authenticator app'}
            </label>
            <div className="flex justify-center gap-2 sm:gap-3">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`2fa-digit-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  disabled={isVerifying}
                  className="w-11 h-12 sm:w-12 sm:h-13 text-center text-xl font-mono font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-none transition-all shadow-inner text-slate-900"
                />
              ))}
            </div>

            {/* Rotation Countdown */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>
                Code expires in <strong className="font-mono text-slate-900">{secondsRemaining}s</strong>
              </span>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Quick Helper Simulator Panel */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Live Dispatched Code</span>
              </span>
              <span className="font-mono font-bold text-xs bg-slate-900 text-amber-400 px-2.5 py-0.5 rounded-md tracking-wider">
                {currentOtpCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillQuickCode}
                disabled={isVerifying}
                className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>Auto-Fill Code</span>
              </button>

              <button
                type="button"
                onClick={simulateBiometric}
                disabled={isVerifying}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-black text-amber-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Touch ID / Passkey</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIs2FAChallengeOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => submitVerification(otpCode.join(''))}
              disabled={isVerifying || otpCode.join('').length !== 6}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-50 text-amber-400 text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verify 2FA & Login</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
