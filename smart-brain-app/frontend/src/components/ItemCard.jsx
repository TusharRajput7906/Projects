import { useState } from 'react';
import { Heart, Trash2, ExternalLink } from 'lucide-react';
import { deleteItem, updateItem } from '../services/api';

const TYPE_EMOJI = { article: '📰', youtube: '▶️', tweet: '🐦', image: '🖼️', pdf: '📄', note: '📝', link: '🔗' };
const TYPE_BG    = { article: 'linear-gradient(135deg,#1e3a5f,#1e293b)', youtube: 'linear-gradient(135deg,#450a0a,#1c1917)', tweet: 'linear-gradient(135deg,#0c3350,#0f172a)', image: 'linear-gradient(135deg,#052e16,#0f172a)', pdf: 'linear-gradient(135deg,#431407,#1c1917)', note: 'linear-gradient(135deg,#2e1065,#1e1b4b)', link: 'linear-gradient(135deg,#1e293b,#0f172a)' };

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return 'just now';
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 604800)return `${Math.floor(s/86400)}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ItemCard({ item, onDelete, onUpdate }) {
  const [fav, setFav] = useState(item.isFavorite);
  const [deleted, setDeleted] = useState(false);

  const handleFav = async (e) => {
    e.stopPropagation();
    const next = !fav;
    setFav(next);
    await updateItem(item._id, { isFavorite: next }).catch(() => setFav(!next));
    onUpdate?.();
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    setDeleted(true);
    await deleteItem(item._id).catch(() => setDeleted(false));
    onDelete?.(item._id);
  };

  const handleOpen = (e) => {
    e.stopPropagation();
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else if (item.fileUrl) {
      window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (deleted) return null;

  return (
    <div className="item-card" onClick={handleOpen} id={`item-${item._id}`}>
      {/* Actions */}
      <div className="item-card-actions">
        {item.url && (
          <button className="icon-btn" onClick={handleOpen} title="Open link">
            <ExternalLink size={13} />
          </button>
        )}
        <button className={`icon-btn ${fav ? 'fav-active' : ''}`} onClick={handleFav} title="Favourite">
          <Heart size={13} fill={fav ? 'currentColor' : 'none'} />
        </button>
        <button className="icon-btn danger" onClick={handleDelete} title="Delete">
          <Trash2 size={13} />
        </button>
      </div>

      {/* Thumbnail / Placeholder */}
      {item.thumbnailUrl || item.fileUrl ? (
        <img
          className="item-thumbnail"
          src={item.thumbnailUrl || item.fileUrl}
          alt={item.title}
          loading="lazy"
          onError={e => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div
          className="item-thumbnail-placeholder"
          style={{ background: TYPE_BG[item.type] || TYPE_BG.link }}
        >
          {TYPE_EMOJI[item.type] || '🔗'}
        </div>
      )}

      {/* Body */}
      <div className="item-body">
        {/* Badge + date row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span className={`badge badge-${item.type}`}>{item.type}</span>
          <span className="item-meta">{timeAgo(item.createdAt)}</span>
        </div>

        {/* Title */}
        <div className="item-title">{item.title}</div>

        {/* Site name */}
        {item.metadata?.siteName && (
          <div className="item-meta" style={{ color: 'var(--text-muted)' }}>
            🌐 {item.metadata.siteName}
          </div>
        )}

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div className="item-tags">
            {item.tags.slice(0, 4).map(tag => (
              <span key={tag} className="tag-chip">#{tag}</span>
            ))}
            {item.tags.length > 4 && (
              <span className="tag-chip">+{item.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
