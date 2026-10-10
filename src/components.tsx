import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  X,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  MousePointerClick,
  ArrowRight,
} from "lucide-react";
import { categories, currency, monthlyRevenue, weeklyRevenue } from "./data";

export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closer = useRef(onClose);
  closer.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (
      ref.current?.querySelector<HTMLElement>("input") ??
      ref.current?.querySelector<HTMLElement>("button, select, a[href]")
    )?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") closer.current();
      if (event.key !== "Tab") return;
      const nodes = [
        ...(ref.current?.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, a[href], [tabindex="0"]',
        ) ?? []),
      ].filter((n) => !n.hasAttribute("disabled"));
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = original;
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`modal ${wide ? "modal-wide" : ""}`}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const metrics = [
  {
    name: "Total revenue",
    value: "$48,290.50",
    change: "12.4%",
    icon: DollarSign,
    good: true,
    line: [7, 14, 11, 24, 16, 28, 24, 39, 34, 47, 40, 55],
  },
  {
    name: "Average order value",
    value: "$84.20",
    change: "3.1%",
    icon: ShoppingCart,
    good: true,
    line: [16, 20, 18, 31, 26, 30, 27, 40, 35, 43, 40, 47],
  },
  {
    name: "Conversion rate",
    value: "3.42%",
    change: "0.4%",
    icon: MousePointerClick,
    good: false,
    line: [50, 42, 46, 32, 36, 28, 32, 17, 24, 15, 21, 12],
  },
  {
    name: "Active carts",
    value: "142",
    change: "8.5%",
    icon: TrendingUp,
    good: true,
    line: [9, 20, 16, 24, 21, 29, 25, 36, 30, 40, 37, 49],
  },
];
export function Kpis() {
  return (
    <div className="kpi-grid">
      {metrics.map((metric, i) => (
        <div className="kpi-card" key={metric.name}>
          <div className="flex items-center justify-between">
            <span className="metric-label">{metric.name}</span>
            <span className="metric-icon">
              <metric.icon size={16} strokeWidth={1.7} />
            </span>
          </div>
          <div className="metric-value">{metric.value}</div>
          <div className="metric-bottom">
            <div>
              <span
                className={`trend ${metric.good ? "positive" : "negative"}`}
              >
                {metric.good ? (
                  <ArrowUpRight size={13} />
                ) : (
                  <ArrowDownRight size={13} />
                )}
                {metric.good ? "+" : "−"}
                {metric.change}
              </span>
              <span className="compare">vs. last month</span>
            </div>
            <svg
              width="93"
              height="38"
              viewBox="0 0 110 60"
              aria-label={`${metric.name} trend`}
              role="img"
            >
              <defs>
                <linearGradient id={`spark-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={metric.good ? "var(--green)" : "#e06b69"}
                    stopOpacity="0.13"
                  />
                  <stop
                    offset="100%"
                    stopColor={metric.good ? "var(--green)" : "#e06b69"}
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <path
                d={`M0,${60 - metric.line[0]} ${metric.line.map((n, j) => `L${j * 10},${60 - n}`).join(" ")} L110,60 L0,60Z`}
                fill={`url(#spark-${i})`}
              />
              <polyline
                points={metric.line
                  .map((n, j) => `${j * 10},${60 - n}`)
                  .join(" ")}
                fill="none"
                stroke={metric.good ? "var(--green)" : "#dc7676"}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart({
  period,
  setPeriod,
  compact = false,
}: {
  period: "Week" | "Month";
  setPeriod: (p: "Week" | "Month") => void;
  compact?: boolean;
}) {
  const data = period === "Month" ? monthlyRevenue : weeklyRevenue;
  const total = data.reduce((a, b) => a + b.revenue, 0);
  const profit = data.reduce((a, b) => a + b.profit, 0);
  return (
    <section
      className={`panel revenue-panel ${compact ? "standalone-chart" : ""}`}
    >
      <div className="panel-heading">
        <div>
          <h2>Revenue overview</h2>
          <p>A little perspective on your performance.</p>
        </div>
        <div className="segmented" aria-label="Revenue chart period">
          {(["Week", "Month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={period === p ? "selected" : ""}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-summary">
        <div>
          <span className="chart-total">{currency(total)}</span>
          <span className="trend positive">
            <ArrowUpRight size={13} />
            12.4%
          </span>
          <span className="compare">vs. previous {period.toLowerCase()}</span>
        </div>
        <div className="chart-legend">
          <span>
            <i className="dot emerald" />
            Revenue
          </span>
          <span>
            <i className="dot sage" />
            Profit
          </span>
        </div>
      </div>
      <div
        className="revenue-chart"
        role="img"
        aria-label={`Revenue and profit for this ${period.toLowerCase()}. Revenue ${currency(total)}. Profit ${currency(profit)}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--green)" stopOpacity={0.14} />
                <stop offset="100%" stopColor="var(--green)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 5"
              stroke="var(--chart-grid)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              minTickGap={22}
              dy={9}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickFormatter={(n) => (n === 0 ? "$0" : `$${n / 1000}k`)}
              ticks={[0, 2000, 4000, 6000, 8000]}
              domain={[0, 8000]}
            />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="chart-tooltip">
                    <strong>{label}, 2026</strong>
                    {payload.map((p) => (
                      <div key={p.name}>
                        <span>
                          <i className="dot" style={{ background: p.color }} />
                          {p.name}
                        </span>
                        <b>{currency(Number(p.value))}</b>
                      </div>
                    ))}
                  </div>
                ) : null
              }
            />
            <Area
              name="Profit"
              type="monotone"
              dataKey="profit"
              stroke="#90bea9"
              strokeWidth={2}
              fill="transparent"
              activeDot={{ r: 5, strokeWidth: 3, stroke: "var(--surface)" }}
            />
            <Area
              name="Revenue"
              type="monotone"
              dataKey="revenue"
              stroke="var(--green)"
              strokeWidth={2.6}
              fill="url(#revenueFill)"
              activeDot={{ r: 5, strokeWidth: 3, stroke: "var(--surface)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footer">
        <span>
          <span className="tiny-pulse" />
          Your store is trending up
        </span>
        <span>
          {period === "Month" ? "October 1–10, 2026" : "October 4–10, 2026"}
        </span>
      </div>
    </section>
  );
}

export function CategoryChart({ onExplore }: { onExplore: () => void }) {
  return (
    <section className="panel category-panel">
      <div className="panel-heading">
        <div>
          <h2>Sales by category</h2>
          <p>What your customers are loving.</p>
        </div>
        <button
          className="icon-btn"
          title="Explore category analytics"
          aria-label="Explore category analytics"
          onClick={onExplore}
        >
          <ArrowUpRight size={18} />
        </button>
      </div>
      <div className="donut-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              dataKey="value"
              nameKey="name"
              innerRadius={67}
              outerRadius={86}
              paddingAngle={3}
              cornerRadius={4}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {categories.map((c) => (
                <Cell key={c.name} fill={c.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, name) => [`${v}%`, String(name)]}
              contentStyle={{
                borderRadius: 10,
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-label">
          <strong>574</strong>
          <span>Total orders</span>
        </div>
      </div>
      <div className="category-list">
        {categories.map((c) => (
          <div key={c.name}>
            <span>
              <i className="dot" style={{ background: c.color }} />
              {c.name}
            </span>
            <strong>
              {c.value}
              <span>%</span>
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <ShoppingCart size={26} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function SelectLabel({ children }: { children: ReactNode }) {
  return (
    <span className="select-wrapper">
      {children}
      <ChevronDown size={14} />
    </span>
  );
}
export function SectionLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ArrowRight size={14} />
    </button>
  );
}
