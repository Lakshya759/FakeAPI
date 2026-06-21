import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './Auth.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      addToast('Account created! Please login.', 'success');
      navigate('/login');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-grid"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="auth-logo-bracket">[</span>
              fake<span className="auth-logo-accent">API</span>
              <span className="auth-logo-bracket">]</span>
            </div>
            <div className="auth-terminal-line">
              <span className="term-prompt">$</span>
              <span className="term-cmd cursor-blink">user.register(newAccount)</span>
            </div>
          </div>

          <div className="auth-divider"></div>

          <form className="auth-form" onSubmit={handleSubmit} id="register-form">
            <div className="input-group">
              <label className="input-label" htmlFor="reg-name">
                <span className="label-comment">// </span>display name
              </label>
              <div className="input-wrapper">
                <span className="input-icon">◈</span>
                <input
                  id="reg-name"
                  type="text"
                  className="input input-with-icon"
                  placeholder="coder_xXx"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="reg-email">
                <span className="label-comment">// </span>email address
              </label>
              <div className="input-wrapper">
                <span className="input-icon">@</span>
                <input
                  id="reg-email"
                  type="email"
                  className="input input-with-icon"
                  placeholder="dev@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="reg-password">
                <span className="label-comment">// </span>password
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="reg-password"
                  type="password"
                  className="input input-with-icon"
                  placeholder="min 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <><div className="spinner"></div> creating account...</>
              ) : (
                <><span>+</span> create_account()</>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              <span className="text-muted">// already registered?</span>{' '}
              <Link to="/login" className="auth-link">auth.login()</Link>
            </p>
          </div>
        </div>

        <div className="auth-side">
          <div className="auth-side-content">
            <div className="side-badge badge badge-cyan">FREE</div>
            <h2 className="side-title">Build faster.<br/>Ship smarter.</h2>
            <p className="side-desc">Stop waiting for backend teams. Prototype with real-looking API data today.</p>
            <div className="side-code">
              <div className="code-line"><span className="code-dim">// Schema definition</span></div>
              <div className="code-line">{'{'}</div>
              <div className="code-line pl-16"><span className="code-green">"name"</span>: <span className="code-cyan">"name"</span>,</div>
              <div className="code-line pl-16"><span className="code-green">"email"</span>: <span className="code-cyan">"email"</span>,</div>
              <div className="code-line pl-16"><span className="code-green">"age"</span>: <span className="code-orange">"number"</span></div>
              <div className="code-line">{'}'}</div>
            </div>
            <div className="side-features">
              <div className="side-feature"><span className="feat-dot">◆</span> Unlimited projects</div>
              <div className="side-feature"><span className="feat-dot">◆</span> 12 field types</div>
              <div className="side-feature"><span className="feat-dot">◆</span> Nested objects & arrays</div>
              <div className="side-feature"><span className="feat-dot">◆</span> Instant endpoint URLs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
