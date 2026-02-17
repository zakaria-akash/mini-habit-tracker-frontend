import { cookies } from "next/headers";
import Navbar from "../../components/Navbar";
import HabitCard from "../../components/HabitCard";

// Server-side data fetcher — loads all habits from the API
// Forwards the browser cookies so the backend can authenticate the request
async function loadHabits() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/habits`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });

    if (res.status === 401) {
      return { habits: [], unauthorized: true, error: false };
    }

    return { habits: await res.json(), unauthorized: false, error: false };
  } catch {
    return { habits: [], unauthorized: false, error: true };
  }
}

export default async function DashboardPage() {
  const { habits, unauthorized, error } = await loadHabits();

  if (error) {
    return (
      <div className="py-10">
        <Navbar />
        <div className="card max-w-md mx-auto text-center text-red-600">
          Unable to connect to the server. Please make sure the backend is running.
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="py-10">
        <Navbar />
        <div className="card max-w-md mx-auto text-center">
          You must log in. <a href="/login" className="text-blue-600 underline">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <Navbar />

      <h1 className="text-2xl font-bold mb-4 text-center">Your Habits</h1>

      {habits.length === 0 ? (
        <div className="card max-w-md mx-auto text-center">
          No habits yet.{" "}
          <a href="/dashboard/new" className="text-blue-600 underline">Create one</a>
        </div>
      ) : (
        habits.map((habit: any) => (
          <HabitCard key={habit._id} habit={habit} />
        ))
      )}
    </div>
  );
}
