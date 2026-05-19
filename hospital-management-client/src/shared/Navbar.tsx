"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      axios
        .get("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUserRole(res.data.role);
        })
        .catch((err) => {
          window.localStorage.removeItem("token");
          setIsLoggedIn(false);
          setUserRole(null);
        });
    } else {
      setUserRole(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserRole(null);
    router.push("/login");
  };

  const navLinks = [];

  if (isLoggedIn && userRole) {
    if (userRole === "Doctor") {
      navLinks.push({ name: "Doctor Dashboard", href: "/doctor/dashboard" });
    } else if (userRole === "Admin") {
      navLinks.push({ name: "Admin Dashboard", href: "/admin/dashboard" });
      navLinks.push({ name: "Schedules & Records", href: "/admin/records-schedules" });
      navLinks.push({ name: "Manage Users", href: "/admin/users" });
    } else if (userRole === "Patient") {
      navLinks.push({ name: "Patient Dashboard", href: "/patient/dashboard" });
      navLinks.push({ name: "Medical History", href: "/patient/medical-history" });
    }
  }

  navLinks.push({ name: "Departments", href: "/departments" });

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-200">
                🏥 HMS Clinic
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors duration-200 hover:text-emerald-500 ${
                      isActive ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-red-500 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-all duration-200 active:scale-95"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
