import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { projectAPI } from '../api';
import CreateProjectModal from '../components/CreateProjectModal';
import './Dashboard.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem('fakeapi_projects') || '[]'));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Schemas are handled in ProjectPage

  const saveProjects = (updated) => {
    setProjects(updated);
    localStorage.setItem('fakeapi_projects', JSON.stringify(updated));
  };

  const handleCreateProject = async (data) => {
    try {
      const res = await projectAPI.create(data);
      const newProject = res.data.data;
      saveProjects([newProject, ...projects]);
      addToast(`Project "${newProject.projectName}" created!`, 'success');
      setShowCreateModal(false);
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to create project', 'error');
    }
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Delete "${project.projectName}" and all its schemas?`)) return;
    setDeletingId(project._id);
    try {
      await projectAPI.delete(project._id);
      saveProjects(projects.filter(p => p._id !== project._id));
      addToast(`Project deleted.`, 'success');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to delete project', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header dash-header">
        <div>
          <h1 className="page-title">
            <span className="title-icon">⊞</span>
            <span>Projects</span>
            <span className="title-count">({projects.length})</span>
          </h1>
          <p className="page-subtitle">
            <span className="prompt">~/{user?.name || 'user'}</span> — manage your mock API projects
          </p>
        </div>
        <button
          className="btn btn-primary"
          id="create-project-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <span>+</span> new_project()
        </button>
      </div>

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">// projects</span>
          <span className="stat-value">{projects.length}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-label">// base_url</span>
          <span className="stat-value mono">localhost:8000/api/v1/mock</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-label">// status</span>
          <span className="stat-value"><span className="stat-dot">●</span> online</span>
        </div>
      </div>

      {/* Content */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">{ '{ }' }</span>
          <h3>No projects yet</h3>
          <p>Create your first project to start generating mock API data</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
            onClick={() => setShowCreateModal(true)}
          >
            <span>+</span> Create First Project
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {projects.map(project => (
            <div key={project._id} className="project-card card card-glow">
              <div className="project-card-header">
                <div className="project-icon">⬡</div>
                <div className="project-meta">
                  <div className="badge badge-green">active</div>
                  <span className="project-date">{formatDate(project.createdAt)}</span>
                </div>
              </div>

              <h3 className="project-name">{project.projectName}</h3>
              {project.description && (
                <p className="project-desc">{project.description}</p>
              )}

              <div className="project-slug">
                <span className="slug-label">slug:</span>
                <code className="slug-value">{project.projectSlug}</code>
              </div>

              <div className="project-url">
                <span className="url-text">/api/v1/mock/<strong>{project.projectSlug}</strong>/:endpoint</span>
              </div>

              <div className="project-actions">
                <Link
                  to={`/project/${project._id}`}
                  state={{ project }}
                  className="btn btn-secondary btn-sm"
                  id={`open-project-${project._id}`}
                >
                  <span>⊳</span> open
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  id={`delete-project-${project._id}`}
                  onClick={() => handleDeleteProject(project)}
                  disabled={deletingId === project._id}
                >
                  {deletingId === project._id ? <div className="spinner" style={{width:'12px',height:'12px'}}></div> : <span>✕</span>}
                  delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}
