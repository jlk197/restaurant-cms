import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

function Dashboard({ onLogout }) {
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Panel Administracyjny</h1>
        <Button variant="outline-danger" onClick={onLogout}>
          Wyloguj
        </Button>
      </div>
    </div>
  );
}

export default Dashboard;
