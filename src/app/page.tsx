const HomePage = () => {
  return (
    <div className="py-20 text-center">
      <h1 className="text-4xl font-bold mb-6">Mini Habit Tracker</h1>
      <p className="text-gray-600 mb-6">
        Track your daily habits. Stay consistent. Improve every day.
      </p>

      <div className="flex justify-center gap-4">
        <a href="/signup">Sign up</a>
        <a href="/login">Log in</a>
      </div>
    </div>
  );
};

export default HomePage;
