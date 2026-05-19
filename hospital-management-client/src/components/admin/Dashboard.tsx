"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [totalDepts, setTotalDepts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = window.localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        const profileRes = await axios.get("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileRes.data.role !== "Admin") {
          router.replace("/login");
          return;
        }

        setProfile(profileRes.data);

        const deptsRes = await axios.get("http://localhost:3000/departments");
        setTotalDepts(deptsRes.data.length);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent dark:border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Administrator Dashboard
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Welcome back, {profile?.fullName || "System Administrator"}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="rounded-xl border border-zinc-200/50 bg-white p-6 shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Total Specialties
            </span>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Active
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              {totalDepts}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              clinical departments
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200/50 bg-white p-6 shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Administrative User
            </span>
            <span className="rounded-full bg-blue-100 dark:bg-blue-950/40 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              Role
            </span>
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-zinc-950 dark:text-white block truncate">
              {profile?.email}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-1">
              System credentials verified
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200/50 bg-white p-6 shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Security Level
            </span>
            <span className="rounded-full bg-purple-100 dark:bg-purple-950/40 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
              Superuser
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400 block">
              Full Access
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-2">
              All write/delete controls enabled
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200/50 bg-white shadow-md dark:border-zinc-800/50 dark:bg-zinc-900 p-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/departments"
            className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <div>
              <span className="font-semibold text-zinc-900 dark:text-white block">
                Manage Clinical Departments
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Create, update, and remove specialties dynamically
              </span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">&rarr;</span>
          </Link>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 opacity-60 dark:border-zinc-800">
            <div>
              <span className="font-semibold text-zinc-900 dark:text-white block">
                Medical Records & Schedules
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                View appointments and patient history channels
              </span>
            </div>
            <span className="text-zinc-400 font-bold">&rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
}
