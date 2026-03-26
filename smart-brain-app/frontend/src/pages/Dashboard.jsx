import { useState, useEffect } from 'react';
import { getStats, getResurface, getItems } from '../services/api';
import ItemCard from '../components/ItemCard';
import { Plus, Clock, Zap, FileText, Youtube, Twitter, Image, Link } from 'lucide-react';

const TYPE_ICONS = { article: '📰', youtube: '▶️', tweet: '🐦', image: '🖼️', pdf: '📄', note: '📝', link: '🔗' };

function timeLabel(date) {
  const months = Math.floor((Date.now() - new Date(date)) / (1000*60*60*24*30));
  return months <= 0 ? 'this month' : `${months} month${months > 1 ? 's' : ''} ago`;
}

export default function Dashboard({ onAddItem }) {
  const [stats, setStats]       = useState(null);
  const [resurface, setResurface] = useState([]);
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [hasMore, setHasMore]   = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, r, i] = await Promise.all([getStats(), getResurface(), getItems({ limit: 12, page: 1 })]);
      setStats(s);
      setResurface(r);
      setItems(i.items || []);
      setHasMore(i.pages > 1);
      setPage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    const next = page + 1;
    const res = await getItems({ limit: 12, page: next });
    setItems(prev => [...prev, ...(res.items || [])]);
    setPage(next);
    setHasMore(next < res.pages);
  };

  const handleDelete = (id) => {
    setItems(prev => prev.filter(i => i._id !== id));
    loadAll();
  };

  const STAT_CARDS = [
    { label: 'Total Saved',  value: stats?.total ?? 0,                 icon: '🧠', gradient: 'linear-gradient(135deg,#7c3aed,#5b21b6)' },
    { label: 'This Week',    value: stats?.recentCount ?? 0,            icon: '⚡', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
    { label: 'Articles',     value: stats?.types?.article ?? 0,         icon: '📰', gradient: 'linear-gradient(135deg,#0891b2,#0e7490)' },
    { label: 'Videos',       value: stats?.types?.youtube ?? 0,         icon: '▶️', gradient: 'linear-gradient(135deg,#dc2626,#991b1b)' },
    { label: 'Top Tag',      value: stats?.topTags?.[0]?.tag ?? '—',    icon: '🏷️', gradient: 'linear-gradient(135deg,#059669,#047857)' },
  ];

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Dashboard</span>
          <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--text-muted)' }}>
            Your personal knowledge graph
          </span>
        </div>
        <button id="dashboard-add-btn" className="btn btn-primary" onClick={onAddItem}>
          <Plus size={15} /> Add Item
        </button>
      </div>

      <div className="page-content">
        {/* Stats */}
        {loading ? (
          <div className="stats-grid">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="stat-card skeleton" style={{ height: 80 }} />
            ))}
          </div>
        ) : (
          <div className="stats-grid">
            {STAT_CARDS.map(({ label, value, icon }) => (
              <div key={label} className="stat-card">
                <div className="stat-icon">{icon}</div>
                <div className="stat-value" style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {value}
                </div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Memory Resurfacing */}
        {resurface.length > 0 && (
          <div className="resurface-banner" id="resurface-section">
            <div className="resurface-header">
              <Clock size={18} color="var(--accent-amber)" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>From Your Memory</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
                — you saved these a while back
              </span>
            </div>
            <div className="resurface-items">
              {resurface.map(item => (
                <div
                  key={item._id}
                  className="resurface-item"
                  onClick={() => item.url && window.open(item.url, '_blank')}
                >
                  <div style={{ fontSize: 19, marginBottom: 4 }}>{TYPE_ICONS[item.type]}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>
                    {item.title?.slice(0, 50)}{item.title?.length > 50 ? '…' : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent-amber)', fontWeight: 500 }}>
                    🕰️ {timeLabel(item.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Items */}
        <div className="section-header">
          <h2 className="section-title">Recent Saves</h2>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stats?.total ?? 0} total</span>
        </div>

        {loading ? (
          <div className="items-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧠</div>
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>Your brain is empty!</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: 340 }}>
              Start saving articles, videos, tweets, and more. Smart Brain auto-tags and organizes everything.
            </p>
            <button id="empty-add-btn" className="btn btn-primary" onClick={onAddItem}>
              <Plus size={15} /> Save your first item
            </button>
          </div>
        ) : (
          <>
            <div className="items-grid">
              {items.map(item => (
                <ItemCard key={item._id} item={item} onDelete={handleDelete} onUpdate={loadAll} />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <button id="load-more-btn" className="btn btn-ghost" onClick={loadMore}>
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
