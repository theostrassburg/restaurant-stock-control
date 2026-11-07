'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Boxes,
  ChefHat,
  ChevronRight,
  CircleUser,
  CreditCard,
  Download,
  Eye,
  Lock,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  SunMedium,
  TrendingUp,
  UserPlus,
  Users,
  Warehouse,
  X
} from 'lucide-react';

type CategoryKey =
  | 'Vleis'
  | 'Droë rak (Vasco)'
  | 'Drank'
  | 'Tribeca'
  | 'Sir Fruit'
  | 'Skoonmaak middels'
  | 'Wyn Kelder';

type Product = {
  id: string;
  name: string;
  category: CategoryKey;
  quantity: number;
  unit: string;
  reorderLevel: number;
  location: string;
  lastUpdated: string;
};

type UserRecord = {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Stock Controller' | 'Supervisor';
  password: string;
  createdAt: string;
};

type LoginEntry = {
  id: string;
  userId: string;
  name: string;
  role: string;
  timestamp: string;
  device: string;
  ip: string;
};

type StocktakeEntry = {
  id: string;
  category: CategoryKey;
  date: string;
  createdAt: string;
  products: Array<{
    id: string;
    name: string;
    countedQty: number;
    systemQty: number;
    difference: number;
  }>;
};

const CATEGORIES: CategoryKey[] = [
  'Vleis',
  'Droë rak (Vasco)',
  'Drank',
  'Tribeca',
  'Sir Fruit',
  'Skoonmaak middels',
  'Wyn Kelder'
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Beef Striploin', category: 'Vleis', quantity: 62, unit: 'kg', reorderLevel: 25, location: 'Freezer A1', lastUpdated: '2026-11-07' },
  { id: 'p2', name: 'Chicken Thighs', category: 'Vleis', quantity: 41, unit: 'kg', reorderLevel: 20, location: 'Fridge B2', lastUpdated: '2026-11-07' },
  { id: 'p3', name: 'Fish Fillet', category: 'Vleis', quantity: 18, unit: 'kg', reorderLevel: 15, location: 'Cold room 3', lastUpdated: '2026-11-07' },
  { id: 'p4', name: 'Pasta', category: 'Droë rak (Vasco)', quantity: 34, unit: 'packs', reorderLevel: 20, location: 'Rack 2A', lastUpdated: '2026-11-07' },
  { id: 'p5', name: 'Rice', category: 'Droë rak (Vasco)', quantity: 29, unit: 'bags', reorderLevel: 18, location: 'Rack 2B', lastUpdated: '2026-11-07' },
  { id: 'p6', name: 'Olive Oil', category: 'Drank', quantity: 20, unit: 'bottles', reorderLevel: 8, location: 'Bar shelf 1', lastUpdated: '2026-11-07' },
  { id: 'p7', name: 'Coca-Cola', category: 'Drank', quantity: 120, unit: 'cans', reorderLevel: 50, location: 'Cold room 1', lastUpdated: '2026-11-07' },
  { id: 'p8', name: 'Orange Juice', category: 'Tribeca', quantity: 16, unit: 'bottles', reorderLevel: 10, location: 'Back bar', lastUpdated: '2026-11-07' },
  { id: 'p9', name: 'Lemon Fresh', category: 'Sir Fruit', quantity: 54, unit: 'boxes', reorderLevel: 20, location: 'Fruit room', lastUpdated: '2026-11-07' },
  { id: 'p10', name: 'Dish Soap', category: 'Skoonmaak middels', quantity: 12, unit: 'bottles', reorderLevel: 8, location: 'Cleaning store', lastUpdated: '2026-11-07' },
  { id: 'p11', name: 'Floor Cleaner', category: 'Skoonmaak middels', quantity: 7, unit: 'bottles', reorderLevel: 6, location: 'Cleaning store', lastUpdated: '2026-11-07' },
  { id: 'p12', name: 'Cabernet', category: 'Wyn Kelder', quantity: 33, unit: 'bottles', reorderLevel: 12, location: 'Cellar rack 3', lastUpdated: '2026-11-07' }
];

const DEFAULT_USERS: UserRecord[] = [
  { id: 'ADM001', name: 'Nadine Peters', role: 'Admin', password: 'admin123', createdAt: '2026-11-01' },
  { id: 'MGR002', name: 'Mark Johnson', role: 'Manager', password: 'manager123', createdAt: '2026-11-02' },
  { id: 'STK003', name: 'Lerato Smith', role: 'Stock Controller', password: 'stock123', createdAt: '2026-11-03' }
];

const STORAGE_KEYS = {
  users: 'restaurant-stock-users',
  currentUser: 'restaurant-stock-current-user',
  products: 'restaurant-stock-products',
  loginHistory: 'restaurant-stock-login-history',
  stocktakes: 'restaurant-stock-takes',
  theme: 'restaurant-stock-theme'
};

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function RestaurantStockApp() {
  const [darkMode, setDarkMode] = useState(false);
  const [authUser, setAuthUser] = useState<UserRecord | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loginId, setLoginId] = useState('ADM001');
  const [password, setPassword] = useState('admin123');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [users, setUsers] = useState<UserRecord[]>(DEFAULT_USERS);
  const [loginHistory, setLoginHistory] = useState<LoginEntry[]>([]);
  const [stocktakes, setStocktakes] = useState<StocktakeEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('Vleis');
  const [showStocktakeModal, setShowStocktakeModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: 'Stock Controller' as UserRecord['role'], userId: '' });
  const [stocktakeDraft, setStocktakeDraft] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    const storedUsers = localStorage.getItem(STORAGE_KEYS.users);
    const storedProducts = localStorage.getItem(STORAGE_KEYS.products);
    const storedHistory = localStorage.getItem(STORAGE_KEYS.loginHistory);
    const storedStocktakes = localStorage.getItem(STORAGE_KEYS.stocktakes);
    const savedUser = localStorage.getItem(STORAGE_KEYS.currentUser);

    const resolvedDark = storedTheme === 'dark';
    setDarkMode(resolvedDark);
    document.documentElement.classList.toggle('dark', resolvedDark);

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
    if (storedHistory) {
      setLoginHistory(JSON.parse(storedHistory));
    }
    if (storedStocktakes) {
      setStocktakes(JSON.parse(storedStocktakes));
    }
    if (savedUser) {
      setAuthUser(JSON.parse(savedUser));
      setIsLogin(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.loginHistory, JSON.stringify(loginHistory));
  }, [loginHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.stocktakes, JSON.stringify(stocktakes));
  }, [stocktakes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(authUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }, [authUser]);

  const summaryCards = useMemo(() => {
    const totalItems = products.length;
    const lowStock = products.filter((p) => p.quantity <= p.reorderLevel).length;
    const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
    return [
      { label: 'Products tracked', value: totalItems.toString(), icon: Boxes, tone: 'text-amber-500' },
      { label: 'Low stock', value: lowStock.toString(), icon: AlertTriangle, tone: 'text-red-500' },
      { label: 'Units on hand', value: totalUnits.toString(), icon: Warehouse, tone: 'text-emerald-500' },
      { label: 'Stocktakes', value: stocktakes.length.toString(), icon: BarChart3, tone: 'text-sky-500' }
    ];
  }, [products, stocktakes]);

  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.category.includes(search) || p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleLogin = () => {
    const match = users.find((u) => u.id === loginId.trim() && u.password === password.trim());

    if (!match) {
      alert('Invalid user ID or password');
      return;
    }

    const entry: LoginEntry = {
      id: generateId('login'),
      userId: match.id,
      name: match.name,
      role: match.role,
      timestamp: new Date().toISOString(),
      device: 'Desktop Browser',
      ip: '172.16.0.24'
    };

    setLoginHistory((prev) => [entry, ...prev]);
    setAuthUser(match);
    setIsLogin(false);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setIsLogin(true);
  };

  const updateProductQuantity = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const next = Math.max(0, p.quantity + delta);
        return { ...p, quantity: next, lastUpdated: new Date().toISOString().slice(0, 10) };
      })
    );
  };

  const openStocktake = () => {
    const startValues = Object.fromEntries(
      categoryProducts.map((p) => [p.id, p.quantity])
    );
    setStocktakeDraft(startValues);
    setShowStocktakeModal(true);
  };

  const saveStocktake = () => {
    const snapshot = categoryProducts.map((p) => {
      const counted = Number(stocktakeDraft[p.id] ?? p.quantity);
      return {
        id: p.id,
        name: p.name,
        countedQty: counted,
        systemQty: p.quantity,
        difference: counted - p.quantity
      };
    });

    const entry: StocktakeEntry = {
      id: generateId('stocktake'),
      category: selectedCategory,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      products: snapshot
    };

    setStocktakes((prev) => [entry, ...prev]);
    setShowStocktakeModal(false);
  };

  const addUser = () => {
    if (!newMember.name.trim()) {
      alert('Team member name is required');
      return;
    }

    const generatedId = newMember.userId.trim() || `USR${String(users.length + 100).padStart(3, '0')}`;

    const created: UserRecord = {
      id: generatedId,
      name: newMember.name,
      role: newMember.role,
      password: 'welcome123',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setUsers((prev) => [created, ...prev]);
    setNewMember({ name: '', role: 'Stock Controller', userId: '' });
  };

  const activeUserRole = authUser?.role ?? 'Admin';

  if (isLogin || !authUser) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 md:p-10 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
                <ChefHat size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Restaurant stock</p>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Inventory Control</h1>
              </div>
            </div>
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="glass-card flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition hover:scale-105 dark:text-slate-200"
            >
              {darkMode ? <SunMedium size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="grid gap-6 rounded-[32px] border border-slate-200/60 bg-white/60 p-4 shadow-soft backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 md:grid-cols-[1.1fr_0.9fr] md:p-8">
            <div className="flex flex-col justify-center rounded-[28px] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20 dark:bg-slate-950">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-slate-900">
                  <ShoppingCart size={26} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Management suite</p>
                  <h2 className="text-3xl font-bold">StockFlow</h2>
                </div>
              </div>

              <h3 className="mb-3 text-4xl font-bold leading-tight">Smart inventory for every kitchen and cellar.</h3>
              <p className="max-w-md text-base text-slate-300">
                Track purchases, monitor stock movement, and keep every category on demand with a clean operational dashboard.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Active categories', value: '7' },
                  { label: 'Live updates', value: '24/7' },
                  { label: 'Audit ready', value: '100%' }
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
                    <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center p-2">
              <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                    <Lock size={22} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Secure access</p>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h2>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">User ID</label>
                    <input
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="ADM001"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    onClick={handleLogin}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
                  >
                    <ShieldCheck size={18} />
                    Log in
                  </button>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Demo accounts:
                  <div className="mt-2 space-y-1">
                    <div><span className="font-semibold">Admin:</span> ADM001 / admin123</div>
                    <div><span className="font-semibold">Manager:</span> MGR002 / manager123</div>
                    <div><span className="font-semibold">Stock:</span> STK003 / stock123</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] p-4 text-[var(--text)] md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="glass-card mb-6 flex flex-col gap-4 rounded-[30px] p-4 shadow-soft md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/25">
              <ChefHat size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Restaurant stock</p>
              <h1 className="text-2xl font-bold">StockFlow Dashboard</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/70">
              <Search size={15} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products"
                className="w-40 bg-transparent outline-none placeholder:text-slate-400"
              />
            </label>
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="rounded-xl border border-slate-200 bg-white/80 p-2.5 text-slate-600 transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
            >
              {darkMode ? <SunMedium size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="glass-card rounded-[24px] p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <div className={`rounded-xl bg-[var(--brand-soft)] p-2 ${card.tone}`}>
                  <card.icon size={18} />
                </div>
                <ArrowUpRight size={18} className="text-slate-400" />
              </div>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="glass-card rounded-[30px] p-5 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Inventory categories</p>
                <h2 className="text-2xl font-bold">Main sections</h2>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                <BadgeCheck size={16} />
                {activeUserRole}
              </div>
            </div>

            <div className="dashboard-grid">
              {CATEGORIES.map((category) => {
                const count = products.filter((p) => p.category === category).length;
                const low = products.filter((p) => p.category === category && p.quantity <= p.reorderLevel).length;
                const active = category === selectedCategory;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      active
                        ? 'border-amber-400 bg-amber-50 shadow-lg shadow-amber-500/10 dark:bg-amber-500/10'
                        : 'border-slate-200 bg-white/60 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/50'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-700">
                        <Boxes size={18} />
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                    <div className="text-lg font-semibold">{category}</div>
                    <div className="mt-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>{count} products</span>
                      <span className={low > 0 ? 'text-red-500' : 'text-emerald-500'}>{low} low</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="glass-card rounded-[30px] p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Snapshots</p>
                <h3 className="text-xl font-bold">Latest activity</h3>
              </div>
              <Bell className="text-slate-400" size={18} />
            </div>

            <div className="space-y-3">
              {loginHistory.slice(0, 4).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{entry.name}</div>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      {entry.role}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{new Date(entry.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section className="glass-card mt-6 rounded-[30px] p-5 shadow-soft">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Category view</p>
              <h2 className="text-2xl font-bold">{selectedCategory}</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openStocktake}
                className="rounded-xl bg-amber-500 px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-400"
              >
                New Stocktake
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-900/60">
            <table className="min-w-full text-left">
              <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Location</th>
                  <th className="p-4 font-medium">Qty</th>
                  <th className="p-4 font-medium">Reorder</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {categoryProducts.map((product) => (
                  <tr key={product.id} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="p-4">
                      <div className="font-semibold">{product.name}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Last updated {product.lastUpdated}</div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{product.location}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-1 text-sm font-semibold ${product.quantity <= product.reorderLevel ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                        {product.quantity} {product.unit}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{product.reorderLevel} {product.unit}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateProductQuantity(product.id, -1)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xl font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateProductQuantity(product.id, 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xl font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="glass-card rounded-[30px] p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Team access</p>
                <h3 className="text-xl font-bold">User management</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                <Users size={18} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Staff name</label>
                <input
                  value={newMember.name}
                  onChange={(e) => setNewMember((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember((prev) => ({ ...prev, role: e.target.value as UserRecord['role'] }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Stock Controller</option>
                  <option>Supervisor</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={addUser}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
              >
                <UserPlus size={16} /> Add staff member
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {users.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                  <div>
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{member.id} • {member.role}</div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium dark:bg-slate-800">Password: welcome123</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[30px] p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Audit log</p>
                <h3 className="text-xl font-bold">Login history</h3>
              </div>
              <Activity className="text-emerald-500" size={18} />
            </div>

            <div className="space-y-3">
              {loginHistory.slice(0, 6).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{entry.userId}</div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(entry.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{entry.name} • {entry.role}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{entry.device} • {entry.ip}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card mt-6 rounded-[30px] p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Stocktake activity</p>
              <h3 className="text-xl font-bold">Recent stocktakes</h3>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-sky-100 px-3 py-2 text-sm font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
              <TrendingUp size={15} />
              {stocktakes.length} records
            </div>
          </div>

          <div className="space-y-3">
            {stocktakes.slice(0, 5).map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{entry.category}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{new Date(entry.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{entry.date}</div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {entry.products.slice(0, 4).map((product) => (
                    <div key={product.id} className="rounded-xl bg-slate-100 p-2 text-sm dark:bg-slate-800">
                      <div className="font-medium">{product.name}</div>
                      <div className="mt-1 text-slate-500 dark:text-slate-400">
                        Counted {product.countedQty} • Diff {product.difference > 0 ? '+' : ''}{product.difference}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showStocktakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[30px] bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Count session</p>
                <h3 className="text-2xl font-bold">{selectedCategory} Stocktake</h3>
              </div>
              <button onClick={() => setShowStocktakeModal(false)} className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {categoryProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                  <div>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">System qty: {product.quantity} {product.unit}</div>
                  </div>
                  <input
                    type="number"
                    value={stocktakeDraft[product.id] ?? product.quantity}
                    onChange={(e) =>
                      setStocktakeDraft((prev) => ({
                        ...prev,
                        [product.id]: Number(e.target.value)
                      }))
                    }
                    className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowStocktakeModal(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Cancel
              </button>
              <button onClick={saveStocktake} className="rounded-xl bg-amber-500 px-4 py-2.5 font-semibold text-slate-900">
                Save stocktake
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
