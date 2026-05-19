"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/auth/login", formData);
      const accessToken = response.data.accessToken;
      
      window.localStorage.setItem("token", accessToken);
      setToken(accessToken);

      try {
        const userResponse = await axios.get("http://localhost:3000/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        const userRole = userResponse.data.role;
        setRole(userRole);

        if (userRole === "Admin") {
          router.push("/admin/dashboard");
        } else if (userRole === "Doctor") {
          router.push("/doctor/dashboard");
        } else if (userRole === "Patient") {
          router.push("/patient/dashboard");
        } else {
          setError("Unknown user role. Please contact support.");
        }
      } catch (profileError: any) {
        if (profileError.response) {
          setError(profileError.response.data.message || "Failed to load user profile.");
        } else {
          setError("An error occurred while loading profile details.");
        }
      }
    } catch (loginError: any) {
      if (loginError.response) {
        setError(loginError.response.data.message || "Invalid email or password.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/50 bg-white p-8 shadow-xl dark:border-zinc-800/50 dark:bg-zinc-900 transition-all duration-300">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Log in to manage your consultations and profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-950 shadow-sm outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-950 shadow-sm outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-emerald-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-250 hover:bg-emerald-500 active:scale-98 disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        {token && (
          <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
            Login successful! Session initialized.
          </div>
        )}

        <div className="mt-6 text-center text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Don&apos;t have an account? </span>
          <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
