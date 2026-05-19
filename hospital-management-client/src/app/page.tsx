"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const token = window.localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const role = response.data.role;

        if (role === "Admin") {
          router.replace("/admin/dashboard");
        } else if (role === "Doctor") {
          router.replace("/doctor/dashboard");
        } else if (role === "Patient") {
          router.replace("/patient/dashboard");
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Auth redirect failed:", error);
        window.localStorage.removeItem("token");
        router.replace("/login");
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:border-emerald-400"></div>
        <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Loading clinical workspace...
        </p>
      </div>
    </div>
  );
}
