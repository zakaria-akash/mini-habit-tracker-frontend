"use client";

import { useState, useTransition } from "react";
import Navbar from "../../../components/Navbar";

export default function NewHabitPage() {
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/habits", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        const data = await res.json();
        setMsg(data.message || "Failed to create habit");
      }
    });
  }

  return (
    <div className="py-10">
      <Navbar />

      <h1 className="text-2xl font-bold mb-6 text-center">New Habit</h1>

      <form onSubmit={submit} className="card flex flex-col gap-4 max-w-md mx-auto">
        <input
          className="input"
          type="text"
          placeholder="Habit title (e.g. Read 10 pages)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="flex gap-3">
          <button disabled={isPending} className="btn">
            {isPending ? "Creating..." : "Create Habit"}
          </button>
          <a href="/dashboard" className="btn bg-gray-500 hover:bg-gray-600">
            Cancel
          </a>
        </div>

        {msg && <p className="text-red-600 text-sm">{msg}</p>}
      </form>
    </div>
  );
}
