"use client";

import { useTransition } from "react";

// Props interface for the HabitCard component
interface HabitCardProps {
  habit: any;
  refresh: () => void;
}

export default function HabitCard({ habit, refresh }: HabitCardProps) {
  // useTransition keeps the UI responsive while API calls are in progress
  const [isPending, startTransition] = useTransition();

  // Generic action handler — sends a request to the given URL then refreshes the habit list
  function act(url: string, method: string = "POST") {
    startTransition(async () => {
      await fetch(url, { method, credentials: "include" });
      refresh();
    });
  }

  return (
    <div className="card mb-4">
      {/* Habit title */}
      <h3 className="font-semibold">{habit.title}</h3>

      {/* Habit stats: total logs and current streak */}
      <p className="text-sm text-gray-500">
        Total: {habit.totalLogs} — Streak: {habit.currentStreak}
      </p>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        {/* Toggle between "Undo Today" and "Mark Today" based on whether today is logged */}
        {habit.todayLogged ? (
          <button
            disabled={isPending}
            className="btn bg-green-600 hover:bg-green-700"
            onClick={() => act(`/api/habits/${habit._id}/unlog`)}
          >
            Undo Today
          </button>
        ) : (
          <button
            disabled={isPending}
            className="btn"
            onClick={() => act(`/api/habits/${habit._id}/log`)}
          >
            Mark Today
          </button>
        )}

        {/* Delete button — removes the habit entirely */}
        <button
          disabled={isPending}
          className="btn bg-red-600 hover:bg-red-700"
          onClick={() => act(`/api/habits/${habit._id}`, "DELETE")}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
