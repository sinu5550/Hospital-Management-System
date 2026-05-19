"use client";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-200/50 bg-zinc-50 dark:border-zinc-800/50 dark:bg-zinc-950 py-8 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              🏥 HMS Clinic
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            &copy; {currentYear} Hospital Management System. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 transition-colors duration-250"
            >
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 transition-colors duration-250"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
