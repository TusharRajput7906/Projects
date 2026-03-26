import { useState, useEffect } from 'react';
import { Network, RefreshCw } from 'lucide-react';
import { getGraphData } from '../services/api';
import GraphView from '../components/GraphView';

export default function GraphPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const d = await getGraphData();
      setData(d);
    } catch (e) {
      setError('Could not load graph data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <Network size={18} color="var(--accent-purple-light)" />
        <span style={{ fontWeight: 700, fontSize: 16 }}>Knowledge Graph</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 12 }}>
          {data?.nodes?.length ?? 0} nodes · {data?.links?.length ?? 0} connections
        </span>
        <button className="btn btn-ghost" onClick={load} style={{ fontSize: 13 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {loading ? (
          <div className="graph-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Building your knowledge graph…</span>
          </div>
        ) : error ? (
          <div className="graph-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="empty-state">
              <div className="empty-state-icon">⚠️</div>
              <p style={{ color: 'var(--accent-red)' }}>{error}</p>
              <button className="btn btn-ghost" onClick={load}>Retry</button>
            </div>
          </div>
        ) : !data?.nodes?.length ? (
          <div className="graph-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="empty-state">
              <div className="empty-state-icon">🕸️</div>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>No graph data yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>Save some items with tags to see your knowledge graph</p>
            </div>
          </div>
        ) : (
          <GraphView data={data} />
        )}
      </div>
    </div>
  );
}
