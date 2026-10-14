import { useCallback, useState } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import BooksPage from "./pages/BooksPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token"),
  );
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  }, []);

  if (!isAuthenticated) {
    if (showRegister) {
      return <Register onGoToLogin={() => setShowRegister(false)} />;
    }

    return (
      <Login
        onLogin={handleLogin}
        onGoToRegister={() => setShowRegister(true)}
      />
    );
  }

  return <BooksPage onLogout={handleLogout} />;
}

export default App;
