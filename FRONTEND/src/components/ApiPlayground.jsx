/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { mockAPI } from '../api';
import './ApiPlayground.css';

export default function ApiPlayground({ project, schemas, initialSchema }) {
  const [selectedSchemaId, setSelectedSchemaId] = useState(initialSchema?._id || '');
  const [params, setParams] = useState({
    count: '',
    page: '',
    limit: '',
    search: '',
    sort: '',
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialSchema) setSelectedSchemaId(initialSchema._id);
  }, [initialSchema]);

  const selectedSchema = schemas.find(s => s._id === selectedSchemaId);

  const buildQueryString = () => {
    const q = Object.entries(params).filter(([, v]) => v !== '').map(([k, v]) => `${k}=${v}`).join('&');
    return q ? '?' + q : '';
  };

  const getUrl = () => {
    if (!selectedSchema || !project) return '';
    return `localhost:8000/api/v1/mock/${project.projectSlug}/${selectedSchema.endpointName}${buildQueryString()}`;
  };

  const handleSend = useCallback(async () => {
    if (!selectedSchema) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    const start = performance.now();
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '')
      );
      const res = await mockAPI.getData(project.projectSlug, selectedSchema.endpointName, cleanParams);
      setElapsed(Math.round(performance.now() - start));
      setResponse(res.data);
    } catch (err) {
      setElapsed(Math.round(performance.now() - start));
      setError({
        status: err?.response?.status || 0,
        message: err?.response?.data?.message || err.message,
        data: err?.response?.data,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedSchema, project, params]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSend();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSend]);

  const copyResponse = () => {
    const text = response ? JSON.stringify(response, null, 2) : JSON.stringify(error?.data, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getStatusColor = (status) => {
    if (!status) return 'var(--text-muted)';
    if (status < 300) return 'var(--green)';
    if (status < 400) return 'var(--yellow)';
    return 'var(--red)';
  };

  const formatJson = (obj) => {
    if (!obj) return '';
    return JSON.stringify(obj, null, 2);
  };

  const highlightJson = (jsonStr) => {
    if (!jsonStr) return '';
    return jsonStr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
      .replace(/: (true|false)/g, ': <span class="json-bool">$1</span>')
      .replace(/: (null)/g, ': <span class="json-null">$1</span>')
      .replace(/: (-?\d+\.?\d*)/g, ': <span class="json-number">$1</span>');
  };

  return (
    <div className="playground">
      {/* Request panel */}
      <div className="playground-request">
        {/* Endpoint selector */}
        <div className="request-top">
          <div className="method-tag">GET</div>
          <div className="url-display">{getUrl() || 'select an endpoint below...'}</div>
          <button
            className="btn btn-primary send-btn"
            onClick={handleSend}
            disabled={!selectedSchema || loading}
            id="send-request-btn"
            title="Send (Ctrl+Enter)"
          >
            {loading ? <div className="spinner"></div> : <span>▶</span>}
            {loading ? 'sending...' : 'Send'}
          </button>
        </div>

        {/* Endpoint picker */}
        <div className="endpoint-picker">
          <label className="input-label">
            <span className="label-comment">// </span>select endpoint
          </label>
          <div className="endpoint-chips">
            {schemas.length === 0 ? (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
                No schemas yet — create one first
              </span>
            ) : (
              schemas.map(s => (
                <button
                  key={s._id}
                  type="button"
                  className={`endpoint-chip ${selectedSchemaId === s._id ? 'endpoint-chip-active' : ''}`}
                  onClick={() => setSelectedSchemaId(s._id)}
                  id={`chip-${s._id}`}
                >
                  <span className="chip-dot">●</span>
                  <code>/{s.endpointName}</code>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Query params */}
        <div className="params-section">
          <div className="params-header">
            <span className="input-label"><span className="label-comment">// </span>query parameters</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setParams({ count: '', page: '', limit: '', search: '', sort: '' })}
            >
              clear
            </button>
          </div>
          <div className="params-grid">
            {Object.entries({
              count: 'count',
              page: 'page',
              limit: 'limit',
              search: 'search',
              sort: 'sort (-field for desc)',
            }).map(([key, placeholder]) => (
              <div className="param-item" key={key}>
                <span className="param-key">{key}</span>
                <input
                  type="text"
                  className="input param-input"
                  placeholder={placeholder}
                  value={params[key]}
                  onChange={e => setParams(p => ({ ...p, [key]: e.target.value }))}
                  id={`param-${key}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Response panel */}
      <div className="playground-response">
        <div className="response-header">
          <div className="response-title-row">
            <span className="response-title">Response</span>
            {(response || error) && (
              <div className="response-meta">
                <span
                  className="response-status"
                  style={{ color: getStatusColor(error?.status || 200) }}
                >
                  {error ? `${error.status} ERROR` : '200 OK'}
                </span>
                {elapsed !== null && (
                  <span className="response-time">{elapsed}ms</span>
                )}
                {response?.data?.pagination && (
                  <span className="badge badge-cyan">
                    {response.data.pagination.total} records
                  </span>
                )}
              </div>
            )}
          </div>

          {(response || error) && (
            <button className="btn btn-ghost btn-sm" onClick={copyResponse} id="copy-response-btn">
              {copied ? '✓ copied' : '⊕ copy'}
            </button>
          )}
        </div>

        <div className="response-body">
          {!response && !error && !loading && (
            <div className="response-empty">
              <div className="response-empty-icon">▶</div>
              <p>Hit <kbd>Send</kbd> or press <kbd>Ctrl+Enter</kbd> to fire the request</p>
              {selectedSchema && (
                <div className="response-hint">
                  <code>GET /api/v1/mock/{project.projectSlug}/{selectedSchema.endpointName}</code>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="response-loading">
              <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></div>
              <span>Waiting for response
                {selectedSchema?.settings?.delay > 0 && ` (${selectedSchema.settings.delay}s delay configured)`}
              </span>
            </div>
          )}

          {error && !loading && (
            <div className="response-error">
              <div className="error-banner">
                <span className="error-icon">✗</span>
                <div>
                  <div className="error-status">{error.status} {error.message}</div>
                </div>
              </div>
              {error.data && (
                <pre
                  className="json-viewer"
                  dangerouslySetInnerHTML={{ __html: highlightJson(formatJson(error.data)) }}
                />
              )}
            </div>
          )}

          {response && !loading && (
            <div className="response-success">
              {/* Pagination info */}
              {response.data?.pagination && (
                <div className="pagination-info">
                  <div className="paginfo-item">
                    <span className="paginfo-label">total</span>
                    <span className="paginfo-value">{response.data.pagination.total}</span>
                  </div>
                  <div className="paginfo-item">
                    <span className="paginfo-label">page</span>
                    <span className="paginfo-value">{response.data.pagination.page}</span>
                  </div>
                  <div className="paginfo-item">
                    <span className="paginfo-label">totalPages</span>
                    <span className="paginfo-value">{response.data.pagination.totalPages}</span>
                  </div>
                  <div className="paginfo-item">
                    <span className="paginfo-label">limit</span>
                    <span className="paginfo-value">{response.data.pagination.limit}</span>
                  </div>
                </div>
              )}
              <pre
                className="json-viewer"
                dangerouslySetInnerHTML={{ __html: highlightJson(formatJson(response)) }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
