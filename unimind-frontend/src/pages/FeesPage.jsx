import React, { useState, useEffect } from 'react';
import { getFees, payFee } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import NeoAlert from '../components/common/NeoAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  Download,
  IndianRupee,
  ShieldCheck,
  X,
  FileText,
  Printer,
} from 'lucide-react';

export const FeesPage = () => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pay Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(20000);
  const [payMode, setPayMode] = useState('UPI');
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [error, setError] = useState('');

  const loadFeeLedger = async () => {
    try {
      const data = await getFees();
      setFeeData(data);
      if (data.pending_fee) {
        setPayAmount(data.pending_fee);
      }
    } catch (err) {
      console.error('Failed to load fees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeLedger();
  }, []);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    setError('');
    setPaying(true);

    try {
      const res = await payFee({
        amount: parseFloat(payAmount),
        payment_mode: payMode,
      });

      setPaymentSuccess(res.transaction);
      await loadFeeLedger();
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <LoadingSpinner label="Retrieving Campus Fee Ledger..." />;

  const isDuesCleared = (feeData?.pending_fee || 0) <= 0;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white rounded-3xl shadow-glow-emerald flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Accounts & Finance
            </span>
            <span className="text-xs font-medium text-emerald-100">
              Institutional Billing Portal
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Fee Ledger & Online Payments
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Semester tuition, examination & laboratory charges &bull; Instant receipt dispatch
          </p>
        </div>

        {!isDuesCleared ? (
          <NeoButton
            variant="primary"
            size="md"
            icon={CreditCard}
            onClick={() => {
              setPaymentSuccess(null);
              setShowPayModal(true);
            }}
            className="rounded-full bg-white text-emerald-800 hover:bg-slate-50 w-full sm:w-auto justify-center"
          >
            Pay Dues Online (₹{feeData?.pending_fee?.toLocaleString()})
          </NeoButton>
        ) : (
          <NeoBadge color="mint" size="md">
            All Dues Cleared
          </NeoBadge>
        )}
      </div>

      {/* Metrics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            Total Semester Fee
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight block mt-1">
            ₹{feeData?.total_fee?.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400 block mt-1 truncate">
            Tuition + University Exam Fees
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block truncate">
            Total Paid
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight block mt-1">
            ₹{feeData?.paid_fee?.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-emerald-600 block mt-1 truncate">
            Verified by Finance Dept
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block truncate">
            Pending Balance
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight block mt-1">
            ₹{feeData?.pending_fee?.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400 block mt-1 truncate">
            Due on Nov 30, 2026
          </span>
        </div>
      </div>

      {/* Fee Breakdown & Transaction History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown Card */}
        <NeoCard
          title="Curriculum Fee Breakdown"
          subtitle="Itemized charges per institutional schedule"
          icon={FileText}
          badge="Detailed Ledger"
          badgeColor="yellow"
        >
          <div className="space-y-3">
            {feeData?.breakdown?.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-bold text-slate-800 leading-tight">{item.head}</h5>
                  <span className="text-[11px] text-slate-400">Due: {item.due_date}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 block">
                    ₹{item.amount?.toLocaleString()}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </NeoCard>

        {/* Transactions Card */}
        <NeoCard
          title="Official Payment Receipts"
          subtitle="Processed transaction audit records"
          icon={CreditCard}
          badge="Bank Verified"
          badgeColor="mint"
        >
          <div className="space-y-3">
            {feeData?.transactions?.map((t, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-soft-xs flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono text-[11px] font-bold text-slate-800 block">
                    {t.receipt_no}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {t.date} &bull; Mode: {t.mode}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-700">
                    ₹{t.amount?.toLocaleString()}
                  </span>
                  <button
                    onClick={() => alert(`Downloading payment receipt ${t.receipt_no}...`)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Download Receipt"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </NeoCard>
      </div>

      {/* Pay Online Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg p-6 max-w-md w-full space-y-4 text-left relative animate-in fade-in duration-200">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">Campus Fee Gateway</h3>
                <p className="text-xs text-slate-400">
                  Secured 256-bit payment pipeline
                </p>
              </div>
            </div>

            {error && <NeoAlert type="error" title="Payment Error" message={error} onClose={() => setError('')} />}

            {paymentSuccess ? (
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-emerald-950">Payment Successful!</h4>
                <p className="text-xs text-emerald-700">
                  Transaction completed with reference <strong>{paymentSuccess.receipt_no}</strong>.
                </p>
                <div className="text-[11px] font-mono bg-white p-3 rounded-xl border border-emerald-200 text-left space-y-1">
                  <p><strong>Amount:</strong> ₹{paymentSuccess.amount?.toLocaleString()}</p>
                  <p><strong>Mode:</strong> {paymentSuccess.mode}</p>
                  <p><strong>Status:</strong> Success</p>
                </div>
                <div className="pt-2">
                  <NeoButton
                    variant="primary"
                    size="sm"
                    onClick={() => setShowPayModal(false)}
                    className="w-full rounded-full"
                  >
                    Done & Close
                  </NeoButton>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Amount to Pay (INR)
                  </label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    max={feeData?.pending_fee || 50000}
                    className="w-full text-sm font-bold p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Payment Instrument
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['UPI', 'NetBanking', 'DebitCard'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPayMode(mode)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          payMode === mode
                            ? 'bg-[#1E6BFF] text-white shadow-glow-blue border-[#1E6BFF]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                  🔒 PCI-DSS Compliant Gateway. No debit or UPI credentials are saved locally.
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <NeoButton
                    variant="white"
                    size="sm"
                    onClick={() => setShowPayModal(false)}
                  >
                    Cancel
                  </NeoButton>
                  <NeoButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={paying}
                    className="rounded-full"
                  >
                    Authorize Payment (₹{Number(payAmount).toLocaleString()})
                  </NeoButton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesPage;
