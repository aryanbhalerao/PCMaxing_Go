import React, { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import { api, type PCComponent } from './lib/api';

interface SearchableDropdownProps {
  category: string;
  items: PCComponent[];
  selectedItem: PCComponent | null;
  onSelect: (item: PCComponent | null) => void;
}

const CATEGORY_ORDER = [
  'CPU', 'Motherboard', 'GPU', 'RAM', 'Storage', 'PSU', 'Case',
  'Monitor', 'Keyboard', 'Mouse',
];
const QUANTITY_CATEGORIES = new Set(['RAM', 'Storage']);

const SearchableDropdown = ({ category, items, selectedItem, onSelect }: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (selectedItem) onSelect(null);
  };

  const handleSelectItem = (item: PCComponent) => {
    onSelect(item);
    setSearchTerm(item.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setSearchTerm('');
    setIsOpen(true);
  };

  const showAll = selectedItem && searchTerm === selectedItem.name;
  const filteredItems = showAll
    ? items
    : items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div
      className="searchable-dropdown"
      ref={wrapperRef}
      style={{ zIndex: isOpen ? 100 : 1 }}
    >
      <label>{category}</label>
      <div className="input-wrapper">
        <input
          type="text"
          placeholder={`Search ${category}...`}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={(e) => {
            setIsOpen(true);
            e.target.select();
          }}
        />
        {selectedItem && (
          <button className="clear-btn" onClick={handleClear}>✕</button>
        )}
      </div>

      {isOpen && (
        <ul className="suggestions-list">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <li key={item.id} onMouseDown={() => handleSelectItem(item)}>
                <span className="item-name">{item.name}</span>
                <span className="item-price">₹{item.price.toLocaleString('en-IN')}</span>
              </li>
            ))
          ) : (
            <li className="no-results">No {category} found</li>
          )}
        </ul>
      )}
    </div>
  );
};

function getCompatibilityIssues(parts: Record<string, PCComponent>): string[] {
  const issues: string[] = [];
  const cpu = parts['CPU'];
  const gpu = parts['GPU'];
  const psu = parts['PSU'];
  const caseComp = parts['Case'];
  const mb = parts['Motherboard'];

  // 1. Motherboard socket vs CPU socket
  if (mb && cpu) {
    const mbSocket = String(mb.details?.['Socket'] ?? '');
    const cpuSocket = String(cpu.details?.['Socket'] ?? '');
    if (mbSocket && cpuSocket && mbSocket !== cpuSocket) {
      issues.push(`Motherboard not compatible with CPU: socket ${mbSocket} ≠ ${cpuSocket}`);
    }
  }

  // 2. GPU card length vs case max GPU length
  if (gpu && caseComp) {
    const gpuLen = parseInt(String(gpu.details?.['Card Length'] ?? '0'));
    const caseMax = parseInt(String(caseComp.details?.['Max GPU Length'] ?? '0'));
    if (gpuLen > 0 && caseMax > 0 && gpuLen > caseMax) {
      issues.push(`GPU not compatible with Case: card length ${gpuLen}mm exceeds case max ${caseMax}mm`);
    }
  }

  // 3. Motherboard form factor vs case motherboard support
  if (mb && caseComp) {
    const mbFF = String(mb.details?.['Form Factor'] ?? '');
    const caseMbSupport = String(caseComp.details?.['Motherboard Support'] ?? '');
    const supported = caseMbSupport.split('/').map((s) => s.trim());
    if (mbFF && supported.length > 0 && !supported.includes(mbFF)) {
      issues.push(`Motherboard not compatible with Case: ${mbFF} not supported (supports ${caseMbSupport})`);
    }
  }

  // 4. PSU wattage vs CPU + GPU total TDP
  if (psu && (cpu || gpu)) {
    const psuW = parseInt(String(psu.details?.['Wattage'] ?? '0'));
    const cpuTdp = cpu ? parseInt(String(cpu.details?.['TDP'] ?? '0')) : 0;
    const gpuTdp = gpu ? parseInt(String(gpu.details?.['TDP'] ?? '0')) : 0;
    const totalW = cpuTdp + gpuTdp;
    if (psuW > 0 && totalW > 0 && psuW < totalW) {
      issues.push(`PSU not compatible with System: ${psuW}W < CPU (${cpuTdp}W) + GPU (${gpuTdp}W) = ${totalW}W`);
    }
  }

  return issues;
}

export default function App() {
  const [components, setComponents] = useState<PCComponent[]>([]);
  const [selectedParts, setSelectedParts] = useState<Record<string, PCComponent>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    api.getComponents()
      .then((data) => setComponents(data))
      .catch((err) => {
        console.error('Failed to fetch components:', err);
        setFetchError('Failed to load components. Please refresh the page.');
      })
      .finally(() => setLoading(false));
  }, []);

  const sortedCategories = useMemo(() => {
    const dbCategories = new Set(components.map((c) => c.category));
    return CATEGORY_ORDER.filter((cat) => dbCategories.has(cat));
  }, [components]);

  const handleSelect = (category: string, item: PCComponent | null) => {
    setSelectedParts((prev) => {
      const updated = { ...prev };
      if (item) updated[category] = item;
      else delete updated[category];
      return updated;
    });
    if (!item) {
      setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[category];
        return updated;
      });
    }
  };

  const getQuantity = (cat: string) =>
    QUANTITY_CATEGORIES.has(cat) ? (quantities[cat] ?? 1) : 1;

  const totalPrice = Object.entries(selectedParts).reduce(
    (sum, [cat, item]) => sum + item.price * getQuantity(cat),
    0
  );

  const compatIssues = useMemo(
    () => getCompatibilityIssues(selectedParts),
    [selectedParts]
  );

  const hasSelectedParts = Object.keys(selectedParts).length > 0;

  return (
    <div className="app-container">
      <header className="top-bar hide-on-print">
        <div className="logo">
          <h1>PCMaxing</h1>
          <p>Design your PC | Check compatibility of components | Real time updated prices</p>
        </div>
        <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>

      <main className="builder-layout">
        <aside className="specs-panel hide-on-print">
          <h2>Specs</h2>
          {!hasSelectedParts ? (
            <div className="empty-state">Select parts to see their specifications.</div>
          ) : (
            <div className="specs-container">
              {Object.values(selectedParts).map((part) => (
                <div key={part.id} className="spec-card">
                  <h4>{part.category}: {part.name}</h4>
                  {part.details ? (
                    <ul className="spec-list">
                      {Object.entries(part.details).map(([key, value]) => (
                        <li key={key}><strong>{key}:</strong> {value}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-specs">Specs not available.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>

        <div className="selectors hide-on-print">
          {loading && <div className="empty-state">Loading components...</div>}
          {fetchError && <div className="error-state">{fetchError}</div>}
          {!loading && !fetchError && sortedCategories.map((cat) => (
            <div key={cat} className="selector-group">
              <SearchableDropdown
                category={cat}
                items={components.filter((c) => c.category === cat)}
                selectedItem={selectedParts[cat] ?? null}
                onSelect={(item) => handleSelect(cat, item)}
              />
              {QUANTITY_CATEGORIES.has(cat) && selectedParts[cat] && (
                <div className="quantity-control">
                  <span className="qty-label">Quantity:</span>
                  <div className="quantity-buttons">
                    {[1, 2, 3, 4].map((q) => (
                      <button
                        key={q}
                        className={`qty-btn${getQuantity(cat) === q ? ' active' : ''}`}
                        onClick={() => setQuantities((prev) => ({ ...prev, [cat]: q }))}
                      >
                        ×{q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

        </div>

        <aside className="invoice-section">
          {hasSelectedParts && (
            <div className={`compat-box${compatIssues.length === 0 ? ' compat-ok' : ' compat-error'}`}>
              <div className="compat-header">
                <span className="compat-icon">{compatIssues.length === 0 ? '✓' : '✗'}</span>
                <strong>
                  {compatIssues.length === 0
                    ? 'All components compatible'
                    : `${compatIssues.length} compatibility issue${compatIssues.length > 1 ? 's' : ''}`}
                </strong>
              </div>
              {compatIssues.length > 0 && (
                <ul className="compat-issues">
                  {compatIssues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="invoice-header">
            <h2>Your Build</h2>
            <span className="part-count">{Object.keys(selectedParts).length} Parts</span>
          </div>

          {!hasSelectedParts ? (
            <div className="empty-state">Cart is empty.</div>
          ) : (
            <ul className="bill-items">
              {Object.entries(selectedParts).map(([cat, part]) => {
                const qty = getQuantity(cat);
                return (
                  <li key={part.id}>
                    <div className="bill-item-details">
                      <span className="bill-cat">
                        {part.category}{qty > 1 ? ` × ${qty}` : ''}
                      </span>
                      <span className="bill-name">{part.name}</span>
                    </div>
                    <span className="bill-price">
                      ₹{(part.price * qty).toLocaleString('en-IN')}
                    </span>
                    {part.details && (
                      <div className="bill-item-specs">
                        {Object.entries(part.details).map(([key, value]) => (
                          <div key={key} className="spec-item">
                            <strong>{key}:</strong> {value}
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="total-row">
            <h3>Estimated Cost</h3>
            <h3 className="total-amount">₹{totalPrice.toLocaleString('en-IN')}</h3>
          </div>

          <button
            onClick={() => window.print()}
            className="print-btn hide-on-print"
            disabled={!hasSelectedParts}
          >
            Print
          </button>
        </aside>
      </main>
    </div>
  );
}
