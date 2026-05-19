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

interface Appointment {
  id: string;
  appointmentDate: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  diagnosis: string | null;
  prescription: string | null;
  patientId: string;
  doctorId: string;
  doctor: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

export default function PatientMedicalHistory() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
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
        const patientId = profileRes.data.id;

        const historyRes = await axios.get(`http://localhost:3000/patients/${patientId}/medical-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMedicalHistory(historyRes.data);
      } catch (err: any) {
        setError("Failed to fetch medical history records. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent dark:border-emerald-400"></div>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Accessing medical records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50/50 py-10 dark:bg-zinc-950/20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              📂
            </span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                My Health Records
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Patient: <span className="font-bold text-zinc-700 dark:text-zinc-300">{profile?.fullName}</span> ({profile?.email})
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
            ⚠️ {error}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200/50 bg-white shadow-md dark:border-zinc-800/50 dark:bg-zinc-900/80 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Clinical Medical History Timeline</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Official chronological log of diagnosed consultations and active medications</p>
          </div>

          {medicalHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-4xl">📂</span>
              <h4 className="mt-4 text-sm font-bold text-zinc-850 dark:text-white">No history logs recorded</h4>
              <p className="mt-1 text-xs text-zinc-400 max-w-sm">
                You do not have any historical medical diagnostics finalized yet. When an attending physician writes a diagnosis report, it will display here!
              </p>
            </div>
          ) : (
            <div className="relative pl-6 border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-8 py-2">
              {medicalHistory.map((historyApp) => {
                const histDate = new Date(historyApp.appointmentDate);
                return (
                  <div key={historyApp.id} className="relative">
                    
                    <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border bg-white dark:bg-zinc-900 border-emerald-500 text-emerald-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    </span>

                    <div className="rounded-xl border border-zinc-200/60 bg-zinc-50/40 p-5 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/30 transition">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-150 pb-2 mb-3 dark:border-zinc-850">
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                          📅 {histDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                          Attending Specialist: <span className="font-bold text-zinc-900 dark:text-white">Dr. {historyApp.doctor.fullName}</span>
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h5 className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Clinical Diagnosis Details</h5>
                          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/60 p-3 rounded-lg border border-zinc-150 dark:border-zinc-850 italic">
                            {historyApp.diagnosis}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Prescribed Medication & Dosage Instructions</h5>
                          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/60 p-3 rounded-lg border border-zinc-150 dark:border-zinc-850 whitespace-pre-line">
                            {historyApp.prescription}
                          </p>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
