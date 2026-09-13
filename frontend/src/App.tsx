import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './App.css';
import { api, type PCComponent, type User, type PopularBuild, type SavedBuild } from './lib/api';

const CATEGORY_ORDER = [
  'CPU', 'Motherboard', 'GPU', 'RAM', 'Storage', 'PSU', 'Case',
  'Monitor', 'Keyboard', 'Mouse',
];
const QUANTITY_CATEGORIES = new Set(['RAM', 'Storage']);

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  CPU: (
    <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  ),
  Motherboard: (
    <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" /><rect x="6" y="6" width="4" height="4" /><rect x="14" y="14" width="4" height="4" /><path d="M10 8h4M8 10v4M16 10v4M10 16h4" />
    </svg>
  ),
  GPU: (
    <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="22" height="12" rx="2" /><circle cx="7" cy="12" r="2" /><circle cx="17" cy="12" r="2" /><path d="M5 6V4M9 6V4M15 6V4M19 6V4" />
    </svg>
  ),
  RAM: (
    <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="1" /><path d="M6 18v2M10 18v2M14 18v2M18 18v2M6 6V4M18 6V4" /><rect x="5" y="9" width="3" height="6" rx="0.5" /><rect x="10.5" y="9" width="3" height="6" rx="0.5" /><rect x="16" y="9" width="3" height="6" rx="0.5" />
    </svg>
  ),
  Storage: (
    <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  PSU: (
    <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Case: (
    <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="17" r="1.5" /><path d="M8 6h8M8 9h8" />
    </svg>
  ),
  Monitor: (
    <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
    </svg>
  ),
  Keyboard: (
    <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
    </svg>
  ),
  Mouse: (
    <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2" width="12" height="20" rx="6" /><path d="M12 2v6" /><line x1="12" y1="6" x2="12" y2="10" />
    </svg>
  ),
};

function getCompatibilityIssues(parts: Record<string, PCComponent>): string[] {
  const issues: string[] = [];
  const cpu = parts['CPU'];
  const gpu = parts['GPU'];
  const psu = parts['PSU'];
  const caseComp = parts['Case'];
  const mb = parts['Motherboard'];

  if (mb && cpu) {
    const mbSocket = String(mb.details?.['Socket'] ?? '');
    const cpuSocket = String(cpu.details?.['Socket'] ?? '');
    if (mbSocket && cpuSocket && mbSocket !== cpuSocket) {
      issues.push(`Motherboard not compatible with CPU: socket ${mbSocket} ≠ ${cpuSocket}`);
    }
  }

  if (gpu && caseComp) {
    const gpuLen = parseInt(String(gpu.details?.['Card Length'] ?? '0'));
    const caseMax = parseInt(String(caseComp.details?.['Max GPU Length'] ?? '0'));
    if (gpuLen > 0 && caseMax > 0 && gpuLen > caseMax) {
      issues.push(`GPU not compatible with Case: card length ${gpuLen}mm exceeds case max ${caseMax}mm`);
    }
  }

  if (mb && caseComp) {
    const mbFF = String(mb.details?.['Form Factor'] ?? '');
    const caseMbSupport = String(caseComp.details?.['Motherboard Support'] ?? '');
    const supported = caseMbSupport.split('/').map((s) => s.trim());
    if (mbFF && supported.length > 0 && !supported.includes(mbFF)) {
      issues.push(`Motherboard not compatible with Case: ${mbFF} not supported (supports ${caseMbSupport})`);
    }
  }

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

function isPartCompatible(cat: string, item: PCComponent, currentParts: Record<string, PCComponent>) {
  const testParts = { ...currentParts, [cat]: item };
  return getCompatibilityIssues(testParts).length === 0;
}

// --- Toast Notification System ---
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;

const ToastContainer = ({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) => (
  <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onDismiss(t.id)}>
        <span className="toast-icon">
          {t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : 'ℹ'}
        </span>
        <span>{t.message}</span>
      </div>
    ))}
  </div>
);

// --- Components ---

const SearchableDropdown = ({ category, items, selectedItem, onSelect }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(selectedItem?.name || '');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(selectedItem?.name || '');
  }, [selectedItem]);

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
    : items.filter((item: PCComponent) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="searchable-dropdown" ref={wrapperRef} style={{ zIndex: isOpen ? 100 : 1 }}>
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
        {selectedItem && <button className="clear-btn" onClick={handleClear}>✕</button>}
      </div>

      {isOpen && (
        <ul className="suggestions-list">
          {filteredItems.length > 0 ? (
            filteredItems.map((item: PCComponent) => (
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

// --- Auth Modal ---
const AuthModal = ({ onClose, onLoginSuccess }: any) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (mode === 'signup') {
        res = await api.signup(email, username, password);
      } else {
        res = await api.login(email, password);
      }
      localStorage.setItem('token', res.token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
          <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(''); }}>Sign Up</button>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          {mode === 'signup' && (
            <div className="form-group">
              <label>Username</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- PCDiagram ---
const PCDiagram = ({ selectedParts }: { selectedParts: Record<string, PCComponent> }) => {
  const isSelected = (cat: string) => !!selectedParts[cat];

  const StatusIcon = ({ selected, x, y, label }: { selected: boolean, x: number, y: number, label: string }) => (
    <g transform={`translate(${x}, ${y})`}>
      {selected ? (
        <>
          <circle cx="0" cy="0" r="10" fill="#10b981" />
          <path d="M-4 0 L-1 3 L4 -3" fill="none" stroke="white" strokeWidth="2" />
        </>
      ) : (
        <circle cx="0" cy="0" r="10" fill="#374151" stroke="#4b5563" strokeWidth="1" />
      )}
      <text x="0" y="22" fontSize="11" fill="var(--text-primary)" textAnchor="middle" fontWeight="bold">{label}</text>
    </g>
  );

  return (
    <div className="pc-diagram-container" style={{background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px'}}>
      <svg style={{width: '100%', height: '100%'}} viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Simple Case Body */}
        <rect x="20" y="10" width="220" height="270" rx="4" fill="var(--bg-glass)" stroke="var(--border-color)" strokeWidth="4"/>
        
        {/* Case Status (where fans used to be) */}
        <StatusIcon selected={isSelected('Case')} x={210} y={90} label="Case" />

        {/* Motherboard */}
        <rect x="35" y="30" width="140" height="170" rx="2" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="2"/>
        
        {/* CPU */}
        <rect x="75" y="55" width="40" height="40" rx="2" fill="var(--border-color)" stroke="var(--text-secondary)" strokeWidth="2"/>
        <rect x="83" y="63" width="24" height="24" rx="2" fill="var(--text-secondary)" />
        <StatusIcon selected={isSelected('CPU')} x={95} y={75} label="CPU" />

        {/* RAM */}
        <rect x="130" y="45" width="6" height="55" rx="2" fill="var(--text-secondary)" />
        <rect x="140" y="45" width="6" height="55" rx="2" fill="var(--text-secondary)" />
        <rect x="150" y="45" width="6" height="55" rx="2" fill="var(--text-secondary)" />
        <StatusIcon selected={isSelected('RAM')} x={143} y={72} label="Memory" />

        {/* GPU */}
        <rect x="40" y="130" width="150" height="35" rx="2" fill="var(--bg-glass)" stroke="var(--border-color)" strokeWidth="2"/>
        <StatusIcon selected={isSelected('GPU')} x={115} y={147} label="GPU" />

        {/* PSU */}
        <rect x="30" y="220" width="85" height="50" rx="2" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="2"/>
        <StatusIcon selected={isSelected('PSU')} x={72} y={245} label="PSU" />

        {/* Storage */}
        <rect x="135" y="225" width="70" height="20" rx="2" fill="var(--bg-glass)" stroke="var(--border-color)" strokeWidth="2"/>
        <rect x="135" y="250" width="70" height="20" rx="2" fill="var(--bg-glass)" stroke="var(--border-color)" strokeWidth="2"/>
        <StatusIcon selected={isSelected('Storage')} x={170} y={237} label="Storage" />

        {/* Monitor */}
        <rect x="270" y="30" width="140" height="90" rx="4" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="3"/>
        <rect x="275" y="35" width="130" height="75" rx="2" fill="var(--bg-glass)" />
        <path d="M 315 120 L 315 150 M 290 150 L 350 150" stroke="var(--border-color)" strokeWidth="4" strokeLinecap="round"/>
        <StatusIcon selected={isSelected('Monitor')} x={340} y={75} label="Monitor" />

        {/* Keyboard */}
        <rect x="270" y="190" width="100" height="35" rx="2" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="2"/>
        <rect x="275" y="195" width="90" height="25" fill="var(--bg-glass)" rx="2"/>
        <StatusIcon selected={isSelected('Keyboard')} x={320} y={207} label="Keyboard" />

        {/* Mouse */}
        <rect x="380" y="190" width="25" height="40" rx="12" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="2"/>
        <line x1="380" y1="205" x2="405" y2="205" stroke="var(--border-color)" strokeWidth="2"/>
        <line x1="392.5" y1="190" x2="392.5" y2="205" stroke="var(--border-color)" strokeWidth="2"/>
        <StatusIcon selected={isSelected('Mouse')} x={392} y={245} label="Mouse" />
      </svg>
    </div>
  );
};

// --- Animated Login Prompt ---
const AnimatedLoginPrompt = ({ onClick }: { onClick: () => void }) => {
  const [textIndex, setTextIndex] = useState(0);
  const texts = ['Save Builds', 'Favourite Components'];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % texts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <button className="login-animated-btn" onClick={onClick}>
      <span className="login-animated-prefix">Login to </span>
      <span className="login-animated-text" key={textIndex}>
        {texts[textIndex]}
      </span>
    </button>
  );
};

// --- Main App ---
export default function App() {
  const [activeTab, setActiveTab] = useState<'build' | 'components' | 'popular' | 'saved' | 'favourites'>('build');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Data
  const [components, setComponents] = useState<PCComponent[]>([]);
  const [popularBuilds, setPopularBuilds] = useState<PopularBuild[]>([]);
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
  const [favourites, setFavourites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Build State
  const [selectedParts, setSelectedParts] = useState<Record<string, PCComponent>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  // Components Tab State
  const [compSearch, setCompSearch] = useState('');
  const [compFilter, setCompFilter] = useState('All');
  const [compSort, setCompSort] = useState('name_asc');

  // Popular Build expand
  const [expandedBuild, setExpandedBuild] = useState<number | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Build page - component list search
  const [buildCompSearch, setBuildCompSearch] = useState('');

  // Refs for auto-scroll
  const selectorScrollRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const bottomListRef = useRef<HTMLDivElement>(null);
  const bottomCategoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (userMenuOpen && !target.closest('.user-menu-area')) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // Initial Data Load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe().then(u => {
        setUser(u);
        return Promise.all([api.getFavourites(), api.getSavedBuilds()]);
      }).then(([favs, builds]) => {
        setFavourites(new Set(favs));
        setSavedBuilds(builds);
      }).catch(() => {
        localStorage.removeItem('token');
      });
    }

    Promise.all([
      api.getComponents(),
      api.getPopularBuilds().catch(() => []) // gracefully handle if popular endpoint fails initially
    ]).then(([comps, builds]) => {
      setComponents(comps);
      setPopularBuilds(builds);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    try { await api.logout(); } catch (e) {}
    localStorage.removeItem('token');
    setUser(null);
    setUserMenuOpen(false);
    setFavourites(new Set());
    setSavedBuilds([]);
    addToast('Logged out successfully', 'info');
  };

  const toggleFavourite = async (id: number) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      if (favourites.has(id)) {
        await api.removeFavourite(id);
        setFavourites(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        addToast('Removed from favourites', 'info');
      } else {
        await api.addFavourite(id);
        setFavourites(prev => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        addToast('Added to favourites', 'success');
      }
    } catch (e) {
      addToast('Failed to update favourites', 'error');
    }
  };

  // Build Tab Logic
  const sortedCategories = CATEGORY_ORDER.filter(c => components.some(comp => comp.category === c));

  const handleSelectPart = (category: string, part: PCComponent | null) => {
    setSelectedParts(prev => {
      const next = { ...prev };
      if (part) next[category] = part;
      else delete next[category];
      return next;
    });
    if (!part) {
      setQuantities(prev => {
        const next = { ...prev };
        delete next[category];
        return next;
      });
    }
    // Auto-advance to next category
    if (part) {
      const idx = sortedCategories.indexOf(category);
      if (idx < sortedCategories.length - 1) {
        setCurrentCategoryIndex(idx + 1);
      }
    }
  };

  // Auto-scroll selector when currentCategoryIndex changes
  useEffect(() => {
    const cat = sortedCategories[currentCategoryIndex];
    if (cat && categoryRefs.current[cat]) {
      categoryRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    // Also scroll the bottom list
    if (cat && bottomCategoryRefs.current[cat]) {
      bottomCategoryRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentCategoryIndex, sortedCategories]);

  const handleClearBuild = () => {
    setSelectedParts({});
    setQuantities({});
    setCurrentCategoryIndex(0);
    addToast('Build cleared', 'info');
  };

  const getQuantity = (category: string) => quantities[category] || 1;

  const totalPrice = Object.entries(selectedParts).reduce((sum, [cat, part]) => {
    return sum + (part.price * getQuantity(cat));
  }, 0);

  const compatIssues = useMemo(() => {
    return getCompatibilityIssues(selectedParts);
  }, [selectedParts]);

  const hasSelectedParts = Object.keys(selectedParts).length > 0;

  const handleSaveBuild = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const name = prompt('Enter a name for this build:');
    if (!name) return;
    try {
      const saved = await api.saveBuild(name, selectedParts, totalPrice, true);
      setSavedBuilds(prev => [saved, ...prev]);
      addToast(`Build "${name}" saved!`, 'success');
    } catch (e: any) {
      addToast(`Failed to save build: ${e.message}`, 'error');
    }
  };

  const handleDeleteSavedBuild = async (id: string) => {
    try {
      await api.deleteSavedBuild(id);
      setSavedBuilds(prev => prev.filter(b => b.id !== id));
      addToast('Build deleted', 'info');
    } catch (e: any) {
      addToast('Failed to delete build', 'error');
    }
  };

  const handleAddToBuild = (comp: PCComponent) => {
    handleSelectPart(comp.category, comp);
    addToast(`${comp.name} added to build`, 'success');
  };

  const handleAddToBuildAndSwitch = (comp: PCComponent) => {
    handleSelectPart(comp.category, comp);
    addToast(`${comp.name} added to build`, 'success');
    setActiveTab('build');
  };

  // Components Tab Logic
  const filteredComponents = useMemo(() => {
    let res = components;
    if (compFilter !== 'All') {
      res = res.filter(c => c.category === compFilter);
    }
    if (compSearch) {
      const s = compSearch.toLowerCase();
      res = res.filter(c => c.name.toLowerCase().includes(s) || c.category.toLowerCase().includes(s));
    }
    res = [...res].sort((a, b) => {
      if (compSort === 'price_asc') return a.price - b.price;
      if (compSort === 'price_desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
    return res;
  }, [components, compFilter, compSearch, compSort]);

  // Favourites tab data
  const favouriteComponents = useMemo(() => {
    return components.filter(c => favourites.has(c.id));
  }, [components, favourites]);

  // Build page bottom list - filtered by search & current category
  const currentCat = sortedCategories[currentCategoryIndex];
  const buildBottomComponents = useMemo(() => {
    let res = components;
    if (buildCompSearch) {
      const s = buildCompSearch.toLowerCase();
      res = res.filter(c => c.name.toLowerCase().includes(s) || c.category.toLowerCase().includes(s));
    }
    return res;
  }, [components, buildCompSearch]);

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Navbar */}
      <nav className="navbar hide-on-print">
        <div className="nav-left">
          <h1 className="logo-text">PCMaxing</h1>
        </div>
        <div className="nav-center">
          <button className={`nav-tab ${activeTab === 'build' ? 'active' : ''}`} onClick={() => setActiveTab('build')}>Your Build</button>
          <button className={`nav-tab ${activeTab === 'components' ? 'active' : ''}`} onClick={() => setActiveTab('components')}>Components</button>
          <button className={`nav-tab ${activeTab === 'popular' ? 'active' : ''}`} onClick={() => setActiveTab('popular')}>Popular Builds</button>
          <button className={`nav-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
            Saved Builds
            {savedBuilds.length > 0 && <span className="nav-badge">{savedBuilds.length}</span>}
          </button>
          <button className={`nav-tab ${activeTab === 'favourites' ? 'active' : ''}`} onClick={() => setActiveTab('favourites')}>
            Favourite Components
            {favourites.size > 0 && <span className="nav-badge">{favourites.size}</span>}
          </button>
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          {user ? (
            <div className="user-menu-area">
              <button className="welcome-back-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <span className="welcome-text">Welcome back, </span>
                <span className="welcome-username">{user.username}</span>
                <svg className="welcome-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                  <path d="M3 4.5L6 7.5L9 4.5" />
                </svg>
              </button>
              {userMenuOpen && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={() => { setActiveTab('saved'); setUserMenuOpen(false); }}>Saved Builds</button>
                  <button className="dropdown-item" onClick={() => { setActiveTab('favourites'); setUserMenuOpen(false); }}>Favourite Components</button>
                  <div style={{borderTop: '1px solid var(--border-color)', margin: '0.25rem 0'}} />
                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <AnimatedLoginPrompt onClick={() => setAuthModalOpen(true)} />
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'build' && (
          <div className="build-layout-v3">
            {/* LEFT COLUMN: 30% - Diagram + Compat + Costing */}
            <div className="build-left-col-v3">
              <div className="left-col-top-split">
                <div className="left-col-diagram">
                  <PCDiagram selectedParts={selectedParts} />
                </div>
                <div className="left-col-stats">
                  <div className="stats-part-count">
                    <strong>{Object.keys(selectedParts).length}</strong> of {sortedCategories.length} Parts
                  </div>
                  
                  {/* Compatibility */}
                  {hasSelectedParts && compatIssues.length > 0 && (
                    <div className="compat-mini compat-error">
                      <strong>✗ {compatIssues.length} issue(s)</strong>
                    </div>
                  )}
                  {hasSelectedParts && compatIssues.length === 0 && (
                    <div className="compat-mini compat-ok">
                      <strong>✓ Compatible</strong>
                    </div>
                  )}

                  <div className="left-col-actions">
                    <button className="btn-secondary left-col-btn" onClick={handleClearBuild} disabled={!hasSelectedParts}>Clear Build</button>
                    <button className="btn-primary left-col-btn" onClick={handleSaveBuild} disabled={!hasSelectedParts}>Save Build</button>
                  </div>
                </div>
              </div>

              {/* Costing */}
              <div className="costing-card">
                <div className="costing-header">
                  <span className="costing-label">Total Cost</span>
                </div>
                <div className="costing-amount">₹{totalPrice.toLocaleString('en-IN')}</div>

                {hasSelectedParts && (
                  <ul className="costing-parts-list">
                    {Object.entries(selectedParts).map(([cat, part]) => {
                      const qty = getQuantity(cat);
                      return (
                        <li key={cat} className="costing-part-row">
                          <span className="costing-part-cat">{cat}{qty > 1 && ` ×${qty}`}</span>
                          <span className="costing-part-price">₹{(part.price * qty).toLocaleString('en-IN')}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: 60% - 3-column grid of categories */}
            <div className="build-right-col-v3">
              {loading ? (
                <div className="skeleton" style={{height: '400px', width: '100%', borderRadius: '1rem'}}></div>
              ) : (
                <div className="build-grid-3col">
                  {sortedCategories.map(cat => {
                    const part = selectedParts[cat];
                    const recommended = components
                      .filter(c => c.category === cat)
                      .filter(c => isPartCompatible(cat, c, selectedParts))
                      .slice(0, 3);

                    return (
                      <div key={cat} className={`build-cell ${part ? 'build-cell-filled' : ''}`}>
                        <div className="build-cell-header">
                          {CATEGORY_ICONS[cat]}
                          <span className="build-cell-cat">{cat}</span>
                        </div>

                        {part ? (
                          /* --- SELECTED: Show part name, cost, specs --- */
                          <div className="build-cell-selected">
                            <div className="build-cell-part-name">{part.name}</div>
                            <div className="build-cell-part-price">₹{(part.price * getQuantity(cat)).toLocaleString('en-IN')}</div>

                            {QUANTITY_CATEGORIES.has(cat) && (
                              <div className="quantity-control">
                                <span className="qty-label">Qty:</span>
                                <div className="quantity-buttons">
                                  {[1, 2, 3, 4].map(q => (
                                    <button
                                      key={q}
                                      className={`qty-btn ${getQuantity(cat) === q ? 'active' : ''}`}
                                      onClick={() => setQuantities(p => ({...p, [cat]: q}))}
                                    >
                                      ×{q}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {part.details && (
                              <div className="build-cell-specs">
                                {Object.entries(part.details).map(([k, v]) => (
                                  <div key={k} className="build-cell-spec">
                                    <span className="build-cell-spec-label">{k}</span>
                                    <span className="build-cell-spec-value">{v}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <button 
                              className="build-cell-change-btn-bottom" 
                              onClick={() => handleSelectPart(cat, null)}
                            >
                              Change Component
                            </button>
                          </div>
                        ) : (
                          /* --- EMPTY: Show recommendations + Shop link --- */
                          <div className="build-cell-empty">
                            <SearchableDropdown
                              category={cat}
                              items={components.filter(c => c.category === cat)}
                              selectedItem={null}
                              onSelect={(item: any) => handleSelectPart(cat, item)}
                            />

                            {recommended.length > 0 && (
                              <div className="build-cell-recs">
                                <span className="build-cell-recs-label">Recommended</span>
                                {recommended.map(c => (
                                  <div key={c.id} className="build-cell-rec-item" onClick={() => handleSelectPart(cat, c)}>
                                    <span className="build-cell-rec-name" title={c.name}>{c.name}</span>
                                    <span className="build-cell-rec-price">₹{c.price.toLocaleString('en-IN')}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <button
                              className="build-cell-shop-btn"
                              onClick={() => { setCompFilter(cat); setActiveTab('components'); }}
                            >
                              Shop {cat} →
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div>
            <div className="components-filters">
              <div className="category-tabs">
                <button className={`cat-tab ${compFilter === 'All' ? 'active' : ''}`} onClick={() => setCompFilter('All')}>All</button>
                {sortedCategories.map(cat => (
                  <button key={cat} className={`cat-tab ${compFilter === cat ? 'active' : ''}`} onClick={() => setCompFilter(cat)}>{cat}</button>
                ))}
              </div>
              <div className="search-sort">
                <input type="text" className="search-input" placeholder="Search parts..." value={compSearch} onChange={e => setCompSearch(e.target.value)} />
                <select className="sort-select" value={compSort} onChange={e => setCompSort(e.target.value)}>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                </select>
              </div>
            </div>

            <div className="components-grid">
              {filteredComponents.map(comp => (
                <div key={comp.id} className="component-card">
                  <div className="card-header">
                    <span className="cat-badge">{comp.category}</span>
                    <button className={`fav-btn ${favourites.has(comp.id) ? 'active' : ''}`} onClick={() => toggleFavourite(comp.id)}>
                      {favourites.has(comp.id) ? '♥' : '♡'}
                    </button>
                  </div>
                  <h3 className="comp-name">{comp.name}</h3>
                  <div className="comp-price">₹{comp.price.toLocaleString('en-IN')}</div>
                  <div className="comp-specs">
                    {comp.details ? Object.entries(comp.details).slice(0, 3).map(([k, v]) => (
                      <span key={k}>{k}: {v}</span>
                    )) : 'No quick specs'}
                  </div>
                  {/* Action buttons with hover tooltip animation */}
                  <div className="comp-card-actions">
                    <button
                      className="btn-action-build"
                      onClick={() => handleAddToBuildAndSwitch(comp)}
                    >
                      <span className="btn-action-icon">+</span>
                      <span className="btn-action-label">Add to Current Build</span>
                      <span className="btn-action-tooltip">Add to Current Build</span>
                    </button>
                    <button
                      className={`btn-action-fav ${favourites.has(comp.id) ? 'active' : ''}`}
                      onClick={() => toggleFavourite(comp.id)}
                    >
                      <span className="btn-action-icon">{favourites.has(comp.id) ? '♥' : '♡'}</span>
                      <span className="btn-action-label">Favourite</span>
                      <span className="btn-action-tooltip">Favourite</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'popular' && (
          <div className="builds-grid">
            {popularBuilds.map(build => (
              <div key={build.id} className={`build-card ${expandedBuild === build.id ? 'expanded' : ''}`} onClick={() => setExpandedBuild(expandedBuild === build.id ? null : build.id)}>
                <span className={`build-tier tier-${build.tier.toLowerCase().replace(' ', '-')}`}>{build.tier}</span>
                <h3 className="build-name">{build.name}</h3>
                <p className="build-desc">{build.description}</p>
                {expandedBuild === build.id && (
                  <div className="build-parts-list">
                    {build.parts.map((p, i) => (
                      <div key={i} className="build-part-item">
                        <span className="part-cat">{p.category}</span>
                        <span className="part-name-text">{p.name}</span>
                        <span className="part-price-text">₹{p.price.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="build-footer">
                  <span className="part-count">{build.parts.length} Parts</span>
                  <span className="build-price">₹{build.total_price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
            {popularBuilds.length === 0 && !loading && (
              <div className="empty-state">
                <div className="empty-state-icon">🏗️</div>
                <p>No popular builds available right now.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            {!user ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔒</div>
                <p>Log in to view your saved builds.</p>
                <button className="btn-primary" onClick={() => setAuthModalOpen(true)}>Log in</button>
              </div>
            ) : savedBuilds.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <p>You haven't saved any builds yet. Head to "Build Your PC" to create one!</p>
              </div>
            ) : (
              <div className="saved-builds-grid">
                {savedBuilds.map(build => (
                  <div key={build.id} className="saved-build-card">
                    <div className="saved-build-header">
                      <h3>{build.name}</h3>
                      <button className="btn-delete" onClick={() => handleDeleteSavedBuild(build.id)} title="Delete build">🗑️</button>
                    </div>
                    <div className="saved-build-price">₹{build.total_price.toLocaleString('en-IN')}</div>
                    <div className="saved-build-meta">
                      <span>{new Date(build.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className={`visibility-badge ${build.is_public ? 'public' : 'private'}`}>{build.is_public ? 'Public' : 'Private'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favourites' && (
          <div>
            {!user ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔒</div>
                <p>Log in to view your favourite components.</p>
                <button className="btn-primary" onClick={() => setAuthModalOpen(true)}>Log in</button>
              </div>
            ) : favouriteComponents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💜</div>
                <p>You haven't favourited any components yet. Browse the Components tab and hit the heart!</p>
              </div>
            ) : (
              <div className="components-grid">
                {favouriteComponents.map(comp => (
                  <div key={comp.id} className="component-card">
                    <div className="card-header">
                      <span className="cat-badge">{comp.category}</span>
                      <button className={`fav-btn active`} onClick={() => toggleFavourite(comp.id)}>♥</button>
                    </div>
                    <h3 className="comp-name">{comp.name}</h3>
                    <div className="comp-price">₹{comp.price.toLocaleString('en-IN')}</div>
                    <div className="comp-specs">
                      {comp.details ? Object.entries(comp.details).slice(0, 3).map(([k, v]) => (
                        <span key={k}>{k}: {v}</span>
                      )) : 'No quick specs'}
                    </div>
                    <div className="comp-card-actions">
                      <button
                        className="btn-action-build"
                        onClick={() => handleAddToBuildAndSwitch(comp)}
                      >
                        <span className="btn-action-icon">+</span>
                        <span className="btn-action-label">Add to Current Build</span>
                        <span className="btn-action-tooltip">Add to Current Build</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {authModalOpen && (
        <AuthModal 
          onClose={() => setAuthModalOpen(false)} 
          onLoginSuccess={(userData: User) => {
            setUser(userData);
            setAuthModalOpen(false);
            addToast(`Welcome, ${userData.username}!`, 'success');
            api.getFavourites().then(favs => setFavourites(new Set(favs))).catch(()=>{});
            api.getSavedBuilds().then(builds => setSavedBuilds(builds)).catch(()=>{});
          }} 
        />
      )}
    </div>
  );
}
