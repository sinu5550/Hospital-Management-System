"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchDepartments();
    checkAdminRole();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/departments");
      setDepartments(response.data);
    } catch (err: any) {
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  const checkAdminRole = async () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      setIsAdmin(false);
      return;
    }
    try {
      const response = await axios.get("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAdmin(response.data.role === "Admin");
    } catch (err) {
      setIsAdmin(false);
    }
  };

  const openCreateModal = () => {
    setEditingDept(null);
    setForm({ name: "", code: "", description: "" });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    const token = window.localStorage.getItem("token");
    if (!token) {
      setFormError("Unauthorized session. Please log in.");
      setFormLoading(false);
      return;
    }

    try {
      if (editingDept) {
        await axios.patch(
          `http://localhost:3000/departments/${editingDept.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Department updated successfully!");
      } else {
        await axios.post(
          "http://localhost:3000/departments",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Department created successfully!");
      }
      setModalOpen(false);
      fetchDepartments();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }
    const token = window.localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized operation.");
      return;
    }
    try {
      await axios.delete(`http://localhost:3000/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Department deleted successfully!");
      fetchDepartments();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete department.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Clinical Departments
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            View, schedule, and manage medical specialties across the clinic
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Create Department
          </button>
        )}
      </div>

      {success && (
        <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent dark:border-emerald-400"></div>
        </div>
      ) : departments.length === 0 ? (
        <div className="rounded-xl border border-zinc-200/50 bg-white p-12 text-center shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No clinical departments found. Please contact administration.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200/50 bg-white shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Code
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Description
                </th>
                {isAdmin && (
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {departments.map((dept) => (
                <tr
                  key={dept.id}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-white">
                    {dept.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-emerald-600 dark:text-emerald-400">
                    {dept.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300 max-w-xs truncate">
                    {dept.description || "-"}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right text-sm gap-2">
                      <button
                        onClick={() => openEditModal(dept)}
                        className="mr-3 text-emerald-600 hover:text-emerald-500 font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="text-red-600 hover:text-red-500 font-semibold cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-300">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
              {editingDept ? "Edit Department" : "Create Department"}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="e.g. Cardiology"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="e.g. CARD"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="Clinical objectives and specialties description..."
                />
              </div>

              {formError && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
