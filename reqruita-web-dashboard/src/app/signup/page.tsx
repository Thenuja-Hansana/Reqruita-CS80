'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup, saveToken, saveUser } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    companyName: '',
    industry: '',
    country: '',
    address: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signup(formData);
      saveToken(result.token);
      saveUser(result.user);
      router.push('/payment');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Tailwind class constants for reuse
  const inputBase =
    'w-full py-2.5 px-3.5 border-[1.5px] border-gray-200 rounded-xl bg-gray-50 outline-none text-sm text-gray-900 transition-all duration-150 placeholder:text-gray-400 placeholder:font-normal hover:border-gray-300 hover:bg-gray-100 focus:border-purple-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)]';

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: 'url("/sign-up-bg.png")' }}
    >
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/10 z-0" />

      <div className="relative z-10 flex w-full h-full">
        {/* LEFT – Branding */}
        <div className="w-1/2 flex-col items-center justify-center text-white px-8 hidden lg:flex gap-10">
          <div className="relative">
            <div className="absolute -inset-4 bg-white/10 rounded-full blur-2xl" />
            <img
              src="/reqruita-logo.png"
              alt="Reqruita Logo"
              className="relative w-36 h-36 rounded-[2rem] bg-white/95 shadow-2xl shadow-purple-900/30"
            />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight drop-shadow-lg">
              Where Great Jobs
            </h1>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight drop-shadow-lg pl-16">
              Find Great People
            </h1>
          </div>
        </div>

        {/* RIGHT – Signup Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-[580px] bg-white/[0.97] backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/60 px-10 py-8 overflow-y-auto max-h-[96vh] custom-scrollbar">
            <h2 className="text-[1.55rem] font-bold text-gray-900 text-center mb-1">
              Create your Reqruita account
            </h2>
            <p className="text-sm text-gray-400 text-center mb-6">
              Already have an account?{' '}
              <Link
                href="/signin"
                className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                Sign in
              </Link>
            </p>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-[18px]">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <label className="block text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="block text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="block text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
                  Email
                </label>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`${inputBase} pr-20`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <label className="block text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`${inputBase} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-[18px] h-[18px]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-[18px] h-[18px]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="block text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`${inputBase} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-[18px] h-[18px]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-[18px] h-[18px]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="block text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`${inputBase} pr-20`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </div>

              {/* Company */}
              <div className="flex flex-col gap-1">
                <label className="block text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
                  Company Name
                </label>
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className={inputBase}
                />
              </div>

              {/* Industry + Country */}
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <label className="block text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
                    Industry
                  </label>
                  <input
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="block text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
                    Country
                  </label>
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1">
                <label className="block text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
                  Address
                </label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={inputBase}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-70 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-[15px] mt-1 shadow-lg shadow-purple-500/25 hover:shadow-purple-600/30 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
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
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Creating account…
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">
                  or
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="border border-gray-200 rounded-xl py-2.5 flex items-center justify-center gap-2.5 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 group"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                    Sign-up with Google
                  </span>
                </button>

                <button
                  type="button"
                  className="border border-gray-200 rounded-xl py-2.5 flex items-center justify-center gap-2.5 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 group"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 23 23"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                    <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
                    <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
                    <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
                  </svg>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                    Sign-up with Microsoft
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
