import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  QrCode,
  Key,
  Copy,
  Check,
  Download,
  Printer,
  X,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const TwoFactorEnrollmentModal: React.FC = () => {
  const { enrollmentPackage, setEnrollmentPackage, addToast } = useApp();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  if (!enrollmentPackage) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(enrollmentPackage.secretKey);
    setCopiedKey(true);
    addToast('success', 'MFA Secret Key copied to clipboard');
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleCopyCodes = () => {
    const text = `VERTEX Studio Security Backup Codes for ${enrollmentPackage.userName} (${enrollmentPackage.userEmail})\nGenerated: ${enrollmentPackage.generatedAt}\nSecurity Tier: ${enrollmentPackage.enforcedSecurityTier}\n\n` +
      enrollmentPackage.backupCodes.map((code, idx) => `[${idx + 1}] ${code}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedCodes(true);
    addToast('success', '8 Recovery Backup Codes copied to clipboard');
    setTimeout(() => setCopiedCodes(false), 3000);
  };

  const handleDownloadCredentials = () => {
    const text = `====================================================
VERTEX STUDIO ARCHITECTURE - ZERO-TRUST SECURITY ENROLLMENT
====================================================
Signatory / User: ${enrollmentPackage.userName}
IAM Email: ${enrollmentPackage.userEmail}
Enforced Security Tier: ${enrollmentPackage.enforcedSecurityTier}
Key Generation Timestamp: ${enrollmentPackage.generatedAt}

MFA SECRET KEY (Base32):
${enrollmentPackage.secretKey}

EMERGENCY RECOVERY BACKUP CODES (One-Time Use):
${enrollmentPackage.backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n')}

INSTRUCTIONS:
1. Scan the QR code or manually paste the Secret Key into Google Authenticator, Authy, or 1Password.
2. Store these 8 backup recovery codes in a secure institutional password vault or physical safe.
3. Each backup code is valid for exactly one sign-in emergency bypass.
====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VERTEX_MFA_Credentials_${(enrollmentPackage.userName || enrollmentPackage.user?.name || 'User').replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('success', 'MFA Security credentials downloaded');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#2C2416] p-6 text-white relative">
          <button
            onClick={() => setEnrollmentPackage(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold">
                  2FA Enrollment Package
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {enrollmentPackage.enforcedSecurityTier}
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-white">
                {enrollmentPackage.userName}
              </h3>
              <p className="text-xs text-gray-400 font-mono">{enrollmentPackage.userEmail}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Instructions Callout */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold">Provide these credentials to the user immediately.</p>
              <p className="mt-0.5 text-amber-800">
                This cryptographic key and recovery backup codes allow the user to link Google Authenticator, 1Password, or YubiKey hardware tokens.
              </p>
            </div>
          </div>

          {/* QR Code & Secret Key Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-[#FAF8F5] p-4 rounded-2xl border border-gray-200">
            {/* Visual QR Code Mock */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
              <div className="w-36 h-36 bg-gray-900 p-2 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* SVG QR Code Pattern */}
                <div className="w-full h-full bg-white p-2 rounded grid grid-cols-6 gap-1">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35 || i === 14 || i === 21
                          ? 'bg-black'
                          : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-[#2C2416] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 mt-2 font-medium">Scan in Authenticator App</span>
            </div>

            {/* Secret Key Text */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Manual Base32 Secret Key
                </label>
                <div className="p-3 bg-white rounded-xl border border-gray-300 font-mono text-xs font-bold text-[#2C2416] tracking-wider break-all shadow-2xs">
                  {enrollmentPackage.secretKey}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyKey}
                className="w-full py-2 px-3 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />}
                <span>{copiedKey ? 'Secret Key Copied!' : 'Copy Secret Key'}</span>
              </button>
            </div>
          </div>

          {/* Backup Recovery Codes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>8 One-Time Emergency Backup Codes</span>
              </label>
              <button
                type="button"
                onClick={handleCopyCodes}
                className="text-[11px] font-bold text-[#D4AF37] hover:text-[#B8860B] flex items-center gap-1 cursor-pointer"
              >
                {copiedCodes ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCodes ? 'Codes Copied' : 'Copy All'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-200">
              {enrollmentPackage.backupCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2 rounded-lg border border-gray-200 font-mono text-center text-xs font-bold text-gray-800 shadow-2xs select-all"
                >
                  <span className="text-[9px] text-gray-400 mr-1">#{idx + 1}</span>
                  {code}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 italic">
              Keep these in an offsite vault. Each code may only be redeemed once if the primary authenticator device is lost.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCredentials}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gray-600" />
                <span>Download (.txt)</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-gray-500" />
                <span>Print</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setEnrollmentPackage(null)}
              className="px-6 py-2.5 bg-[#2C2416] hover:bg-black text-[#D4AF37] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Done & Dismiss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
