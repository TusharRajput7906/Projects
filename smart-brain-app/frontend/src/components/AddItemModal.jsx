import { useState, useRef } from 'react';
import { X, Link2, Upload, Loader2, Plus, Tag } from 'lucide-react';
import { createItem, uploadFile, getCollections } from '../services/api';
import { useEffect } from 'react';



export default function AddItemModal({ onClose, onSaved }) {
  const [tab, setTab]           = useState('url');   // 'url' | 'file'
  const [url, setUrl]           = useState('');
  const [urlWarning, setUrlWarning] = useState('');
  const [fetching, setFetching] = useState(false);
  const [preview, setPreview]   = useState(null);
  const [title, setTitle]       = useState('');

  const [content, setContent]   = useState('');
  const [tags, setTags]         = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [collections, setCollections]   = useState([]);
  const [saving, setSaving]     = useState(false);
  const [file, setFile]         = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    getCollections().then(setCollections).catch(() => {});
  }, []);



  const fetchPreview = async () => {
    if (!url.trim()) return;
    setFetching(true);
    try {
      // Hit backend with URL — it will scrape & return metadata
      const data = await createItem({ url, title, content, tags, collectionId: collectionId || undefined });
      onSaved(data);
    } catch {
      // If backend returns item, we're done; otherwise show error
    } finally {
      setFetching(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
  };

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  // Removed duplicate handleSaveUrl definition. Only the version with local file path validation remains below.
  const isLocalFilePath = (str) => {
    // Windows: C:\ or D:/, Unix: /home/user/file.pdf
    return /^[a-zA-Z]:\\|^[a-zA-Z]:\/|^\//.test(str);
  };

  const handleUrlChange = (e) => {
    const value = e.target.value;
    setUrl(value);
    if (isLocalFilePath(value)) {
      setUrlWarning('Local file paths are not supported. Please use the File Upload tab.');
    } else {
      setUrlWarning('');
    }
  };

  const handleSaveUrl = async () => {
    if (!url.trim() && !title.trim()) return;
    if (isLocalFilePath(url.trim())) {
      setUrlWarning('Local file paths are not supported. Please use the File Upload tab.');
      alert('Local file paths cannot be uploaded. Please use the File Upload tab to upload files.');
      return;
    }
    setSaving(true);
    try {
      await createItem({ url: url.trim(), title: title.trim(), content, tags, collectionId: collectionId || undefined });
      onSaved();
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSaveFile = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title || file.name);
      if (collectionId) fd.append('collectionId', collectionId);
      await uploadFile(fd);
      onSaved();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" id="add-item-modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add to your Brain</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Auto-tags & organizes for you
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} id="modal-close-btn">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tabs */}
          <div className="tabs">
            <button className={`tab ${tab === 'url' ? 'active' : ''}`} onClick={() => setTab('url')}>
              <Link2 size={13} style={{ display: 'inline', marginRight: 6 }} />
              URL / Link
            </button>
            <button className={`tab ${tab === 'file' ? 'active' : ''}`} onClick={() => setTab('file')}>
              <Upload size={13} style={{ display: 'inline', marginRight: 6 }} />
              File Upload
            </button>
          </div>

          {/* ── URL Tab ── */}
          {tab === 'url' && (
            <>
              <div className="form-group">
                <label className="form-label">URL</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    id="item-url-input"
                    className="input"
                    placeholder="https://..."
                    value={url}
                    onChange={handleUrlChange}
                    onKeyDown={e => e.key === 'Enter' && !url.includes(' ') && handleSaveUrl()}
                  />
                  {urlWarning && (
                    <div style={{ color: 'red', fontSize: 13, marginBottom: 8 }}>{urlWarning}</div>
                  )}
                </div>
                </div>

              <div className="form-group">
                <label className="form-label">Title <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400 }}>(optional — auto-scraped if empty)</span></label>
                <input id="item-title-input" className="input" placeholder="Leave blank to auto-detect…" value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Collection</label>
                  <select
                    id="item-collection-select"
                    className="input"
                    value={collectionId}
                    onChange={e => setCollectionId(e.target.value)}
                    style={{ cursor: 'pointer', fontWeight: 600 }}
                  >
                    <option value="" style={{ background: '#fff', color: '#222' }}>No collection</option>
                    {collections.map(c => (
                      <option
                        key={c._id}
                        value={c._id}
                        style={
                          collectionId === c._id
                            ? { background: '#7c3aed', color: '#fff', fontWeight: 700 }
                            : { background: '#f0f0f0', color: '#888' }
                        }
                      >
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Note <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
                <textarea id="item-note-input" className="input" placeholder="Your thoughts…" value={content} onChange={e => setContent(e.target.value)} rows={2} />
              </div>

              {/* Tag Editor */}
              <div className="form-group">
                <label className="form-label">
                  <Tag size={11} style={{ display: 'inline', marginRight: 4 }} />
                  Tags <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400 }}>(auto-generated — press Enter to add)</span>
                </label>
                <div className="tag-cloud" style={{ marginBottom: 8 }}>
                  {tags.map(tag => (
                    <span key={tag} className="tag-chip" onClick={() => removeTag(tag)} style={{ cursor: 'pointer' }}>
                      #{tag} <X size={9} style={{ marginLeft: 3 }} />
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    id="item-tag-input"
                    className="input"
                    placeholder="Add a tag…"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKey}
                  />
                  <button className="btn btn-ghost" onClick={addTag} style={{ flexShrink: 0 }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button
                id="save-url-btn"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                onClick={handleSaveUrl}
                disabled={saving || (!url.trim() && !title.trim())}
              >
                {saving ? <><div className="spinner" />&nbsp;Saving…</> : '🧠 Save to Brain'}
              </button>
            </>
          )}

          {/* ── File Tab ── */}
          {tab === 'file' && (
            <>
              {/* Drop zone */}
              <div
                id="file-drop-zone"
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--accent-purple)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  background: dragOver ? 'rgba(124,58,237,0.06)' : 'transparent',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
                {file ? (
                  <div>
                    <p style={{ fontWeight: 600 }}>{file.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontWeight: 500 }}>Drop file here or click to browse</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Images, PDFs — max 25 MB
                    </p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileDrop} />
              </div>

              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="input" placeholder="File title…" value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Collection</label>
                <select className="input" value={collectionId} onChange={e => setCollectionId(e.target.value)} style={{ cursor: 'pointer' }}>
                  <option value="">No collection</option>
                  {collections.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                </select>
              </div>

              <button
                id="save-file-btn"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                onClick={handleSaveFile}
                disabled={saving || !file}
              >
                {saving ? <><div className="spinner" />&nbsp;Uploading…</> : '☁️ Upload to ImageKit'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
