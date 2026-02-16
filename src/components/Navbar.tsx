"use client";

export default function Navbar() {
  // Handles user logout — sends a POST to the logout API then redirects to login
  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  }

  return (
    <nav className="flex justify-between items-center py-4 mb-6">
      {/* Brand link — navigates back to the dashboard */}
      <a href="/dashboard">Habit Tracker</a>

      {/* Right-side actions: create a new habit and logout */}
      <div className="flex gap-3 items-center">
        <a href="/dashboard/new">+ New</a>
        <button onClick={logout} className="btn bg-red-600 hover:bg-red-700">
          Logout
        </button>
      </div>
    </nav>
  );
}
