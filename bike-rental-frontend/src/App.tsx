import "./App.css";
import ThemeToggle from "./components/common/ThemeToggle";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl border border-border bg-card p-10 shadow-lg">
          <h1 className="text-4xl font-bold text-primary">
            Bike Rental System
          </h1>

          <p className="mt-3 text-muted-foreground">
            React + TypeScript + Tailwind CSS v4 Testing
          </p>

          <button className="mt-6 rounded-lg bg-primary px-5 py-2 text-primary-foreground hover:opacity-90">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;