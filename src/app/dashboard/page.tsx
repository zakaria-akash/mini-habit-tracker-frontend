import Navbar from "../../components/Navbar";
import HabitCard from "../../components/HabitCard";

// Server-side data fetcher — loads all habits from the API
// Uses no-store cache to always get fresh data on each request
async function loadHabits() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/habits`, {
      credentials: "include",
      cache: "no-store",
    });

    // If the user is not authenticated, return an empty list with an unauthorized flag
    if (res.status === 401) {
      return { habits: [], unauthorized: true, error: false };
    }

    return { habits: await res.json(), unauthorized: false, error: false };
  } catch {
    // Network error — backend is likely not running
    return { habits: [], unauthorized: false, error: true };
  }
}

export default async function DashboardPage() {
  // Fetch habits on the server before rendering the page
  const { habits, unauthorized, error } = await loadHabits();

  // If the backend is unreachable, show a connection error message
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

  // If the user is not logged in, show a message with a link to the login page
  if (unauthorized) {
    return (
      <div className="py-10">
        <Navbar />
        <div className="card">
          You must log in. <a href="/login">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <Navbar />

      {/* Page title — centered on all screen sizes */}
      <h1 className="text-2xl font-bold mb-4 text-center">Your Habits</h1>

      {/* If no habits exist, show a prompt to create one; otherwise render habit cards */}
      {habits.length === 0 ? (
        <div className="card max-w-md mx-auto">
          No habits yet. <a href="/dashboard/new">Create one</a>
        </div>
      ) : (
        habits.map((habit: any) => (
          <HabitCard
            key={habit._id}
            habit={habit}
            refresh={() => {
              location.reload();
            }}
          />
        ))
      )}
    </div>
  );
}
