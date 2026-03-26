import { useState, useEffect } from 'react';
import { Plus, Trash2, X, FolderOpen } from 'lucide-react';
import { getCollections, createCollection, deleteCollection, getItems } from '../services/api';
import ItemCard from '../components/ItemCard';

const COLORS = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4','#f97316','#8b5cf6'];
const ICONS  = ['📁','📚','🎬','💡','🔬','🎨','💼','🌍','🎵','🏋️'];

export default function Collections() {
        // Create a new collection
        const handleCreate = async () => {
          if (!name.trim()) return;
          setSaving(true);
          try {
            await createCollection({ name: name.trim(), description: desc.trim(), color, icon });
            setShowCreate(false);
            setName('');
            setDesc('');
            setColor(COLORS[0]);
            setIcon(ICONS[0]);
            loadCollections();
          } catch (err) {
            alert('Failed to create collection');
            console.error(err);
          } finally {
            setSaving(false);
          }
        };
      // Delete a collection and refresh the list
      const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Delete this collection?')) return;
        try {
          await deleteCollection(id);
          if (active === id) {
            setActive(null);
            setItems([]);
          }
          loadCollections();
        } catch (err) {
          alert('Failed to delete collection');
          console.error(err);
        }
      };
    // Open a collection and load its items
    const openCollection = async (col) => {
      setActive(col._id);
      setLoadingItems(true);
      try {
        const res = await getItems({ collectionId: col._id });
        // If backend returns { items, total, ... }, use res.items
        setItems(res.items || res);
      } catch (e) {
        setItems([]);
        console.error(e);
      } finally {
        setLoadingItems(false);
      }
    };
  const [collections, setCollections] = useState([]);
  const [active,      setActive]      = useState(null);   // selected collection id
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingItems,setLoadingItems]= useState(false);
  const [showCreate,  setShowCreate]  = useState(false);

  // Find the currently active collection object
  const activeCol = collections.find(col => col._id === active);

  // New collection form
  const [name,  setName]  = useState('');
  const [desc,  setDesc]  = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon,  setIcon]  = useState(ICONS[0]);
  const [saving,setSaving]= useState(false);

  useEffect(() => { loadCollections(); }, []);

  const loadCollections = async () => {
    setLoading(true);
    try { setCollections(await getCollections()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <FolderOpen size={18} color="var(--accent-purple-light)" />
        <span style={{ fontWeight: 700, fontSize: 16 }}>Collections</span>
        <div style={{ flex: 1 }} />
        <button id="create-collection-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> New Collection
        </button>
      </div>

      {/* Collections grid */}
      <div
        className="collections-grid"
        style={{
          minHeight: '42vh',
          display: 'grid',
          gridTemplateColumns:
            collections.length === 0
              ? '1fr'
              : collections.length === 1
                ? '1fr'
                : 'repeat(auto-fit, minmax(290px, 310px))',
          gap: 32,
          padding: '24px 0',
          justifyContent: collections.length === 1 ? 'center' : 'center',
          justifyItems: collections.length === 1 ? 'center' : 'center',
          alignItems: collections.length === 0 ? 'center' : 'stretch',
          position: 'relative',
          width: '100%',
          maxWidth: 1300,
          margin: '0 auto',
          overflowX: 'auto',
        }}
      >
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 18, width: 210 }} />
          ))
        ) : collections.length === 0 ? (
          <div
            className="empty-state"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 380,
              minHeight: 220,
              borderRadius: 18,
              boxShadow: '0 2px 16px 0 rgba(80,60,180,0.07)',
              // border removed
              textAlign: 'center',
              margin: '0 auto',
            }}
          >
            <div className="empty-state-icon" style={{ fontSize: 54, marginBottom: 14, color: '#a78bfa' }}>📂</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#6d28d9' }}>No collections yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 22, fontSize: 15 }}>
              Organise your saves into collections like "Research", "Design", "Watch Later"
            </p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={15} /> Create your first collection
            </button>
          </div>
        ) : (
          collections.map(col => (
            <div
              key={col._id}
              id={`col-${col._id}`}
              className="collection-card" 
              style={{
                '--col-color': col.color,
                background: '#1f1f1d83', // soft solid background
                border: '2px solid #e0e7ff', // modern border
                borderRadius: 20,
                boxShadow: '0 6px 24px 0 rgba(80,60,180,0.10)',
                padding: '28px 20px 22px 20px',
                margin: 0,
                width: '100%',
                minWidth: 0,
                maxWidth: 340,
                minHeight: 150,
                position: 'relative',
                cursor: 'pointer',
                transition: 'box-shadow 0.18s, transform 0.18s',
                overflow: 'visible',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              onClick={() => openCollection(col)}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 10px 32px 0 rgba(80,60,180,0.18)';
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.035)';
                const btn = e.currentTarget.querySelector('.del-btn');
                if (btn) {
                  btn.style.opacity = 1;
                  btn.style.filter = 'none';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 4px 24px 0 rgba(80,60,180,0.10)';
                e.currentTarget.style.transform = 'none';
                const btn = e.currentTarget.querySelector('.del-btn');
                if (btn) {
                  btn.style.opacity = 0.55;
                  btn.style.filter = 'grayscale(0.7)';
                }
              }}
            >
              {/* Delete */}
              <button
                className="del-btn"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fff',
                  border: '1.5px solid #f3e8ff',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px 0 rgba(80,60,180,0.09)',
                  opacity: 0.55,
                  filter: 'grayscale(0.7)',
                  transition: 'opacity 0.22s cubic-bezier(.4,0,.2,1), filter 0.22s cubic-bezier(.4,0,.2,1)',
                  zIndex: 2,
                  cursor: 'pointer',
                  outline: 'none',
                  padding: 0,
                }}
                id={`del-col-${col._id}`}
                onClick={e => { e.stopPropagation(); handleDelete(e, col._id); }}
                title="Delete collection"
              >
                <Trash2 size={18} color="#ef4444" />
              </button>
              <div style={{ fontSize: 40, marginBottom: 16, filter: 'drop-shadow(0 2px 8px #e0e7ff)' }}>{col.icon}</div>
              <div style={{
                fontWeight: 950,
                fontSize: 24,
                marginBottom: 10,
                background: 'linear-gradient(90deg, #7c3aed 10%, #3b82f6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: 0.4,
                textAlign: 'center',
                textShadow: '0 2px 12px #e0e7ff, 0 1px 0 #f3e8ff',
                lineHeight: 1.18,
                fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                wordBreak: 'break-word',
                filter: 'drop-shadow(0 2px 8px #ede9fe)',
              }}>{col.name}</div>
              {col.description && (
                <div style={{
                  fontSize: 15,
                  color: '#6d28d9',
                  marginBottom: 14,
                  opacity: 0.92,
                  textAlign: 'center',
                  fontWeight: 500,
                  fontStyle: 'italic',
                  lineHeight: 1.25,
                  maxWidth: 260,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'pre-line',
                }}>{col.description}</div>
              )}
              <div style={{
                fontSize: 15,
                color: col.color,
                fontWeight: 700,
                marginTop: 4,
                textAlign: 'center',
                letterSpacing: 0.12,
                textShadow: '0 1px 0 #f3e8ff',
              }}>
                {col.itemCount ?? 0} item{col.itemCount !== 1 ? 's' : ''}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Items in selected collection */}
      {active && (
        <div style={{ marginTop: 18 }}>
          <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {activeCol?.icon} {activeCol?.name}
              <button
                className="icon-btn danger"
                title="Delete collection"
                style={{ marginLeft: 8 }}
                onClick={e => handleDelete(e, activeCol?._id)}
              >
                <Trash2 size={15} />
              </button>
            </h2>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => { setActive(null); setItems([]); }}>
              <X size={13} /> Clear
            </button>
          </div>
          {loadingItems ? (
            <div className="items-grid">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 16 }} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-state-icon">📭</div>
              <p style={{ color: 'var(--text-muted)' }}>No items in this collection yet</p>
            </div>
          ) : (
            <div className="items-grid">
              {items.map(item => (
                <ItemCard key={item._id} item={item} onDelete={(id) => setItems(p => p.filter(i => i._id !== id))} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Collection Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal" id="create-collection-modal">
            <div className="modal-header">
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>New Collection</h2>
              <button className="icon-btn" onClick={() => setShowCreate(false)}><X size={15} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input id="col-name-input" className="input" placeholder="e.g. Design Inspiration" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="input" placeholder="Optional description…" value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ICONS.map(ic => (
                    <button
                      key={ic}
                      onClick={() => setIcon(ic)}
                      style={{
                        fontSize: 22, background: 'none', border: `2px solid ${icon === ic ? 'var(--accent-purple)' : 'var(--border)'}`,
                        borderRadius: 8, width: 42, height: 42, cursor: 'pointer', transition: 'var(--transition)',
                      }}
                    >{ic}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Colour</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', background: c, border: `3px solid ${color === c ? 'white' : 'transparent'}`,
                        cursor: 'pointer', transition: 'var(--transition)',
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                id="save-collection-btn"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: 12 }}
                onClick={handleCreate}
                disabled={saving || !name.trim()}
              >
                {saving ? <><div className="spinner" />&nbsp;Creating…</> : `${icon} Create Collection`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
