"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface HabitCardProps {
  habit: any;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function act(url: string, method: string = "POST") {
    startTransition(async () => {
      await fetch(url, { method, credentials: "include" });
      router.refresh();
    });
  }

  return (
    <div className="card mb-4">
      <h3 className="font-semibold">{habit.title}</h3>

      <p className="text-sm text-gray-500">
        Total: {habit.totalLogs} — Streak: {habit.currentStreak}
      </p>

      <div className="flex gap-2 mt-3">
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
