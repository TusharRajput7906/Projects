import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, FolderOpen, Network, Brain, Plus } from 'lucide-react';

const NAV = [
  { to: '/',            label: 'Dashboard',       icon: LayoutDashboard, end: true },
  { to: '/search',      label: 'Search',          icon: Search },
  { to: '/collections', label: 'Collections',     icon: FolderOpen },
  { to: '/graph',       label: 'Knowledge Graph', icon: Network },
];

export default function Navbar({ onAddItem }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '24px 20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }} className="gradient-text">
              Smart Brain
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              Knowledge Graph
            </div>
          </div>
        </div>
      </div>

      {/* Add Item CTA */}
      <div style={{ padding: '0 16px 18px' }}>
        <button
          id="add-item-btn"
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={onAddItem}
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      <div className="divider" style={{ margin: '0 16px 12px' }} />

      {/* Navigation */}
      <nav style={{ padding: '0 10px', flex: 1 }}>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          💡 Save anything. <br />
          Let AI connect the dots.
        </div>
      </div>
    </aside>
  );
}
