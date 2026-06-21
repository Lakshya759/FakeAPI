import { useState } from 'react';
import './Modal.css';

export default function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ projectName: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" id="create-project-modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <span style={{ color: 'var(--green)' }}>+</span> new_project()
            </h2>
            <p className="modal-subtitle">// Initialize a new mock API project</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="proj-name">
              <span style={{ color: 'var(--text-muted)' }}>// </span>project name
            </label>
            <input
              id="proj-name"
              type="text"
              className="input"
              placeholder="my-awesome-api"
              value={form.projectName}
              onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
              required
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="proj-desc">
              <span style={{ color: 'var(--text-muted)' }}>// </span>description <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <textarea
              id="proj-desc"
              className="textarea"
              placeholder="What is this API for?"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="confirm-create-project">
              {loading ? <><div className="spinner"></div> creating...</> : <><span>+</span> create</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
