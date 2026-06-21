/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { schemaAPI } from '../api';
import SchemaBuilder from '../components/SchemaBuilder';
import ApiPlayground from '../components/ApiPlayground';
import './ProjectPage.css';

const TABS = ['schemas', 'playground'];

export default function ProjectPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [project, setProject] = useState(location.state?.project || null);
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('schemas');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingSchema, setEditingSchema] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState(null);

  // Restore project from localStorage if navigated directly
  useEffect(() => {
    if (!project) {
      const stored = JSON.parse(localStorage.getItem('fakeapi_projects') || '[]');
      const found = stored.find(p => p._id === id);
      if (found) setProject(found);
      else navigate('/dashboard');
    }
  }, [id]);

  // Schemas stored per project in localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`fakeapi_schemas_${id}`) || '[]');
    setSchemas(stored);
  }, [id]);

  const saveSchemas = (updated) => {
    setSchemas(updated);
    localStorage.setItem(`fakeapi_schemas_${id}`, JSON.stringify(updated));
  };

  const handleCreateSchema = async (data) => {
    setLoading(true);
    try {
      const res = await schemaAPI.create({ ...data, projectId: id });
      const schema = res.data.data;
      saveSchemas([schema, ...schemas]);
      addToast(`Schema "${schema.schemaName}" created!`, 'success');
      setBuilderOpen(false);
      setEditingSchema(null);
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to create schema', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchema = async (schemaId, data) => {
    setLoading(true);
    try {
      const res = await schemaAPI.update(schemaId, data);
      const updated = res.data.data;
      saveSchemas(schemas.map(s => s._id === schemaId ? updated : s));
      addToast(`Schema updated!`, 'success');
      setBuilderOpen(false);
      setEditingSchema(null);
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to update schema', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchema = async (schema) => {
    if (!window.confirm(`Delete schema "${schema.schemaName}"?`)) return;
    setDeletingId(schema._id);
    try {
      await schemaAPI.delete(schema._id);
      saveSchemas(schemas.filter(s => s._id !== schema._id));
      addToast('Schema deleted.', 'success');
      if (selectedSchema?._id === schema._id) setSelectedSchema(null);
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to delete', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (schema) => {
    setEditingSchema(schema);
    setBuilderOpen(true);
  };

  const openPlayground = (schema) => {
    setSelectedSchema(schema);
    setActiveTab('playground');
  };

  if (!project) return (
    <div className="page">
      <div className="dash-loading"><div className="spinner"></div><span>loading project...</span></div>
    </div>
  );

  return (
    <div className="page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/dashboard" className="bc-link">Projects</Link>
        <span className="bc-sep">/</span>
        <span className="bc-current">{project.projectName}</span>
      </div>

      {/* Header */}
      <div className="project-detail-header">
        <div className="project-detail-info">
          <div className="project-detail-icon">⬡</div>
          <div>
            <h1 className="page-title">{project.projectName}</h1>
            {project.description && (
              <p className="page-subtitle">{project.description}</p>
            )}
            <div className="project-detail-slug">
              <span className="slug-label">base URL:</span>
              <code className="endpoint-url">
                localhost:8000/api/v1/mock/<strong>{project.projectSlug}</strong>/:endpoint
              </code>
            </div>
          </div>
        </div>
        <button
          className="btn btn-primary"
          id="create-schema-btn"
          onClick={() => { setEditingSchema(null); setBuilderOpen(true); }}
        >
          <span>+</span> new_schema()
        </button>
      </div>

      {/* Tabs */}
      <div className="project-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab)}
            id={`tab-${tab}`}
          >
            <span className="tab-icon">{tab === 'schemas' ? '⊞' : '▶'}</span>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'schemas' && (
        <div>
          {schemas.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">{ '{ }' }</span>
              <h3>No schemas yet</h3>
              <p>Create a schema to define the shape of your mock data</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '20px' }}
                onClick={() => setBuilderOpen(true)}
              >
                <span>+</span> Create First Schema
              </button>
            </div>
          ) : (
            <div className="schemas-list">
              {schemas.map(schema => (
                <SchemaCard
                  key={schema._id}
                  schema={schema}
                  projectSlug={project.projectSlug}
                  onEdit={() => openEdit(schema)}
                  onDelete={() => handleDeleteSchema(schema)}
                  onPlay={() => openPlayground(schema)}
                  deleting={deletingId === schema._id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'playground' && (
        <ApiPlayground
          project={project}
          schemas={schemas}
          initialSchema={selectedSchema}
        />
      )}

      {/* Schema Builder Modal */}
      {builderOpen && (
        <SchemaBuilder
          projectId={id}
          schema={editingSchema}
          loading={loading}
          onClose={() => { setBuilderOpen(false); setEditingSchema(null); }}
          onSave={editingSchema
            ? (data) => handleUpdateSchema(editingSchema._id, data)
            : handleCreateSchema
          }
        />
      )}
    </div>
  );
}

function SchemaCard({ schema, projectSlug, onEdit, onDelete, onPlay, deleting }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="schema-card card">
      <div className="schema-card-header">
        <div className="schema-card-left">
          <div className="schema-name-row">
            <span className="schema-icon">◈</span>
            <h3 className="schema-name">{schema.schemaName}</h3>
            <span className="badge badge-cyan">{schema.fields?.length || 0} fields</span>
          </div>
          <div className="schema-endpoint-row">
            <span className="method-badge badge method-get">GET</span>
            <code className="schema-endpoint">
              /api/v1/mock/{projectSlug}/<strong>{schema.endpointName}</strong>
            </code>
          </div>
        </div>

        <div className="schema-card-actions">
          <button
            className="btn btn-primary btn-sm"
            title="Test in Playground"
            onClick={onPlay}
            id={`play-${schema._id}`}
          >
            <span>▶</span> test
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onEdit}
            id={`edit-${schema._id}`}
          >
            <span>✎</span> edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={onDelete}
            disabled={deleting}
            id={`delete-schema-${schema._id}`}
          >
            {deleting ? <div className="spinner" style={{width:'12px',height:'12px'}}></div> : <span>✕</span>}
          </button>
          <button
            className="btn btn-ghost btn-sm schema-expand-btn"
            onClick={() => setExpanded(e => !e)}
            title="Show fields"
          >
            {expanded ? '▴' : '▾'}
          </button>
        </div>
      </div>

      {/* Settings row */}
      <div className="schema-settings-row">
        <span className="setting-item">
          <span className="setting-label">count:</span>
          <span className="setting-value">{schema.settings?.defaultCount ?? 10}</span>
        </span>
        <span className="setting-item">
          <span className="setting-label">delay:</span>
          <span className="setting-value">{schema.settings?.delay ?? 0}s</span>
        </span>
        <span className="setting-item">
          <span className="setting-label">errorRate:</span>
          <span className="setting-value">{schema.settings?.errorRate ?? 0}%</span>
        </span>
        {schema.settings?.crud && <span className="badge badge-purple">CRUD</span>}
      </div>

      {/* Fields preview */}
      {expanded && schema.fields?.length > 0 && (
        <div className="schema-fields-preview">
          {schema.fields.map((field, i) => (
            <FieldPreview key={i} field={field} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

function FieldPreview({ field, depth }) {
  const [open, setOpen] = useState(false);
  const hasChildren = field.children?.length > 0;
  const typeClass = `type-chip type-${field.type}`;

  return (
    <div className="field-preview" style={{ marginLeft: depth * 16 + 'px' }}>
      <div className="field-preview-row">
        {hasChildren && (
          <button className="field-toggle" onClick={() => setOpen(o => !o)}>
            {open ? '▾' : '▸'}
          </button>
        )}
        {!hasChildren && <span className="field-dot">·</span>}
        <span className="field-name">{field.fieldName}</span>
        <span className={typeClass}>{field.type}</span>
      </div>
      {open && hasChildren && field.children.map((child, i) => (
        <FieldPreview key={i} field={child} depth={depth + 1} />
      ))}
    </div>
  );
}
