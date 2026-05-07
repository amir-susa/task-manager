import { useEffect, useState } from "react";
import API from "./api";
import Auth from "./components/Auth";
import Kanban from "./components/Kanban";

function App() {
  const [user, setUser] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingUser(false);
      return;
    }

    API.get("/auth/me")
      .then(() => setUser(true))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(false);
      })
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("light-theme", theme === "light");
    document.documentElement.classList.toggle("dark-theme", theme === "dark");
  }, [theme]);

  if (loadingUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
        <div className="text-sm text-slate-400">Checking authentication…</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {user ? (
        <Kanban setUser={setUser} theme={theme} setTheme={setTheme} />
      ) : (
        <Auth setUser={setUser} theme={theme} setTheme={setTheme} />
      )}
    </div>
  );
}

export default App;