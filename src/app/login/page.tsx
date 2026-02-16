"use client";

import { useState, useTransition } from "react";

export default function LoginPage() {
  // Form state to track email and password input values
  const [form, setForm] = useState({ email: "", password: "" });

  // Message state to display error feedback from the server
  const [msg, setMsg] = useState("");

  // useTransition keeps the UI responsive during the async login request
  const [isPending, startTransition] = useTransition();

  // Handle form submission: send login credentials to the API
  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // On success, redirect to dashboard; otherwise show the error message
      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        const data = await res.json();
        setMsg(data.message);
      }
    });
  }

  return (
    <div className="py-10">
      {/* Page title — centered on all screen sizes */}
      <h1 className="text-2xl font-bold mb-6 text-center">Log in</h1>

      {/* Login form — constrained width and horizontally centered */}
      <form onSubmit={submit} className="card flex flex-col gap-4 max-w-md mx-auto">
        {/* Email input field */}
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* Password input field */}
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {/* Submit button — shows loading text while the request is in progress */}
        <button disabled={isPending} className="btn">
          {isPending ? "Logging in..." : "Log in"}
        </button>

        {/* Error message displayed when the login request fails */}
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
      </form>
    </div>
  );
}
