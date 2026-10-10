import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  LayoutDashboard,
  ShoppingBag,
  Users,
  ChartNoAxesCombined,
  Settings,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronsUpDown,
  ArrowUpRight,
  ArrowRight,
  Command,
  CalendarDays,
  Download,
  Menu,
  X,
  CircleHelp,
  Check,
  Globe,
  CreditCard,
  Mail,
  SlidersHorizontal,
  Package,
  CheckCheck,
} from "lucide-react";
import { initialOrders, currency, categories, monthlyRevenue } from "./data";
import type { Order, Status, View } from "./data";
import { ordersCsv } from "./order-utils";
import {
  Kpis,
  RevenueChart,
  CategoryChart,
  Modal,
  EmptyState,
} from "./components";
import { OrderTable, OrderDetail, Avatar } from "./Orders";

const nav = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Orders", icon: ShoppingBag },
  { name: "Customers", icon: Users },
  { name: "Analytics", icon: ChartNoAxesCombined },
  { name: "Settings", icon: Settings },
] as const;
function readLocal<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(`pulse-${key}`);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(`pulse-${key}`, JSON.stringify(value));
  } catch {
    /* Browser storage can be disabled; the current session remains usable. */
  }
}
function download(contents: string, filename: string) {
  const url = URL.createObjectURL(
    new Blob([contents], { type: "text/csv;charset=utf-8;" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const notifications = [
  {
    title: "A new order needs your attention",
    text: "Order #1040 is waiting to be processed.",
    order: 1040,
    icon: ShoppingBag,
  },
  {
    title: "Refund completed",
    text: "$172.00 has been refunded for order #1038.",
    order: 1038,
    icon: CreditCard,
  },
  {
    title: "Your October snapshot is ready",
    text: "See how your store is performing this month.",
    order: null,
    icon: ChartNoAxesCombined,
  },
];

export default function App() {
  const [view, setView] = useState<View>("Dashboard");
  const [dark, setDark] = useState(() => readLocal("dark", false));
  const [orders, setOrders] = useState<Order[]>(() =>
    readLocal("orders", initialOrders),
  );
  const [period, setPeriod] = useState<"Week" | "Month">("Month");
  const [now, setNow] = useState(new Date());
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [read, setRead] = useState<number[]>(() =>
    readLocal("notifications-read", []),
  );
  const [activeOrder, setActiveOrder] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [store, setStore] = useState(() =>
    readLocal("settings", {
      name: "Pulse Store",
      email: "alex@pulsecommerce.com",
      orderEmails: true,
      weeklyReport: true,
    }),
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    persist("dark", dark);
  }, [dark]);
  useEffect(() => {
    persist("orders", orders);
  }, [orders]);
  useEffect(() => {
    persist("notifications-read", read);
  }, [read]);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setMobileMenu(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const navigate = (next: View) => {
    setView(next);
    setMobileMenu(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const exportOrders = (rows: Order[]) => {
    download(ordersCsv(rows), "pulsecommerce-orders.csv");
    setToast(`${rows.length} orders exported to CSV`);
  };
  const currentOrder = orders.find((o) => o.id === activeOrder);
  const searchedOrders = orders
    .filter((o) =>
      `${o.name} ${o.id} #${o.id}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
    )
    .slice(0, 5);
  const searchedNav = nav.filter((n) =>
    n.name.toLowerCase().includes(search.toLowerCase().trim()),
  );
  const descriptions: Record<View, string> = {
    Dashboard: "Welcome back, Alex. Here’s how your store is doing today.",
    Orders: "Every order, every detail. Keep your customers moving.",
    Customers: "Get to know the people behind your business.",
    Analytics: "Turn your store’s performance into your next opportunity.",
    Settings: "A few little details that make this workspace yours.",
  };
  const unread = notifications.length - read.length;
  return (
    <div className="app-shell">
      <button
        className="skip-link"
        onClick={() => document.getElementById("main-content")?.focus()}
      >
        Skip to content
      </button>
      {mobileMenu && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <aside
        className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="brand">
          <span className="brand-icon">
            <Activity size={23} strokeWidth={2.5} />
          </span>
          <span>
            Pulse<span className="brand-light">Commerce</span>
          </span>
          <button
            className="icon-btn mobile-close"
            aria-label="Close navigation"
            onClick={() => setMobileMenu(false)}
          >
            <X size={19} />
          </button>
        </div>
        <button className="store-switcher" onClick={() => setStoreOpen(true)}>
          <span className="store-avatar">P</span>
          <span>
            <strong>{store.name}</strong>
            <small>Commerce workspace</small>
          </span>
          <ChevronsUpDown size={15} />
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {nav.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${view === item.name ? "nav-active" : ""}`}
              onClick={() => navigate(item.name)}
              aria-current={view === item.name ? "page" : undefined}
            >
              <item.icon size={18} strokeWidth={1.7} />
              <span>{item.name}</span>
              {item.name === "Orders" && (
                <span className="nav-count">
                  {orders.filter((o) => o.status === "Pending").length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card">
            <span className="support-icon">
              <Activity size={19} />
            </span>
            <h3>A little help goes a long way.</h3>
            <p>Find your way around your commerce workspace.</p>
            <button onClick={() => setHelpOpen(true)}>
              Visit help center
              <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="sidebar-help" onClick={() => setHelpOpen(true)}>
            <CircleHelp size={18} />
            Help & getting started
            <ArrowUpRight size={14} />
          </button>
          <button className="profile" onClick={() => navigate("Settings")}>
            <span className="profile-avatar">AM</span>
            <span>
              <strong>Alex Morgan</strong>
              <small>Store owner</small>
            </span>
            <ChevronsUpDown size={15} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-btn mobile-menu"
              aria-label="Open navigation"
              aria-expanded={mobileMenu}
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={20} />
            </button>
            <LayoutDashboard size={16} />
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{view === "Dashboard" ? "Overview" : view}</strong>
          </div>
          <div className="topbar-right">
            <button
              className="global-search"
              aria-label="Search workspace"
              onClick={() => {
                setSearch("");
                setSearchOpen(true);
              }}
            >
              <Search size={15} />
              <span>Search anything...</span>
              <kbd>
                <Command size={10} />K
              </kbd>
            </button>
            <span className="topbar-divider" />
            <button
              className="icon-btn theme-toggle"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="notification-container">
              <button
                className="icon-btn notification-button"
                aria-label={`Notifications, ${unread} unread`}
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell size={19} />
                {unread > 0 && (
                  <span className="notification-dot">{unread}</span>
                )}
              </button>
              {notificationsOpen && (
                <>
                  <button
                    className="popover-dismiss"
                    aria-label="Close notifications"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="notification-popover">
                    <div className="notification-head">
                      <h3>
                        Notifications <span>{unread}</span>
                      </h3>
                      <button onClick={() => setRead([0, 1, 2])}>
                        <CheckCheck size={15} />
                        Mark all read
                      </button>
                    </div>
                    {notifications.map((n, i) => (
                      <button
                        key={n.title}
                        className={`notification-item ${read.includes(i) ? "" : "unread"}`}
                        onClick={() => {
                          setRead((prev) => [...new Set([...prev, i])]);
                          setNotificationsOpen(false);
                          if (n.order) setActiveOrder(n.order);
                          else navigate("Analytics");
                        }}
                      >
                        <span className="notification-icon">
                          <n.icon size={17} />
                        </span>
                        <span>
                          <strong>{n.title}</strong>
                          <small>{n.text}</small>
                          <em>Demo notification</em>
                        </span>
                        {!read.includes(i) && <i />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              className="topbar-avatar"
              aria-label="Open profile settings"
              onClick={() => navigate("Settings")}
            >
              AM
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <div className="page-eyebrow">
                <span className="tiny-pulse" />
                YOUR COMMERCE, IN FOCUS
              </div>
              <h1>{view === "Dashboard" ? "Overview" : view}</h1>
              <p>{descriptions[view]}</p>
            </div>
            <div className="page-actions">
              <time className="today-label" dateTime={now.toISOString()}>
                {now.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              {view !== "Settings" && (
                <button
                  className="button primary"
                  onClick={() => exportOrders(orders)}
                >
                  <Download size={15} />
                  Export report
                </button>
              )}
            </div>
          </div>
          {view === "Dashboard" && (
            <>
              <div className="overview-meta">
                <span className="overview-label">
                  Store performance
                  <span className="live-pill">October snapshot</span>
                </span>
                <span className="date-range">
                  <CalendarDays size={14} />
                  Oct 1 – Oct 10, 2026
                </span>
              </div>
              <Kpis />
              <div className="charts-grid">
                <RevenueChart period={period} setPeriod={setPeriod} />
                <CategoryChart onExplore={() => navigate("Analytics")} />
              </div>
              <OrderTable
                orders={orders}
                onOpen={(o) => setActiveOrder(o.id)}
                onExport={exportOrders}
                onViewAll={() => navigate("Orders")}
              />
            </>
          )}
          {view === "Orders" && (
            <>
              <div className="order-stat-grid">
                {[
                  {
                    title: "Total orders",
                    count: orders.length,
                    icon: ShoppingBag,
                  },
                  {
                    title: "Fulfilled",
                    count: orders.filter((o) => o.status === "Fulfilled")
                      .length,
                    icon: Check,
                  },
                  {
                    title: "In transit",
                    count: orders.filter((o) => o.status === "In Transit")
                      .length,
                    icon: Package,
                  },
                  {
                    title: "Awaiting fulfillment",
                    count: orders.filter((o) => o.status === "Pending").length,
                    icon: Activity,
                  },
                ].map((s) => (
                  <div className="order-stat" key={s.title}>
                    <span>
                      <s.icon size={17} />
                      {s.title}
                    </span>
                    <strong>{s.count}</strong>
                  </div>
                ))}
              </div>
              <OrderTable
                orders={orders}
                onOpen={(o) => setActiveOrder(o.id)}
                onExport={exportOrders}
                full
              />
            </>
          )}
          {view === "Customers" && (
            <Customers
              orders={orders}
              onOpen={(o) => setActiveOrder(o.id)}
              onExport={exportOrders}
            />
          )}
          {view === "Analytics" && (
            <>
              <Kpis />
              <div className="charts-grid">
                <RevenueChart period={period} setPeriod={setPeriod} />
                <CategoryChart
                  onExplore={() =>
                    document
                      .getElementById("category-breakdown")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                />
              </div>
              <div className="analytics-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Acquisition channels</h2>
                      <p>Where your next customer comes from.</p>
                    </div>
                    <SlidersHorizontal size={18} />
                  </div>
                  <div className="channel-list">
                    {[
                      {
                        name: "Organic search",
                        percentage: 38,
                        visits: "8,240",
                        color: "#087f5b",
                      },
                      {
                        name: "Direct",
                        percentage: 27,
                        visits: "5,855",
                        color: "#5caa8e",
                      },
                      {
                        name: "Social media",
                        percentage: 22,
                        visits: "4,771",
                        color: "#a2ccbc",
                      },
                      {
                        name: "Email campaigns",
                        percentage: 13,
                        visits: "2,819",
                        color: "#c9ded5",
                      },
                    ].map((c) => (
                      <div className="channel" key={c.name}>
                        <div>
                          <span>{c.name}</span>
                          <span>
                            {c.visits} visits<strong>{c.percentage}%</strong>
                          </span>
                        </div>
                        <div className="channel-track">
                          <span
                            style={{
                              width: `${c.percentage}%`,
                              background: c.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="panel" id="category-breakdown">
                  <div className="panel-heading">
                    <div>
                      <h2>Category performance</h2>
                      <p>574 orders across your catalog.</p>
                    </div>
                  </div>
                  <div className="category-breakdown">
                    {categories.map((c) => (
                      <div key={c.name}>
                        <span>
                          <i className="dot" style={{ background: c.color }} />
                          {c.name}
                        </span>
                        <span>
                          {c.orders} orders<strong>{c.value}%</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="insight">
                    <TrendingIcon />
                    <p>
                      <strong>Apparel leads the way.</strong>Your most popular
                      category accounts for 42% of this month’s orders.
                    </p>
                  </div>
                </section>
              </div>
              <div className="report-note">
                <CalendarDays size={15} />
                <span>
                  Analytics reflect the October 1–10, 2026 sample reporting
                  period. Profit:{" "}
                  {currency(monthlyRevenue.reduce((s, d) => s + d.profit, 0))}.
                </span>
              </div>
            </>
          )}
          {view === "Settings" && (
            <SettingsView
              store={store}
              onSave={(s) => {
                setStore(s);
                persist("settings", s);
                setToast("Workspace settings saved");
              }}
              dark={dark}
              setDark={setDark}
            />
          )}
          <footer className="page-footer">
            <span>
              <Activity size={13} />
              PulseCommerce<span className="footer-dot">·</span>Made for what’s
              next.
            </span>
            <span>
              Sample data<span className="footer-dot">·</span>All amounts in USD
              <Globe size={12} />
            </span>
          </footer>
        </main>
      </div>
      {currentOrder && (
        <OrderDetail
          key={currentOrder.id}
          order={currentOrder}
          onClose={() => setActiveOrder(null)}
          onUpdate={(status: Status) => {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === currentOrder.id ? { ...o, status } : o,
              ),
            );
            setToast(`Order #${currentOrder.id} updated to ${status}`);
          }}
        />
      )}
      {searchOpen && (
        <Modal
          title="Search your workspace"
          wide
          onClose={() => setSearchOpen(false)}
        >
          <div className="command-search">
            <Search size={20} />
            <input
              autoFocus
              aria-label="Search workspace"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find pages, orders, or customers..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (searchedNav.length) navigate(searchedNav[0].name);
                  else if (searchedOrders.length) {
                    setActiveOrder(searchedOrders[0].id);
                    setSearchOpen(false);
                  }
                }
              }}
            />
            <kbd>ESC</kbd>
          </div>
          <div className="command-results">
            {searchedNav.length > 0 && (
              <>
                <h4>GO TO</h4>
                {searchedNav.map((n) => (
                  <button key={n.name} onClick={() => navigate(n.name)}>
                    <n.icon size={17} />
                    <span>{n.name}</span>
                    <ArrowRight size={15} />
                  </button>
                ))}
              </>
            )}
            {searchedOrders.length > 0 && (
              <>
                <h4>ORDERS & CUSTOMERS</h4>
                {searchedOrders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setActiveOrder(o.id);
                      setSearchOpen(false);
                    }}
                  >
                    <Avatar name={o.name} />
                    <span>
                      <strong>{o.name}</strong>
                      <small>
                        Order #{o.id} · {o.city}, {o.state}
                      </small>
                    </span>
                    <span>{currency(o.amount)}</span>
                  </button>
                ))}
              </>
            )}
            {!searchedOrders.length && !searchedNav.length && (
              <EmptyState
                title="No matches found"
                description="Search for a customer name, order number, or page."
              />
            )}
          </div>
          <div className="command-footer">
            <span>Tab to navigate · Enter to select</span>
            <span>
              <Command size={12} />K to open anytime
            </span>
          </div>
        </Modal>
      )}
      {helpOpen && (
        <Modal
          title="A little help, right here"
          onClose={() => setHelpOpen(false)}
        >
          <div className="help-content">
            <p>
              Welcome to your PulseCommerce demo workspace. Here’s how to get
              the most from it.
            </p>
            <div>
              <Command size={20} />
              <span>
                <strong>Find anything, quickly</strong>Press ⌘K on Mac or Ctrl+K
                on Windows to search pages, orders, and customers.
              </span>
            </div>
            <div>
              <ShoppingBag size={20} />
              <span>
                <strong>Make every order count</strong>Search and filter the
                orders table. Click a column’s date or amount to sort, or open
                an order to update its status.
              </span>
            </div>
            <div>
              <Download size={20} />
              <span>
                <strong>Take your data with you</strong>Export all filtered
                orders, or select individual rows to download a CSV.
              </span>
            </div>
            <div>
              <Settings size={20} />
              <span>
                <strong>Make yourself at home</strong>Theme, order changes, and
                workspace settings are saved in this browser.
              </span>
            </div>
            <div className="demo-note">
              This workspace uses sample data. No live store or payment service
              is connected.
            </div>
            <button
              className="button primary"
              onClick={() => setHelpOpen(false)}
            >
              Got it
              <Check size={15} />
            </button>
          </div>
        </Modal>
      )}
      {storeOpen && (
        <Modal title="Your workspace" onClose={() => setStoreOpen(false)}>
          <div className="workspace-info">
            <span className="workspace-logo">
              <Activity size={28} />
            </span>
            <h3>{store.name}</h3>
            <p>US direct-to-consumer workspace</p>
            <div>
              <span>Region</span>
              <strong>United States</strong>
            </div>
            <div>
              <span>Currency</span>
              <strong>USD ($)</strong>
            </div>
            <div>
              <span>Workspace</span>
              <strong>Sample store</strong>
            </div>
            <button
              className="button primary"
              onClick={() => {
                setStoreOpen(false);
                navigate("Settings");
              }}
            >
              Workspace settings
              <ArrowRight size={15} />
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={16} />
          </span>
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function TrendingIcon() {
  return (
    <span className="insight-icon">
      <ChartNoAxesCombined size={20} />
    </span>
  );
}
function Customers({
  orders,
  onOpen,
  onExport,
}: {
  orders: Order[];
  onOpen: (order: Order) => void;
  onExport: (orders: Order[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () =>
      orders.filter((o) =>
        `${o.name} ${o.email} ${o.city} ${o.state}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
      ),
    [orders, query],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 9));
  const current = Math.min(page, pages);
  return (
    <>
      <div className="customer-overview">
        <span>
          <Users size={20} />
          <strong>{orders.length}</strong>Customers in your workspace
        </span>
        <span>
          <Globe size={17} />
          Across 4 US states
        </span>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Your customers</h2>
            <p>A familiar face behind every order.</p>
          </div>
          <button
            className="button secondary"
            onClick={() => onExport(filtered)}
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
        <div className="table-toolbar">
          <label className="table-search">
            <Search size={16} />
            <input
              placeholder="Search customers or locations..."
              aria-label="Search customers"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <span className="muted text-xs">{filtered.length} customers</span>
        </div>
        <div className="customer-grid">
          {filtered.slice((current - 1) * 9, current * 9).map((o, i) => (
            <button
              className="customer-card"
              key={o.id}
              onClick={() => onOpen(o)}
            >
              <div className="flex items-start justify-between">
                <Avatar name={o.name} index={i} />
                <ArrowUpRight size={16} />
              </div>
              <h3>{o.name}</h3>
              <p>{o.email}</p>
              <div>
                <span>
                  <MapIcon />
                  {o.city}, {o.state}
                </span>
                <strong>{currency(o.amount)}</strong>
              </div>
              <small>1 order · ZIP {o.zip}</small>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <EmptyState
            title="No customers found"
            description="Try a different name, email, city, or state."
          />
        )}
        <div className="table-pagination">
          <span>
            Page {current} of {pages}
          </span>
          <div className="flex gap-2">
            <button
              className="button secondary"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </button>
            <button
              className="button secondary"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              Next
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
function MapIcon() {
  return <Globe size={12} />;
}
type StoreSettings = {
  name: string;
  email: string;
  orderEmails: boolean;
  weeklyReport: boolean;
};
function SettingsView({
  store,
  onSave,
  dark,
  setDark,
}: {
  store: StoreSettings;
  onSave: (store: StoreSettings) => void;
  dark: boolean;
  setDark: (v: boolean) => void;
}) {
  const [draft, setDraft] = useState(store);
  return (
    <div className="settings-layout">
      <section className="panel settings-panel">
        <div className="panel-heading">
          <div>
            <h2>Workspace details</h2>
            <p>The essentials for your store.</p>
          </div>
          <Settings size={18} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ ...draft, name: draft.name.trim() });
          }}
        >
          <div className="settings-brand">
            <span className="workspace-logo">
              <Activity size={26} />
            </span>
            <div>
              <h3>{store.name}</h3>
              <p>Direct-to-consumer · United States</p>
            </div>
          </div>
          <label className="form-label">
            Store name
            <input
              required
              minLength={2}
              maxLength={40}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label className="form-label">
            Store contact email
            <span className="form-input-icon">
              <Mail size={16} />
              <input
                required
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </span>
          </label>
          <div className="form-row">
            <label className="form-label">
              Country
              <input value="United States" readOnly />
            </label>
            <label className="form-label">
              Currency
              <input value="USD — US Dollar ($)" readOnly />
            </label>
          </div>
          <p className="form-hint">
            Dates use MM/DD/YYYY. Addresses use state codes and 5-digit ZIP
            codes.
          </p>
          <div className="settings-section-title">
            <h3>Notification preferences</h3>
            <p>Save your preferences for this demo workspace.</p>
          </div>
          <Toggle
            label="New order notifications"
            description="Receive updates when a new order comes in."
            enabled={draft.orderEmails}
            onChange={() =>
              setDraft({ ...draft, orderEmails: !draft.orderEmails })
            }
          />
          <Toggle
            label="Weekly performance report"
            description="A weekly summary of your store’s performance."
            enabled={draft.weeklyReport}
            onChange={() =>
              setDraft({ ...draft, weeklyReport: !draft.weeklyReport })
            }
          />
          <div className="settings-form-footer">
            <span>Preferences are saved in this browser.</span>
            <button className="button primary" type="submit">
              <Check size={15} />
              Save changes
            </button>
          </div>
        </form>
      </section>
      <div>
        <section className="panel appearance-panel">
          <div className="panel-heading">
            <div>
              <h2>Appearance</h2>
              <p>A workspace that feels like you.</p>
            </div>
            <Sun size={18} />
          </div>
          <div className="theme-options">
            {[false, true].map((d) => (
              <button
                key={String(d)}
                className={dark === d ? "active" : ""}
                onClick={() => setDark(d)}
                aria-pressed={dark === d}
              >
                <span className={`theme-preview ${d ? "preview-dark" : ""}`}>
                  <i />
                  <span>
                    <i />
                    <i />
                    <i />
                  </span>
                </span>
                <span>
                  {d ? <Moon size={14} /> : <Sun size={14} />}
                  {d ? "Dark" : "Light"}
                  {dark === d && <Check size={14} />}
                </span>
              </button>
            ))}
          </div>
        </section>
        <div className="settings-tip">
          <Globe size={20} />
          <h3>Built for US commerce</h3>
          <p>
            Your reports, order details, and exports use US dollars and US
            address formats.
          </p>
          <span>
            USD
            <Check size={13} />
            MM/DD/YYYY
            <Check size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}
function Toggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="toggle-row">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={enabled}
        className={`toggle ${enabled ? "on" : ""}`}
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}
