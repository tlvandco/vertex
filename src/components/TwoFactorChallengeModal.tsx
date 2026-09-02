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
  Clock
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

  // Dynamic realistic 6-digit TOTP suggestion generated for quick test
  const [currentTotp, setCurrentTotp] = useState('849201');

  useEffect(() => {
    if (!is2FAChallengeOpen) {
      setOtpCode(['', '', '', '', '', '']);
      setErrorMsg(null);
      return;
    }

    // Generate a fresh demo TOTP code on open
    const generated = String(Math.floor(100000 + Math.random() * 900000));
    setCurrentTotp(generated);

    // TOTP 30-second interval simulation
    setSecondsRemaining(30);
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          const nextCode = String(Math.floor(100000 + Math.random() * 900000));
          setCurrentTotp(nextCode);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [is2FAChallengeOpen]);

  if (!is2FAChallengeOpen || !current2FAChallenge) return null;

  const handleDigitChange = (index: number, val: string) => {
    setErrorMsg(null);
    if (!/^\d*$/.test(val)) return;

    const updated = [...otpCode];
    updated[index] = val.slice(-1);
    setOtpCode(updated);

    // Auto-focus next box
    if (val && index < 5) {
      const nextInput = document.getElementById(`2fa-digit-${index + 1}`);
      nextInput?.focus();
    }

    // If all 6 digits entered, auto-verify
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
      setErrorMsg('Please enter all 6 digits of your authenticator code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsVerifying(false);
      // Accept any valid 6-digit code or demo code
      if (/^\d{6}$/.test(codeToVerify)) {
        current2FAChallenge.onSuccess(codeToVerify);
      } else {
        setErrorMsg('Invalid verification code. Please check your authenticator app.');
      }
    }, 600);
  };

  const fillQuickCode = () => {
    const digits = currentTotp.split('');
    setOtpCode(digits);
    submitVerification(currentTotp);
  };

  const simulateBiometric = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      current2FAChallenge.onSuccess('BIO-WEBAUTHN-PASSKEY');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with Security Styling */}
        <div className="bg-[#2C2416] p-6 text-white relative">
          <button
            onClick={() => setIs2FAChallengeOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold">
                Zero-Trust IAM Verification
              </span>
              <h3 className="text-lg font-serif font-bold text-white">
                {current2FAChallenge.title || 'Two-Factor Authorization'}
              </h3>
            </div>
          </div>

          <p className="text-xs text-gray-300 mt-2 leading-relaxed">
            {current2FAChallenge.description ||
              'A privileged administrative action requires secondary hardware authentication or OTP biometric confirmation.'}
          </p>
        </div>

        {/* Action Badge */}
        <div className="bg-amber-50/80 border-b border-amber-200/80 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Target: <strong>{current2FAChallenge.actionName}</strong></span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
            {currentUser.email}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* OTP Digit Input Boxes */}
          <div className="space-y-3 text-center">
            <label className="text-xs font-semibold text-gray-700 block">
              Enter 6-Digit Authenticator (TOTP) Code
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
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-bold bg-gray-50 border-2 border-gray-300 rounded-xl focus:border-[#D4AF37] focus:bg-white focus:outline-none transition-all shadow-inner text-[#2C2416]"
                />
              ))}
            </div>

            {/* Rotation Countdown */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              <span>Token rotates in <strong className="font-mono text-gray-900">{secondsRemaining}s</strong></span>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Quick Helper Simulator Panel */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-gray-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Simulator Live Token</span>
              </span>
              <span className="font-mono font-bold text-xs bg-[#2C2416] text-[#D4AF37] px-2.5 py-0.5 rounded-md tracking-wider">
                {currentTotp}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillQuickCode}
                disabled={isVerifying}
                className="w-full py-2 px-3 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Key className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Auto-Fill Code</span>
              </button>

              <button
                type="button"
                onClick={simulateBiometric}
                disabled={isVerifying}
                className="w-full py-2 px-3 bg-[#2C2416] hover:bg-black text-[#D4AF37] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Passkey / Touch ID</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIs2FAChallengeOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => submitVerification(otpCode.join(''))}
              disabled={isVerifying || otpCode.join('').length !== 6}
              className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B8860B] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Crypto Signature...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorize Privileged Action</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
