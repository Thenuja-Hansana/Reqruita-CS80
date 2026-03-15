'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';

const PRICE_PER_ADMIN = 75;
const PRICE_PER_INTERVIEWER = 45;
const PRICE_PER_INTERVIEWEE = 25;

export default function PaymentPage() {
  const router = useRouter();
  const [numAdmins, setNumAdmins] = useState('');
  const [numInterviewers, setNumInterviewers] = useState('');
  const [numInterviews, setNumInterviews] = useState('');

  // Auth guard — redirect to /signin if not logged in
  useEffect(() => {
    if (!getToken()) {
      router.replace('/signin');
    }
  }, [router]);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const yearlyPayment = useMemo(() => {
    const admins = parseInt(numAdmins) || 0;
    const interviewers = parseInt(numInterviewers) || 0;
    const interviews = parseInt(numInterviews) || 0;
    return (
      admins * PRICE_PER_ADMIN +
      interviewers * PRICE_PER_INTERVIEWER +
      interviews * PRICE_PER_INTERVIEWEE
    );
  }, [numAdmins, numInterviewers, numInterviews]);

  const nextBillingDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME20') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setCouponApplied(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // TODO: replace with real payment API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    router.push('/home');
  };

  const inputClass =
    'w-full py-3 px-4 border border-gray-200 rounded-xl bg-gray-50/60 outline-none text-sm text-gray-900 transition-all duration-200 placeholder:text-gray-400 hover:border-purple-200 hover:bg-white focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/10 focus:shadow-sm';

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center bg-cover bg-center p-4 sm:p-6"
      style={{ backgroundImage: 'url("/sign-up-bg.png")' }}
    >
      {/* Subtle overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-indigo-900/10 pointer-events-none" />

      {/* Main Card */}
      <div className="relative w-full max-w-[1080px] bg-white/[0.92] backdrop-blur-2xl rounded-[2.2rem] shadow-[0_24px_80px_-12px_rgba(88,28,135,0.15),0_0_0_1px_rgba(255,255,255,0.6)] px-8 py-10 sm:px-12 sm:py-12 md:px-16 md:py-14">
        {/* Decorative inner glow */}
        <div className="absolute inset-0 rounded-[2.2rem] bg-gradient-to-br from-white/60 via-transparent to-purple-50/30 pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row gap-10 lg:gap-14">
          {/* LEFT — Configure subscription + Payment */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                  />
                </svg>
              </div>
              <h1 className="text-[1.6rem] font-bold text-gray-900 tracking-tight">
                Configure your subscription
              </h1>
            </div>
            <p className="text-sm text-gray-400 mb-7 ml-11">
              Choose how many seats you need
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Number of Admins */}
              <div className="group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-purple-600 transition-colors">
                  Number of Admins
                </label>
                <input
                  type="number"
                  min="0"
                  value={numAdmins}
                  onChange={(e) => setNumAdmins(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>

              {/* Number of Interviewers */}
              <div className="group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-purple-600 transition-colors">
                  Number of Interviewers
                </label>
                <input
                  type="number"
                  min="0"
                  value={numInterviewers}
                  onChange={(e) => setNumInterviewers(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>

              {/* Number of Interviews */}
              <div className="group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-purple-600 transition-colors">
                  Number of Interviews
                </label>
                <input
                  type="number"
                  min="0"
                  value={numInterviews}
                  onChange={(e) => setNumInterviews(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>

              {/* Payment Section Divider */}
              <div className="flex items-center gap-3 pt-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-purple-500/20">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Payment</h2>
              </div>

              {/* Card Number */}
              <div className="group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-purple-600 transition-colors">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className={`${inputClass} pr-14`}
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40">
                    <div className="w-7 h-[18px] rounded bg-blue-50 border border-blue-200 flex items-center justify-center">
                      <span className="text-[7px] font-extrabold text-blue-800">
                        VISA
                      </span>
                    </div>
                    <div className="w-7 h-[18px] rounded bg-red-50 border border-red-200 flex items-center justify-center">
                      <div className="flex -space-x-0.5">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-purple-600 transition-colors">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-purple-600 transition-colors">
                    CVV
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      placeholder="&bull;&bull;&bull;"
                      maxLength={4}
                      className={inputClass}
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <svg
                        className="w-4 h-4 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    agreedToTerms
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-sm shadow-purple-500/30'
                      : 'border-[1.5px] border-gray-300 bg-white hover:border-purple-400'
                  }`}
                >
                  {agreedToTerms && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
                <p className="text-[13px] text-gray-500">
                  I have read and I agree to the{' '}
                  <a
                    href="#"
                    className="text-purple-600 font-semibold hover:text-purple-700 underline decoration-purple-200 underline-offset-2 hover:decoration-purple-400 transition-colors"
                  >
                    Terms of Use
                  </a>{' '}
                  and{' '}
                  <a
                    href="#"
                    className="text-purple-600 font-semibold hover:text-purple-700 underline decoration-purple-200 underline-offset-2 hover:decoration-purple-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>

              {/* Purchase Button */}
              <button
                type="submit"
                disabled={!agreedToTerms || isProcessing}
                className={`w-full py-3.5 rounded-xl font-semibold text-[15px] transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-[0.98] ${
                  agreedToTerms && !isProcessing
                    ? 'bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/30 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-[18px] h-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                    Purchase Now
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT — Purchase Summary + Coupon */}
          <div className="w-full lg:w-[380px] flex-shrink-0 flex flex-col gap-5 lg:pt-12">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] p-7">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
                <svg
                  className="w-5 h-5 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                  />
                </svg>
                Purchase Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500">
                    Price per admin per year
                  </span>
                  <span className="text-sm font-semibold text-gray-800 tabular-nums">
                    ${PRICE_PER_ADMIN.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500">
                    Price per interviewer per year
                  </span>
                  <span className="text-sm font-semibold text-gray-800 tabular-nums">
                    ${PRICE_PER_INTERVIEWER.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500">
                    Price per interviewee per year
                  </span>
                  <span className="text-sm font-semibold text-gray-800 tabular-nums">
                    ${PRICE_PER_INTERVIEWEE.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 mt-2 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[15px] font-bold text-gray-900">
                      Yearly payment
                    </span>
                    <span
                      className={`text-[15px] font-bold tabular-nums transition-colors duration-300 ${yearlyPayment > 0 ? 'text-purple-700' : 'text-gray-900'}`}
                    >
                      ${yearlyPayment.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">
                      Next billing date
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      {nextBillingDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <svg
                  className="w-4 h-4 text-gray-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6h.008v.008H6V6Z"
                  />
                </svg>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError('');
                  }}
                  placeholder="Coupon code"
                  disabled={couponApplied}
                  className={`w-full py-3 pl-10 pr-4 border rounded-full bg-white outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 ${
                    couponApplied
                      ? 'border-green-300 bg-green-50/50 text-green-700'
                      : couponError
                        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 hover:border-purple-200'
                  }`}
                />
              </div>
              {couponApplied ? (
                <button
                  type="button"
                  onClick={() => {
                    setCouponApplied(false);
                    setCouponCode('');
                  }}
                  className="py-3 px-5 rounded-full text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all duration-200 whitespace-nowrap cursor-pointer"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="py-3 px-6 rounded-full text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all duration-200 whitespace-nowrap cursor-pointer shadow-sm"
                >
                  Apply Coupon
                </button>
              )}
            </div>
            {couponError && (
              <p className="text-xs text-red-500 -mt-3 ml-4 flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
                {couponError}
              </p>
            )}
            {couponApplied && (
              <p className="text-xs text-green-600 -mt-3 ml-4 flex items-center gap-1 font-medium">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                Coupon applied successfully!
              </p>
            )}

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-gray-400">
                <svg
                  className="w-3.5 h-3.5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
                <span className="text-[11px] font-medium">256-bit SSL</span>
              </div>
              <div className="w-px h-3 bg-gray-200" />
              <div className="flex items-center gap-1.5 text-gray-400">
                <svg
                  className="w-3.5 h-3.5 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
                <span className="text-[11px] font-medium">Secure payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
