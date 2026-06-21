import { useState } from 'react';
import './SchemaBuilder.css';
import './Modal.css';

const FIELD_TYPES = [
  { value: 'string',  label: 'string',  color: 'green',  icon: '"A"' },
  { value: 'number',  label: 'number',  color: 'cyan',   icon: '123' },
  { value: 'boolean', label: 'boolean', color: 'purple', icon: '0/1' },
  { value: 'email',   label: 'email',   color: 'orange', icon: '@' },
  { value: 'date',    label: 'date',    color: 'yellow', icon: '📅' },
  { value: 'phone',   label: 'phone',   color: 'green',  icon: '☏' },
  { value: 'url',     label: 'url',     color: 'cyan',   icon: '🔗' },
  { value: 'image',   label: 'image',   color: 'purple', icon: '🖼' },
  { value: 'uuid',    label: 'uuid',    color: 'muted',  icon: '⊞' },
  { value: 'name',    label: 'name',    color: 'orange', icon: '👤' },
  { value: 'object',  label: 'object',  color: 'muted',  icon: '{ }' },
  { value: 'array',   label: 'array',   color: 'red',    icon: '[ ]' },
];

const DEFAULT_SETTINGS = {
  defaultCount: 10,
  delay: 0,
  errorRate: 0,
  errorCode: 500,
  crud: false,
};

function createField() {
  return { fieldName: '', type: 'string', children: [] };
}

function FieldRow({ field, onChange, onDelete, depth = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = field.type === 'object' || field.type === 'array';

  const update = (key, val) => onChange({ ...field, [key]: val });

  const addChild = () => {
    update('children', [...(field.children || []), createField()]);
  };

  const updateChild = (i, updated) => {
    const kids = [...(field.children || [])];
    kids[i] = updated;
    update('children', kids);
  };

  const deleteChild = (i) => {
    const kids = [...(field.children || [])];
    kids.splice(i, 1);
    update('children', kids);
  };

  return (
    <div className="field-row" style={{ marginLeft: depth * 20 + 'px' }}>
      <div className="field-row-main">
        {/* Expand button for object/array */}
        {hasChildren ? (
          <button
            type="button"
            className="field-expand-btn"
            onClick={() => setExpanded(e => !e)}
            title="Toggle children"
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="field-row-dot">·</span>
        )}

        {/* Field name */}
        <input
          type="text"
          className="input field-name-input"
          placeholder="fieldName"
          value={field.fieldName}
          onChange={e => update('fieldName', e.target.value)}
          required
        />

        {/* Type selector */}
        <div className="type-selector">
          <select
            className="select type-select"
            value={field.type}
            onChange={e => update('type', e.target.value)}
          >
            {FIELD_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <span className={`type-chip type-${field.type}`}>{field.type}</span>
        </div>

        {/* Add child (for object/array) */}
        {hasChildren && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={addChild}
            title="Add child field"
          >
            + child
          </button>
        )}

        {/* Delete */}
        <button
          type="button"
          className="btn btn-danger btn-sm field-delete-btn"
          onClick={onDelete}
          title="Remove field"
        >
          ✕
        </button>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="field-children">
          {(field.children || []).map((child, i) => (
            <FieldRow
              key={i}
              field={child}
              depth={depth + 1}
              onChange={(updated) => updateChild(i, updated)}
              onDelete={() => deleteChild(i)}
            />
          ))}
          {(field.children || []).length === 0 && (
            <button type="button" className="btn btn-ghost btn-sm add-child-hint" onClick={addChild}>
              + add first child field
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function SchemaBuilder({ schema, loading, onClose, onSave }) {
  const isEdit = !!schema;

  const [name, setName] = useState(schema?.schemaName || '');
  const [endpoint, setEndpoint] = useState(schema?.endpointName || '');
  const [fields, setFields] = useState(schema?.fields || [createField()]);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS, ...(schema?.settings || {}) });
  const [activePanel, setActivePanel] = useState('fields');

  const addField = () => setFields(f => [...f, createField()]);

  const updateField = (i, updated) => {
    setFields(f => {
      const next = [...f];
      next[i] = updated;
      return next;
    });
  };

  const deleteField = (i) => {
    setFields(f => f.filter((_, idx) => idx !== i));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate field names
    const flat = (flds) => flds.flatMap(f => [f, ...(f.children ? flat(f.children) : [])]);
    for (const f of flat(fields)) {
      if (!f.fieldName?.trim()) {
        alert('All fields must have a name');
        return;
      }
    }
    onSave({ schemaName: name, endpointName: endpoint, fields, settings });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal schema-builder-modal" id="schema-builder-modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <span style={{ color: 'var(--green)' }}>{isEdit ? '✎' : '+'}</span>
              {isEdit ? ' edit_schema()' : ' new_schema()'}
            </h2>
            <p className="modal-subtitle">// Define your mock data structure</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Schema meta */}
          <div className="schema-meta-row">
            <div className="input-group">
              <label className="input-label" htmlFor="schema-name">
                <span className="label-comment">// </span>schema name
              </label>
              <input
                id="schema-name"
                type="text"
                className="input"
                placeholder="Users"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="schema-endpoint">
                <span className="label-comment">// </span>endpoint name
              </label>
              <div style={{ position: 'relative' }}>
                <span className="endpoint-prefix">/</span>
                <input
                  id="schema-endpoint"
                  type="text"
                  className="input"
                  style={{ paddingLeft: '20px' }}
                  placeholder="users"
                  value={endpoint}
                  onChange={e => setEndpoint(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Panel tabs */}
          <div className="builder-tabs">
            <button
              type="button"
              className={`builder-tab ${activePanel === 'fields' ? 'builder-tab-active' : ''}`}
              onClick={() => setActivePanel('fields')}
            >
              ⊞ Fields ({fields.length})
            </button>
            <button
              type="button"
              className={`builder-tab ${activePanel === 'settings' ? 'builder-tab-active' : ''}`}
              onClick={() => setActivePanel('settings')}
            >
              ⚙ Settings
            </button>
          </div>

          {/* Fields panel */}
          {activePanel === 'fields' && (
            <div className="builder-panel">
              {/* Type palette */}
              <div className="type-palette">
                {FIELD_TYPES.map(t => (
                  <span key={t.value} className={`type-chip type-${t.value}`} title={t.label}>
                    {t.icon}
                  </span>
                ))}
              </div>

              <div className="fields-list">
                {fields.map((field, i) => (
                  <FieldRow
                    key={i}
                    field={field}
                    depth={0}
                    onChange={(updated) => updateField(i, updated)}
                    onDelete={() => deleteField(i)}
                  />
                ))}
              </div>

              <button
                type="button"
                className="btn btn-ghost add-field-btn"
                onClick={addField}
                id="add-field-btn"
              >
                <span>+</span> add field
              </button>
            </div>
          )}

          {/* Settings panel */}
          {activePanel === 'settings' && (
            <div className="builder-panel settings-panel">
              <div className="settings-grid">
                <div className="input-group">
                  <label className="input-label" htmlFor="s-count">
                    <span className="label-comment">// </span>default count
                  </label>
                  <input
                    id="s-count"
                    type="number"
                    className="input"
                    min="1" max="1000"
                    value={settings.defaultCount}
                    onChange={e => setSettings(s => ({ ...s, defaultCount: Number(e.target.value) }))}
                  />
                  <span className="setting-hint">records returned per request</span>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="s-delay">
                    <span className="label-comment">// </span>delay (seconds)
                  </label>
                  <input
                    id="s-delay"
                    type="number"
                    className="input"
                    min="0" max="10" step="0.5"
                    value={settings.delay}
                    onChange={e => setSettings(s => ({ ...s, delay: Number(e.target.value) }))}
                  />
                  <span className="setting-hint">simulate slow network</span>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="s-error-rate">
                    <span className="label-comment">// </span>error rate (%)
                  </label>
                  <input
                    id="s-error-rate"
                    type="number"
                    className="input"
                    min="0" max="100"
                    value={settings.errorRate}
                    onChange={e => setSettings(s => ({ ...s, errorRate: Number(e.target.value) }))}
                  />
                  <span className="setting-hint">% chance of error response</span>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="s-error-code">
                    <span className="label-comment">// </span>error code
                  </label>
                  <select
                    id="s-error-code"
                    className="select"
                    value={settings.errorCode}
                    onChange={e => setSettings(s => ({ ...s, errorCode: Number(e.target.value) }))}
                  >
                    {[400,401,403,404,429,500,502,503].map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                  <span className="setting-hint">HTTP status code on error</span>
                </div>
              </div>

              <div className="setting-toggle-row">
                <label className="toggle-label" htmlFor="s-crud">
                  <div>
                    <span className="input-label"><span className="label-comment">// </span>CRUD mode</span>
                    <span className="setting-hint">enable create/update/delete operations</span>
                  </div>
                  <input
                    id="s-crud"
                    type="checkbox"
                    className="toggle-checkbox"
                    checked={settings.crud}
                    onChange={e => setSettings(s => ({ ...s, crud: e.target.checked }))}
                  />
                  <div className="toggle-switch"></div>
                </label>
              </div>
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: '16px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="save-schema-btn">
              {loading
                ? <><div className="spinner"></div> saving...</>
                : <><span>{isEdit ? '✓' : '+'}</span> {isEdit ? 'save changes' : 'create schema'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
