import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const metadata: Metadata = {
  title: "Reqruita Dashboard",
  description: "Recruitment Management System",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      label: "Job Forms",
      href: "/job-forms",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      label: "User & Roles",
      href: "/user-roles",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      label: "Sessions",
      href: "/sessions",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      label: "Live Monitor",
      href: "/live-monitor",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      label: "Candidates",
      href: "/candidates",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <html lang="en">
      <head>
        <title>Reqruita Dashboard</title>
        <meta name="description" content="Recruitment Management System" />
        <link rel="icon" href="/ReqruitaLogo.png" />
      </head>
      <body className="bg-gradient-to-br from-gray-50 to-gray-100 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-gradient-to-b from-[#5D20B3] via-[#6B2FC4] to-[#7940D5] text-white hidden md:flex flex-col shadow-2xl relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-32 translate-y-32"></div>
          </div>

          {/* Logo Section */}
          <div className="relative z-10 p-6 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white w-[52px] h-[52px] rounded-xl shadow-lg flex items-center justify-center">
                <Image
                  src="/ReqruitaLogo.png"
                  alt="Reqruita Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Reqruita</h1>
                <p className="text-xs text-purple-200">Dashboard v2.0</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="relative z-10 flex-1 px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`group w-full flex items-center gap-3 text-left py-3.5 px-4 rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-white text-[#5D20B3] font-semibold shadow-lg transform scale-[1.02]"
                    : "text-white/90 hover:bg-white/15 hover:text-white hover:translate-x-1"
                }`}
              >
                <span
                  className={`transition-transform duration-200 ${isActive(item.href) ? "" : "group-hover:scale-110"}`}
                >
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
                {isActive(item.href) && (
                  <div className="ml-auto w-1.5 h-1.5 bg-[#5D20B3] rounded-full"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* User Profile Section in Sidebar */}
          <div className="relative z-10 p-4 mt-auto border-t border-white/20">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                B
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Admin User</p>
                <p className="text-xs text-purple-200">admin@reqruita.com</p>
              </div>
              <svg
                className="w-5 h-5 text-purple-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Nav */}
          <header className="h-20 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 flex items-center justify-between px-8 shadow-sm">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search candidates, jobs, sessions..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all text-gray-700 text-sm"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 ml-8">
              {/* Notifications */}
              <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Settings */}
              <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-300"></div>

              {/* User Profile */}
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded-xl p-2 pr-3 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center font-bold text-white shadow-md">
                  B
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 text-black">
            <div className="max-w-[1600px] mx-auto">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
