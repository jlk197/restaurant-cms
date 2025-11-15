import { useState } from "react";
import { Button, Alert } from "react-bootstrap";
import Loader from "../../components/Loader";
import apiService from "../../services/apiService";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await apiService.login(email, password);

      if (data && data.success) {
        onLoginSuccess(data.token);
      } else {
        setError(data?.error || "Nieprawidłowe dane logowania");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Błąd połączenia z serwerem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <form onSubmit={handleLogin}>
        <div className="container min-vh-100 d-flex justify-content-center align-items-center">
          <div className="col-6 text-center">
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <input
              type="email"
              className="form-control p-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="form-control mt-3 p-3"
              placeholder="Hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="mt-5 p-3 w-100"
              disabled={isLoading}
            >
              Zaloguj
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

export default Login;
