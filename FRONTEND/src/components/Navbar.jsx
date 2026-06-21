import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Logged out successfully', 'success');
      navigate('/login');
    } catch {
      addToast('Failed to logout', 'error');
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <span className="nav-logo-bracket">[</span>
        fake<span className="dot">API</span>
        <span className="nav-logo-bracket">]</span>
        <span className="nav-logo-version">v1</span>
      </Link>

      <div className="nav-center">
        <span className="nav-status">
          <span className="status-dot"></span>
          API running on port 8000
        </span>
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            <div className="nav-user">
              <span className="nav-user-icon">◈</span>
              <span className="nav-user-name">{user.name}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              <span>⎋</span> logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">get_started()</Link>
          </>
        )}
      </div>
    </nav>
  );
}
