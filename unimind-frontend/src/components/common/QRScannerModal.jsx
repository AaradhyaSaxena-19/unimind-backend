import React, { useState } from 'react';
import { verifyQR } from '../../services/academicService';
import NeoButton from './NeoButton';
import NeoInput from './NeoInput';
import NeoAlert from './NeoAlert';
import { QrCode, CheckCircle2, X } from 'lucide-react';

export const QRScannerModal = ({ isOpen, onClose, onVerified }) => {
  const [manualCode, setManualCode] = useState('RBMI-ATTENDANCE:KCS501:LEC-2');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || manualCode;
    if (!code) return;

    setError('');
    setLoading(true);

    try {
      const data = await verifyQR({ qr_data: code, verification_type: 'attendance' });
      setResult(data);
      if (onVerified) onVerified(data);
    } catch (err) {
      setError(err.message || 'QR Verification failed. Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg p-5 sm:p-6 max-w-md w-full space-y-4 text-left relative animate-in fade-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Campus QR Scanner</h3>
            <p className="text-xs text-slate-400">
              Lecture attendance punch & event check-in pass
            </p>
          </div>
        </div>

        {error && <NeoAlert type="error" title="Scanner Error" message={error} onClose={() => setError('')} />}

        {result ? (
          <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-emerald-950">Punch Verified & Recorded!</h4>
            <p className="text-xs text-emerald-700">
              {result.details?.message}
            </p>
            <div className="text-[11px] font-mono bg-white p-3 rounded-xl border border-emerald-200 text-left space-y-1">
              <p><strong>Subject:</strong> {result.details?.subject}</p>
              <p><strong>Student:</strong> {result.details?.student} ({result.details?.roll_no})</p>
              <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleTimeString()}</p>
            </div>
            <div className="pt-2 flex gap-2">
              <NeoButton
                variant="white"
                size="sm"
                onClick={() => {
                  setResult(null);
                  setManualCode('');
                }}
                className="flex-1"
              >
                Scan Another
              </NeoButton>
              <NeoButton variant="primary" size="sm" onClick={onClose} className="flex-1">
                Done
              </NeoButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simulated Camera Viewfinder with Scanner Line */}
            <div className="relative w-full h-48 bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white shadow-soft-xs">
              {/* Corner targeting brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#1E6BFF]" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#1E6BFF]" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#1E6BFF]" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#1E6BFF]" />

              {/* Animated laser scan line */}
              <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-[#1E6BFF] to-transparent animate-pulse" />

              <QrCode className="w-14 h-14 text-white/30" />
              <span className="text-xs font-semibold text-white/70 mt-2">
                Point camera at Faculty Attendance QR
              </span>
            </div>

            {/* Quick Demo QR Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Demo Quick Punch Tokens
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleVerify('RBMI-ATTENDANCE:KCS501:LEC-2')}
                  className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-slate-800 block">KCS501 DBMS</span>
                  <span className="text-[10px] text-slate-400">Lecture Period #2</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVerify('RBMI-ATTENDANCE:KCS502:LEC-4')}
                  className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-slate-800 block">KCS502 Compiler</span>
                  <span className="text-[10px] text-slate-400">Lecture Period #4</span>
                </button>
              </div>
            </div>

            {/* Manual input fallback */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <NeoInput
                label="Or enter QR payload manually"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="TOKEN-CODE"
              />
              <NeoButton
                variant="primary"
                size="md"
                onClick={() => handleVerify()}
                loading={loading}
                className="w-full"
              >
                Verify & Mark Attendance
              </NeoButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerModal;
