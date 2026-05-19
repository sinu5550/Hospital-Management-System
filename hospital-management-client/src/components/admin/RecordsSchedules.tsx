"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserInfo {
  id: string;
  fullName: string;
  email: string;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  status: string;
  diagnosis?: string;
  prescription?: string;
  patient: UserInfo;
  doctor: UserInfo;
}

export default function RecordsSchedules() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
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

        const appRes = await axios.get("http://localhost:3000/appointments/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(appRes.data);
      } catch (err: any) {
        setError("Failed to load clinical schedules and medical records.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [router]);

  const filteredAppointments = appointments.filter((app) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "scheduled" && app.status.toLowerCase() === "scheduled") ||
      (filter === "completed" && app.status.toLowerCase() === "completed");

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      app.patient.fullName.toLowerCase().includes(query) ||
      app.doctor.fullName.toLowerCase().includes(query) ||
      app.patient.email.toLowerCase().includes(query) ||
      app.doctor.email.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent dark:border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-1">
            <Link href="/admin/dashboard" className="hover:text-emerald-500 transition-colors">
              Dashboard
            </Link>
            <span>&middot;</span>
            <span className="text-zinc-900 dark:text-white font-medium">Schedules & Records</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Medical Records & Schedules
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Monitor real-time clinical schedules and view completed patient medical files
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              filter === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
            }`}
          >
            All Schedules
          </button>
          <button
            onClick={() => setFilter("scheduled")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              filter === "scheduled"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
            }`}
          >
            Scheduled Only
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              filter === "completed"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
            }`}
          >
            Completed Records
          </button>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by doctor or patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-950 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="rounded-xl border border-zinc-200/50 bg-white p-12 text-center shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No scheduling activities or medical records match your criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200/50 bg-white shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Appointment Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Patient Details
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Assigned Doctor
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredAppointments.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-white">
                    {formatDate(app.appointmentDate)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-zinc-900 dark:text-white block">
                      {app.patient?.fullName || "Unknown Patient"}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-0.5">
                      {app.patient?.email}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-zinc-900 dark:text-white block">
                      {app.doctor?.fullName || "Unassigned Doctor"}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-0.5">
                      {app.doctor?.email}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        app.status.toLowerCase() === "completed"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="text-emerald-600 hover:text-emerald-500 font-semibold cursor-pointer"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Clinical Consultation Report
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  selectedApp.status.toLowerCase() === "completed"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                }`}
              >
                {selectedApp.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Patient Details
                  </span>
                  <span className="mt-1 font-bold text-zinc-900 dark:text-white block">
                    {selectedApp.patient?.fullName}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                    {selectedApp.patient?.email}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Assigned Clinician
                  </span>
                  <span className="mt-1 font-bold text-zinc-900 dark:text-white block">
                    {selectedApp.doctor?.fullName}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                    {selectedApp.doctor?.email}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Scheduled Consultation Date
                </span>
                <span className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white block">
                  {formatDate(selectedApp.appointmentDate)}
                </span>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Diagnosis Record
                </span>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/40 text-sm text-zinc-900 dark:text-zinc-200">
                  {selectedApp.diagnosis || "No diagnosis statements recorded for this schedule yet."}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Prescription Record
                </span>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/40 text-sm text-zinc-900 dark:text-zinc-200 font-mono">
                  {selectedApp.prescription || "No prescriptions issued for this schedule yet."}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors cursor-pointer dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
