"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  unread?: boolean;
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: "Interview Scheduled",
      message:
        "Sarah Johnson has confirmed the technical interview for tomorrow at 10:30 AM and shared her updated portfolio link.",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Candidate Submitted",
      message:
        "A new candidate application was submitted for the Senior Frontend Engineer role and is now ready for review.",
      time: "22 min ago",
      unread: true,
    },
    {
      id: 3,
      title: "Session Recording Ready",
      message:
        "The recording for your last panel interview session has finished processing and can now be viewed from Sessions.",
      time: "1 hour ago",
    },
    {
      id: 4,
      title: "Job Form Updated",
      message:
        "The Product Designer job form was updated by the hiring manager with a new required design challenge section.",
      time: "3 hours ago",
    },
  ]);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const hasUnreadNotifications = notifications.some(
    (notification) => notification.unread,
  );

  const navItems = [
    {
      label: "Home",
      href: "/home",
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
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleSelectNotification = (notification: NotificationItem) => {
    setSelectedNotification({ ...notification, unread: false });
    setNotifications((prevNotifications) =>
      prevNotifications.map((item) =>
        item.id === notification.id ? { ...item, unread: false } : item,
      ),
    );
  };

  const getNotificationPreview = (message: string) => {
    if (message.length <= 64) {
      return message;
    }
    return `${message.slice(0, 64)}...`;
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    setIsProfileMenuOpen(false);
    router.push("/signup");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex h-screen overflow-hidden w-full">
      <aside className="w-72 bg-gradient-to-b from-[#5D20B3] via-[#6B2FC4] to-[#7940D5] text-white hidden md:flex flex-col shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-32 translate-y-32"></div>
        </div>

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
                className={`transition-transform duration-200 ${
                  isActive(item.href) ? "" : "group-hover:scale-110"
                }`}
              >
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 flex items-center justify-between px-8 shadow-sm">
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

          <div className="flex items-center gap-4 ml-8">
            <button
              className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Open notifications"
              onClick={() => {
                setIsNotificationOpen((prev) => !prev);
                if (!selectedNotification && notifications.length > 0) {
                  handleSelectNotification(notifications[0]);
                }
              }}
            >
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
              {hasUnreadNotifications && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            <div className="h-8 w-px bg-gray-300"></div>

            <div className="relative" ref={profileMenuRef}>
              <button
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded-xl p-2 pr-3 transition-colors"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                aria-label="Open profile menu"
              >
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
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
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
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-40 overflow-hidden">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
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
                    Settings
                  </Link>
                  <div className="h-px bg-gray-100"></div>
                  <button
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 text-black">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>

      {isNotificationOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsNotificationOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Notifications
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Click any notification to read its full message.
                </p>
              </div>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close notifications"
                onClick={() => setIsNotificationOpen(false)}
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[420px]">
              <div className="border-r border-gray-100 max-h-[70vh] overflow-y-auto">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={`w-full text-left px-5 py-4 border-b border-gray-100 last:border-b-0 transition-colors ${
                      selectedNotification?.id === notification.id
                        ? "bg-purple-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectNotification(notification)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          {notification.title}
                          {notification.unread && (
                            <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                          {getNotificationPreview(notification.message)}
                        </p>
                      </div>
                      <span className="text-[11px] text-gray-500 whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-5 bg-gray-50">
                {selectedNotification ? (
                  <>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Full Notification
                    </p>
                    <h4 className="text-base font-semibold text-gray-800 mt-2">
                      {selectedNotification.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 mb-4">
                      {selectedNotification.time}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedNotification.message}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    Select a notification from the left to read it.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
