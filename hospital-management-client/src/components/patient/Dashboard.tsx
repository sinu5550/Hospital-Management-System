"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface Doctor {
  id: string;
  fullName: string;
  email: string;
  departmentId?: string;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  diagnosis: string | null;
  prescription: string | null;
  patientId: string;
  doctorId: string;
  patient?: {
    id: string;
    fullName: string;
    email: string;
  };
  doctor: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  const [selectedReportApp, setSelectedReportApp] = useState<Appointment | null>(null);

  const fetchDashboardData = async () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const profileRes = await axios.get("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileRes.data.role !== "Patient") {
        router.replace("/login");
        return;
      }
      setProfile(profileRes.data);

      const appointmentsRes = await axios.get("http://localhost:3000/appointments/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(appointmentsRes.data);

      const deptsRes = await axios.get("http://localhost:3000/departments");
      setDepartments(deptsRes.data);

      const doctorsRes = await axios.get("http://localhost:3000/users/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(doctorsRes.data);
    } catch (err: any) {
      setError("Failed to initialize dashboard. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [router]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess("");

    if (!selectedDoctorId) {
      setBookingError("Please select a specialist doctor.");
      setBookingLoading(false);
      return;
    }

    if (!appointmentDate) {
      setBookingError("Please pick a scheduled appointment date & time.");
      setBookingLoading(false);
      return;
    }

    const dateToBook = new Date(appointmentDate);
    if (dateToBook <= new Date()) {
      setBookingError("Appointment must be scheduled at a future date and time.");
      setBookingLoading(false);
      return;
    }

    const token = window.localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:3000/appointments",
        {
          doctorId: selectedDoctorId,
          appointmentDate: dateToBook.toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookingSuccess("Your clinical consultation has been booked successfully!");
      setSelectedDeptId("");
      setSelectedDoctorId("");
      setAppointmentDate("");
      
      await fetchDashboardData();
    } catch (err: any) {
      setBookingError(err.response?.data?.message || "Failed to schedule appointment. Please verify details.");
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(
    (doc) => !selectedDeptId || doc.departmentId === selectedDeptId
  );

  const totalBookings = appointments.length;
  const pendingCount = appointments.filter((app) => app.status === "Scheduled").length;
  const finalizedCount = appointments.filter((app) => app.status === "Completed").length;

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent dark:border-emerald-400"></div>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading patient portal dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50/50 py-10 dark:bg-zinc-950/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                🏥
              </span>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  Welcome to your Care Portal, {profile?.fullName}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Patient Credentials: {profile?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total Consultations</span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">Booked</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">{totalBookings}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">visits registered</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800"></div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Scheduled (Upcoming)</span>
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">Pending</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">{pendingCount}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">active bookings</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Finalized Consultations</span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">Completed</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">{finalizedCount}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">medical diagnostics</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 mb-8">
          
          <div className="lg:col-span-4 rounded-2xl border border-zinc-200/50 bg-white shadow-md dark:border-zinc-800/50 dark:bg-zinc-900/80 p-6 self-start">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Book a Consultation</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">Select a specialist and secure your session</p>

            <form onSubmit={handleBookAppointment} className="space-y-5">
              
              {bookingError && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200/30">
                  ⚠️ {bookingError}
                </div>
              )}

              {bookingSuccess && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/30">
                  ✅ {bookingSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Clinical Specialty (Department)
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value);
                    setSelectedDoctorId("");
                  }}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-400 cursor-pointer"
                >
                  <option value="">All Specialties / Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Attending Specialist <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-400 cursor-pointer"
                >
                  <option value="">Select a Doctor</option>
                  {filteredDoctors.map((doc) => {
                    const docDept = departments.find((d) => d.id === doc.departmentId);
                    return (
                      <option key={doc.id} value={doc.id}>
                        Dr. {doc.fullName} {docDept ? `— ${docDept.name}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Schedules Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-400 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {bookingLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                    Scheduling...
                  </>
                ) : (
                  "📅 Schedule Consultation Session"
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 space-y-8">
            
            <div className="rounded-2xl border border-zinc-200/50 bg-white shadow-md dark:border-zinc-800/50 dark:bg-zinc-900/80 p-6 md:p-8">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">My Consultation Schedules</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">Track upcoming and past clinical evaluations</p>

              {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-4xl">🗓️</span>
                  <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">No schedules booked</h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                    Use the scheduling panel on the left to book your first clinical consultation!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold">
                        <th className="py-4 font-semibold">Attending Doctor</th>
                        <th className="py-4 font-semibold">Date & Time</th>
                        <th className="py-4 font-semibold">Status</th>
                        <th className="py-4 font-semibold text-right">Records & Reports</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                      {appointments.map((app) => {
                        const appDate = new Date(app.appointmentDate);
                        return (
                          <tr key={app.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                            
                            <td className="py-4">
                              <span className="font-bold text-zinc-900 dark:text-white block">
                                Dr. {app.doctor.fullName}
                              </span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-0.5 animate-pulse">
                                {app.doctor.email}
                              </span>
                            </td>

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

                            <td className="py-4 text-right">
                              {app.status === "Completed" ? (
                                <button
                                  onClick={() => setSelectedReportApp(app)}
                                  className="rounded-lg bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition active:scale-95 cursor-pointer dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                                >
                                  📝 View Report
                                </button>
                              ) : (
                                <span className="text-xs text-zinc-400 italic">Report Pending</span>
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

          </div>

        </div>

        {selectedReportApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-zinc-200/50 bg-white p-6 shadow-2xl dark:border-zinc-800/50 dark:bg-zinc-900 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
              
              <div className="flex items-center justify-between border-b border-zinc-200/50 pb-4 dark:border-zinc-800/50">
                <div>
                  <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    🔬 Official Medical Report
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Consultation session with <span className="font-bold text-zinc-850 dark:text-zinc-200">Dr. {selectedReportApp.doctor.fullName}</span> ({selectedReportApp.doctor.email})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReportApp(null)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-850 dark:hover:text-zinc-300 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 space-y-6">
                
                <div className="grid grid-cols-2 gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/40 text-xs border border-zinc-200/30 dark:border-zinc-850">
                  <div>
                    <span className="text-zinc-500 block">Patient Name</span>
                    <span className="font-bold text-zinc-900 dark:text-white block mt-0.5">{profile?.fullName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Consultation Date</span>
                    <span className="font-bold text-zinc-900 dark:text-white block mt-0.5">
                      {new Date(selectedReportApp.appointmentDate).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Clinical Diagnosis Details</h4>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 dark:bg-zinc-900/20 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 whitespace-pre-line italic">
                    {selectedReportApp.diagnosis}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Medication & Doctor Instructions</h4>
                  <p className="mt-1 text-sm text-zinc-755 dark:text-zinc-300 bg-zinc-50/50 dark:bg-zinc-900/20 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 whitespace-pre-line">
                    {selectedReportApp.prescription}
                  </p>
                </div>

              </div>

              <div className="flex items-center justify-end border-t border-zinc-200/50 pt-4 mt-6 dark:border-zinc-800/50 gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50 transition cursor-pointer"
                >
                  🖨️ Print Report
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReportApp(null)}
                  className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition cursor-pointer"
                >
                  Close Report
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
