import { useState, useCallback } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { getItems } from '../services/api';
import ItemCard from '../components/ItemCard';

const TYPES = ['all', 'article', 'youtube', 'tweet', 'image', 'pdf', 'note', 'link'];
const TYPE_EMOJI = { article:'📰', youtube:'▶️', tweet:'🐦', image:'🖼️', pdf:'📄', note:'📝', link:'🔗' };

function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export default function Search() {
  const [query,   setQuery]   = useState('');
  const [type,    setType]    = useState('all');
  const [items,   setItems]   = useState([]);
  const [total,   setTotal]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q, t) => {
    if (!q.trim() && t === 'all') { setItems([]); setTotal(null); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const params = { limit: 30 };
      if (q.trim()) params.search = q.trim();
      if (t !== 'all') params.type = t;
      const res = await getItems(params);
      setItems(res.items || []);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(debounce((q, t) => doSearch(q, t), 350), [doSearch]);

  const handleQuery = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value, type);
  };

  const handleType = (t) => {
    setType(t);
    doSearch(query, t);
  };

  const handleDelete = (id) => setItems(prev => prev.filter(i => i._id !== id));

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div className="search-wrapper">
          <SearchIcon size={16} className="search-icon" />
          <input
            id="search-main-input"
            className="search-input"
            placeholder="Search your entire brain…"
            value={query}
            onChange={handleQuery}
            autoFocus
          />
        </div>
      </div>

      <div className="page-content">
        {/* Big hero search (shown when empty) */}
        {!searched && (
          <div style={{ textAlign: 'center', padding: '60px 0 40px' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🔍</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }} className="gradient-text">
              Search Your Brain
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              Find anything you've saved — articles, videos, tweets, files
            </p>
          </div>
        )}

        {/* Type filters */}
        <div className="filter-chips" id="type-filter-chips">
          {TYPES.map(t => (
            <button
              key={t}
              id={`filter-${t}`}
              className={`filter-chip ${type === t ? 'active' : ''}`}
              onClick={() => handleType(t)}
            >
              {t !== 'all' && <span style={{ marginRight: 4 }}>{TYPE_EMOJI[t]}</span>}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Results count */}
        {searched && !loading && (
          <div style={{ marginBottom: 18, fontSize: 13, color: 'var(--text-muted)' }}>
            {total === 0
              ? 'No results found'
              : `${total} result${total !== 1 ? 's' : ''} for "${query || type}"`
            }
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="items-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && items.length > 0 && (
          <div className="items-grid">
            {items.map(item => (
              <ItemCard key={item._id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* No results */}
        {searched && !loading && items.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🤔</div>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Nothing found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try different keywords or remove the type filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
