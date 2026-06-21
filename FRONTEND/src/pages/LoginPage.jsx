import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './Auth.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      addToast('Access granted. Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Authentication failed', 'error');
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
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <span className="auth-logo-bracket">[</span>
              fake<span className="auth-logo-accent">API</span>
              <span className="auth-logo-bracket">]</span>
            </div>
            <div className="auth-terminal-line">
              <span className="term-prompt">$</span>
              <span className="term-cmd cursor-blink">auth.login(credentials)</span>
            </div>
          </div>

          <div className="auth-divider"></div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} id="login-form">
            <div className="input-group">
              <label className="input-label" htmlFor="login-email">
                <span className="label-comment">// </span>email address
              </label>
              <div className="input-wrapper">
                <span className="input-icon">@</span>
                <input
                  id="login-email"
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
              <label className="input-label" htmlFor="login-password">
                <span className="label-comment">// </span>password
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  id="login-password"
                  type="password"
                  className="input input-with-icon"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <><div className="spinner"></div> authenticating...</>
              ) : (
                <><span>▶</span> execute login</>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              <span className="text-muted">// no account?</span>{' '}
              <Link to="/register" className="auth-link">register.new()</Link>
            </p>
          </div>
        </div>

        {/* Side panel */}
        <div className="auth-side">
          <div className="auth-side-content">
            <div className="side-badge badge badge-green">LIVE</div>
            <h2 className="side-title">Mock APIs.<br/>Zero backend.</h2>
            <p className="side-desc">Design schemas, generate endpoints, and get realistic fake data in seconds.</p>
            <div className="side-code">
              <div className="code-line"><span className="code-dim">GET</span> /api/v1/mock/<span className="code-green">my-project</span>/<span className="code-cyan">users</span></div>
              <div className="code-line code-response">{'{'}</div>
              <div className="code-line code-response pl-16">"data": <span className="code-cyan">[...</span><span className="code-dim"> 42 records</span><span className="code-cyan">]</span>,</div>
              <div className="code-line code-response pl-16">"pagination": {'{'} ... {'}'}</div>
              <div className="code-line code-response">{'}'}</div>
            </div>
            <div className="side-features">
              <div className="side-feature"><span className="feat-dot">◆</span> Type-safe schema builder</div>
              <div className="side-feature"><span className="feat-dot">◆</span> Auto-generated fake data</div>
              <div className="side-feature"><span className="feat-dot">◆</span> Search, sort & paginate</div>
              <div className="side-feature"><span className="feat-dot">◆</span> Error rate simulation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
