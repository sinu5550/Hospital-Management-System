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

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = window.localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setFullName(res.data.fullName);
        setEmail(res.data.email);
      } catch (err: any) {
        setError("Failed to load profile details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    if (password && password !== confirmPassword) {
      setValidationError("Passwords do not match. Please verify your credentials.");
      return;
    }

    if (password && password.length < 6) {
      setValidationError("New password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);
    const token = window.localStorage.getItem("token");

    try {
      const payload: any = { fullName, email };
      if (password) {
        payload.password = password;
      }

      const res = await axios.patch("http://localhost:3000/users/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage("Your profile information has been securely updated!");
      setProfile(res.data);
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setValidationError(err.response?.data?.message || "Failed to update profile details.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent dark:border-emerald-400"></div>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Syncing with secure server...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50/50 py-12 dark:bg-zinc-950/20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
            ⚠️ {error}
          </div>
        )}

        <div className="rounded-3xl border border-zinc-200/50 bg-white shadow-xl dark:border-zinc-800/50 dark:bg-zinc-900 overflow-hidden">
          
          <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-12 text-center dark:from-emerald-950/60 dark:to-teal-950/60">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-emerald-50 text-2xl font-bold text-emerald-700 shadow-md dark:border-zinc-900 dark:bg-zinc-850 dark:text-emerald-400">
              {getInitials(profile?.fullName || "")}
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">{profile?.fullName}</h1>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider backdrop-blur-sm">
              🛡️ {profile?.role} Role
            </span>
          </div>

          <div className="p-8 sm:p-10">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              {validationError && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-755 border border-red-200/30 dark:bg-red-950/20 dark:text-red-400">
                  ⚠️ {validationError}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-755 border border-emerald-200/30 dark:bg-emerald-950/20 dark:text-emerald-400 animate-pulse">
                  ✅ {successMessage}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Full Profile Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-200/50 pt-6 dark:border-zinc-800/50">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Modify Security Password</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">Leave fields blank if you do not wish to update your login password</p>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      New Security Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Verify new password"
                      className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                    Saving Profile Credentials...
                  </>
                ) : (
                  "💾 Save Profile Credentials"
                )}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
