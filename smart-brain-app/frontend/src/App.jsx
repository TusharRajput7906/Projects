import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Collections from './pages/Collections';
import GraphPage from './pages/GraphPage';
import AddItemModal from './components/AddItemModal';

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaved = () => {
    setShowModal(false);
    setRefreshKey(k => k + 1); // trigger re-fetch in pages
  };

  return (
    <div className="app-layout">
      <Navbar onAddItem={() => setShowModal(true)} />
      <main className="main-content">
        <Routes>
          <Route path="/"            element={<Dashboard key={refreshKey} onAddItem={() => setShowModal(true)} />} />
          <Route path="/search"      element={<Search />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/graph"       element={<GraphPage />} />
        </Routes>
      </main>

      {showModal && (
        <AddItemModal
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
