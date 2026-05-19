"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  departmentId?: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  diagnosis: string | null;
  prescription: string | null;
  patientId: string;
  doctorId: string;
  patient: {
    id: string;
    fullName: string;
    email: string;
  };
  doctor?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Scheduled" | "Completed" | "Cancelled">("All");

  // Write Report Modal State
  const [reportModalApp, setReportModalApp] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState("");

  // Patient History Sidebar/Modal State
  const [historyPatient, setHistoryPatient] = useState<{ id: string; fullName: string; email: string } | null>(null);
  const [patientHistory, setPatientHistory] = useState<Appointment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Fetch all Doctor data
  const fetchDashboardData = async () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      // 1. Get profile details
      const profileRes = await axios.get("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileRes.data.role !== "Doctor") {
        router.replace("/login");
        return;
      }

      setProfile(profileRes.data);

      // 2. Fetch doctor's appointments
      const appointmentsRes = await axios.get("http://localhost:3000/appointments/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(appointmentsRes.data);

      // 3. Fetch Department details if available
      if (profileRes.data.departmentId) {
        try {
          const deptRes = await axios.get(`http://localhost:3000/departments/${profileRes.data.departmentId}`);
          setDepartment(deptRes.data);
        } catch (deptErr) {
          console.error("Failed to load department details:", deptErr);
        }
      }
    } catch (err: any) {
      setError("Failed to load dashboard data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [router]);

  // Handle Opening Medical History
  const handleOpenMedicalHistory = async (patient: { id: string; fullName: string; email: string }) => {
    setHistoryPatient(patient);
    setLoadingHistory(true);
    setHistoryError("");
    setPatientHistory([]);

    const token = window.localStorage.getItem("token");
    try {
      const historyRes = await axios.get(`http://localhost:3000/patients/${patient.id}/medical-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatientHistory(historyRes.data);
    } catch (err: any) {
      setHistoryError(err.response?.data?.message || "Failed to load patient medical history.");
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle consultation report submission
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalApp) return;

    setSubmittingReport(true);
    setReportError("");

    const token = window.localStorage.getItem("token");
    try {
      await axios.patch(
        `http://localhost:3000/appointments/${reportModalApp.id}/report`,
        { diagnosis, prescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh appointments and close modal
      await fetchDashboardData();
      setReportModalApp(null);
      setDiagnosis("");
      setPrescription("");
    } catch (err: any) {
      setReportError(err.response?.data?.message || "Failed to submit consultation report.");
      console.error(err);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Helper Stats
  const totalConsultations = appointments.length;
  const scheduledCount = appointments.filter((app) => app.status === "Scheduled").length;
  const completedCount = appointments.filter((app) => app.status === "Completed").length;

  // Filtered Appointments list
  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch = app.patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "All") return matchesSearch;
    return app.status === statusFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent dark:border-emerald-400"></div>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Retrieving clinic records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50/50 py-10 dark:bg-zinc-950/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Profile/Welcome Section */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                🩺
              </span>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  Welcome back, Dr. {profile?.fullName}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Registered Professional: {profile?.email}
                </p>
              </div>
            </div>
          </div>
          {department && (
            <div className="self-start rounded-2xl border border-emerald-200/50 bg-emerald-50/30 px-5 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/10">
              <span className="block text-xs font-semibold text-emerald-600 uppercase tracking-wider dark:text-emerald-400">
                Department Specialty
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                {department.name} ({department.code})
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* Dashboard Statistics Grid */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Total */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total Assigned Consultations</span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">Cumulative</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">{totalConsultations}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">patients booked</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800"></div>
          </div>

          {/* Pending */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Scheduled Consultations</span>
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">Pending</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">{scheduledCount}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">waiting for report</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
          </div>

          {/* Completed */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Completed Reports</span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">Successful</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">{completedCount}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">reports generated</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
          </div>
        </div>

        {/* Dynamic Consultation Schedule Controller */}
        <div className="rounded-2xl border border-zinc-200/50 bg-white shadow-md dark:border-zinc-800/50 dark:bg-zinc-900/80 p-6 md:p-8">
          
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Dynamic Consultation Schedule</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Filter, find, and update medical evaluations</p>
            </div>
            
            {/* Search and Filter Inputs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patient by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 rounded-xl border border-zinc-300 bg-white pl-9 pr-4 py-2 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-400"
                />
                <span className="absolute left-3 top-2.5 text-zinc-400">🔍</span>
              </div>

              {/* Status Selectors */}
              <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
                {(["All", "Scheduled", "Completed", "Cancelled"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      statusFilter === filter
                        ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                        : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Appointments Table / Grid View */}
          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-4xl">📭</span>
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">No consultations found</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
                Try modifying your filter options or verifying patient bookings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold">
                    <th className="py-4 font-semibold">Patient</th>
                    <th className="py-4 font-semibold">Scheduled Date & Time</th>
                    <th className="py-4 font-semibold">Status</th>
                    <th className="py-4 font-semibold">Reports & History</th>
                    <th className="py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {filteredAppointments.map((app) => {
                    const appDate = new Date(app.appointmentDate);
                    return (
                      <tr key={app.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                        
                        {/* Patient info */}
                        <td className="py-4">
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white block">
                              {app.patient.fullName}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-0.5">
                              {app.patient.email}
                            </span>
                          </div>
                        </td>

                        {/* Date info */}
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-300">
                              {appDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                              ⏰ {appDate.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                            app.status === "Scheduled"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                              : app.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              app.status === "Scheduled" ? "bg-amber-500" : app.status === "Completed" ? "bg-emerald-500" : "bg-red-500"
                            }`}></span>
                            {app.status}
                          </span>
                        </td>

                        {/* Report preview or Patient History trigger */}
                        <td className="py-4">
                          <div className="flex flex-col gap-1 max-w-xs">
                            {app.status === "Completed" ? (
                              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-300">Diagnosis: </span>
                                <span className="line-clamp-1 italic">{app.diagnosis}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-400 italic">Consultation pending evaluation</span>
                            )}
                            <button
                              onClick={() => handleOpenMedicalHistory(app.patient)}
                              className="text-left text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                            >
                              📋 View Medical History
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 text-right">
                          {app.status === "Scheduled" ? (
                            <button
                              onClick={() => {
                                setReportModalApp(app);
                                setDiagnosis("");
                                setPrescription("");
                                setReportError("");
                              }}
                              className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition active:scale-95 cursor-pointer"
                            >
                              ✍️ Write Report
                            </button>
                          ) : app.status === "Completed" ? (
                            <button
                              onClick={() => {
                                setReportModalApp(app);
                                setDiagnosis(app.diagnosis || "");
                                setPrescription(app.prescription || "");
                                setReportError("");
                              }}
                              className="rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50 transition cursor-pointer"
                            >
                              🔍 View/Edit Report
                            </button>
                          ) : (
                            <span className="text-xs text-zinc-400 italic">Cancelled</span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Report Editor Modal */}
        {reportModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-zinc-200/50 bg-white p-6 shadow-2xl dark:border-zinc-800/50 dark:bg-zinc-900 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
              
              <div className="flex items-center justify-between border-b border-zinc-200/50 pb-4 dark:border-zinc-800/50">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {reportModalApp.status === "Completed" ? "Update Consultation Report" : "Create Consultation Report"}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Patient: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{reportModalApp.patient.fullName}</span> ({reportModalApp.patient.email})
                  </p>
                </div>
                <button
                  onClick={() => setReportModalApp(null)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-850 dark:hover:text-zinc-300 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="mt-6 space-y-6">
                
                {reportError && (
                  <div className="rounded-xl bg-red-50 p-3.5 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200/30">
                    ⚠️ {reportError}
                  </div>
                )}

                <div>
                  <label htmlFor="diagnosis" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Clinical Diagnosis <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="diagnosis"
                    rows={4}
                    required
                    placeholder="Enter the primary clinical findings, observations, and diagnosis..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label htmlFor="prescription" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Prescribed Medication & Instructions <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="prescription"
                    rows={6}
                    required
                    placeholder="Enter detailed prescription instructions, medication schedules, and follow-up recommendations..."
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-zinc-200/50 pt-4 dark:border-zinc-800/50">
                  <button
                    type="button"
                    onClick={() => setReportModalApp(null)}
                    className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {submittingReport ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                        Saving Report...
                      </>
                    ) : (
                      "💾 Save & Complete Report"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Patient Medical History Drawer/Modal */}
        {historyPatient && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-white dark:bg-zinc-900 h-full p-6 shadow-2xl flex flex-col max-h-screen overflow-y-auto animate-in slide-in-from-right duration-250 border-l border-zinc-200 dark:border-zinc-800">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-200/50 pb-4 dark:border-zinc-800/50">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Medical History Log
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Patient Profile: <span className="font-bold text-zinc-800 dark:text-zinc-200">{historyPatient.fullName}</span>
                  </p>
                </div>
                <button
                  onClick={() => setHistoryPatient(null)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-850 dark:hover:text-zinc-300 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Content */}
              <div className="mt-6 flex-1 flex flex-col overflow-y-auto">
                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-solid border-emerald-600 border-r-transparent"></div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Loading historical clinical records...</span>
                  </div>
                ) : historyError ? (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200/30">
                    ⚠️ {historyError}
                  </div>
                ) : patientHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="text-3xl">📂</span>
                    <h4 className="mt-4 text-sm font-bold text-zinc-800 dark:text-white">No history records found</h4>
                    <p className="mt-1 text-xs text-zinc-400 max-w-xs">
                      This patient does not have any previously finalized consultation visits in our logs.
                    </p>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-8 py-2">
                    {patientHistory.map((historyApp) => {
                      const historyDate = new Date(historyApp.appointmentDate);
                      return (
                        <div key={historyApp.id} className="relative">
                          {/* Dot Indicator */}
                          <span className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border bg-white dark:bg-zinc-900 ${
                            historyApp.status === "Completed"
                              ? "border-emerald-500 text-emerald-500"
                              : "border-zinc-300 text-zinc-300"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              historyApp.status === "Completed" ? "bg-emerald-500" : "bg-zinc-400"
                            }`}></span>
                          </span>

                          <div className="rounded-xl border border-zinc-200/60 bg-zinc-50/40 p-4 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/30 transition">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-150 pb-2 mb-3 dark:border-zinc-850">
                              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                📅 {historyDate.toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span className={`inline-flex self-start items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                                historyApp.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20"
                              }`}>
                                {historyApp.status}
                              </span>
                            </div>

                            {/* Attending physician */}
                            {historyApp.doctor && (
                              <div className="mb-3 text-xs">
                                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Attending Physician: </span>
                                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                                  Dr. {historyApp.doctor.fullName}
                                </span>
                              </div>
                            )}

                            {/* Clinical details */}
                            {historyApp.status === "Completed" ? (
                              <div className="space-y-2.5">
                                <div>
                                  <h5 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Clinical Diagnosis</h5>
                                  <p className="mt-1 text-sm text-zinc-650 dark:text-zinc-300 bg-white dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-150 dark:border-zinc-850 italic">
                                    {historyApp.diagnosis}
                                  </p>
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Prescription & Instructions</h5>
                                  <p className="mt-1 text-sm text-zinc-650 dark:text-zinc-300 bg-white dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-150 dark:border-zinc-850 whitespace-pre-line">
                                    {historyApp.prescription}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-zinc-400 italic">No report available for scheduled consultation visits.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-zinc-200/50 pt-4 mt-6 dark:border-zinc-800/50 flex justify-end">
                <button
                  onClick={() => setHistoryPatient(null)}
                  className="w-full sm:w-auto rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition cursor-pointer"
                >
                  Close Records
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
