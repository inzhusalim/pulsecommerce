import { useMemo, useState } from "react";
import {
  Search,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Ellipsis,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Check,
  CheckCheck,
} from "lucide-react";
import { currency, dateLabel, initials } from "./data";
import type { Order, Status } from "./data";
import { filterOrders } from "./order-utils";
import type { Sort } from "./order-utils";
import { EmptyState, Modal, SectionLink, SelectLabel } from "./components";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`status-badge status-${status.toLowerCase().replace(" ", "-")}`}
    >
      <i />
      {status}
    </span>
  );
}
export function Avatar({ name, index = 0 }: { name: string; index?: number }) {
  return <span className={`avatar avatar-${index % 5}`}>{initials(name)}</span>;
}
export function OrderTable({
  orders,
  onOpen,
  onExport,
  onViewAll,
  full = false,
}: {
  orders: Order[];
  onOpen: (o: Order) => void;
  onExport: (orders: Order[]) => void;
  onViewAll?: () => void;
  full?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "All statuses">("All statuses");
  const [sort, setSort] = useState<Sort>({ field: "date", direction: "desc" });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const [selected, setSelected] = useState<number[]>([]);
  const filtered = useMemo(
    () => filterOrders(orders, query, status, sort),
    [orders, query, status, sort],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(page, pages);
  const rows = filtered.slice((currentPage - 1) * size, currentPage * size);
  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    );
  const allChecked =
    rows.length > 0 && rows.every((o) => selected.includes(o.id));
  const changeSort = (field: Sort["field"]) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
    setPage(1);
  };
  const SortIcon = ({ field }: { field: Sort["field"] }) =>
    sort.field !== field ? (
      <ArrowUpDown size={12} />
    ) : sort.direction === "asc" ? (
      <ArrowUp size={12} />
    ) : (
      <ArrowDown size={12} />
    );
  const selectedRows = filtered.filter((o) => selected.includes(o.id));
  return (
    <section className="panel orders-panel">
      <div className="panel-heading">
        <div>
          <div className="flex items-center gap-2.5">
            <h2>{full ? "All orders" : "Recent orders"}</h2>
            <span className="count-pill">{orders.length}</span>
          </div>
          <p>
            {full
              ? "Keep every order moving, from checkout to doorstep."
              : "A closer look at what’s happening in your store."}
          </p>
        </div>
        {onViewAll ? (
          <SectionLink onClick={onViewAll}>View all orders</SectionLink>
        ) : (
          <button
            className="button secondary"
            onClick={() =>
              onExport(selectedRows.length ? selectedRows : filtered)
            }
          >
            <Download size={15} />
            Export CSV
          </button>
        )}
      </div>
      <div className="table-toolbar">
        <label className="table-search">
          <Search size={16} />
          <input
            aria-label="Search orders"
            placeholder="Search by name or order ID..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setPage(1);
              }}
              aria-label="Clear order search"
            >
              ×
            </button>
          )}
        </label>
        <div className="flex items-center gap-2">
          <SelectLabel>
            <select
              aria-label="Filter orders by status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as typeof status);
                setPage(1);
              }}
            >
              <option>All statuses</option>
              {(
                ["Fulfilled", "In Transit", "Pending", "Refunded"] as const
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </SelectLabel>
          {!full && (
            <button
              className="button secondary export-table"
              onClick={() =>
                onExport(selectedRows.length ? selectedRows : filtered)
              }
            >
              <Download size={14} />
              Export
            </button>
          )}
        </div>
      </div>
      {selectedRows.length > 0 && (
        <div className="selection-bar">
          <span>
            <CheckCheck size={15} />
            {selectedRows.length} order{selectedRows.length !== 1 ? "s" : ""}{" "}
            selected
          </span>
          <button onClick={() => setSelected([])}>Clear selection</button>
          <button onClick={() => onExport(selectedRows)}>
            Export selected
          </button>
        </div>
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input
                  type="checkbox"
                  aria-label="Select all orders on this page"
                  checked={allChecked}
                  onChange={() =>
                    setSelected((prev) =>
                      allChecked
                        ? prev.filter((id) => !rows.some((o) => o.id === id))
                        : [...new Set([...prev, ...rows.map((o) => o.id)])],
                    )
                  }
                />
              </th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Destination</th>
              <th
                aria-sort={
                  sort.field === "date"
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button
                  className="sort-button"
                  onClick={() => changeSort("date")}
                >
                  Date
                  <SortIcon field="date" />
                </button>
              </th>
              <th
                aria-sort={
                  sort.field === "amount"
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button
                  className="sort-button"
                  onClick={() => changeSort("amount")}
                >
                  Amount
                  <SortIcon field="amount" />
                </button>
              </th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((o, index) => (
              <tr
                key={o.id}
                className={selected.includes(o.id) ? "row-selected" : ""}
              >
                <td className="checkbox-cell">
                  <input
                    type="checkbox"
                    aria-label={`Select order #${o.id}`}
                    checked={selected.includes(o.id)}
                    onChange={() => toggle(o.id)}
                  />
                </td>
                <td>
                  <button className="order-id" onClick={() => onOpen(o)}>
                    #{o.id}
                  </button>
                </td>
                <td>
                  <div className="customer-cell">
                    <Avatar name={o.name} index={index} />
                    <div>
                      <strong>{o.name}</strong>
                      <span>{o.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="destination">
                    <strong>
                      {o.city}, {o.state}
                    </strong>
                    <span>{o.zip}</span>
                  </div>
                </td>
                <td className="date-cell">{dateLabel(o.date)}</td>
                <td className="amount-cell">{currency(o.amount)}</td>
                <td>
                  <StatusBadge status={o.status} />
                </td>
                <td>
                  <button
                    className="icon-btn row-action"
                    aria-label={`View order #${o.id}`}
                    onClick={() => onOpen(o)}
                  >
                    <Ellipsis size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <EmptyState
          title="No orders found"
          description="Try a different name, order ID, or status."
          action={
            <button
              className="button secondary"
              onClick={() => {
                setQuery("");
                setStatus("All statuses");
                setPage(1);
              }}
            >
              Clear filters
            </button>
          }
        />
      )}
      <div className="table-pagination">
        <span>
          {filtered.length
            ? `Showing ${(currentPage - 1) * size + 1}–${Math.min(currentPage * size, filtered.length)} of ${filtered.length} orders`
            : "0 orders"}
        </span>
        <div className="pagination-controls">
          <SelectLabel>
            <select
              aria-label="Orders per page"
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
            </select>
          </SelectLabel>
          <button
            className="pagination-arrow"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === pages || Math.abs(p - currentPage) <= 1,
            )
            .map((p, i, list) => (
              <span className="page-item" key={p}>
                {i > 0 && p - list[i - 1] > 1 && (
                  <span className="page-ellipsis">…</span>
                )}
                <button
                  className={`page-number ${p === currentPage ? "active" : ""}`}
                  onClick={() => setPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === currentPage ? "page" : undefined}
                >
                  {p}
                </button>
              </span>
            ))}
          <button
            className="pagination-arrow"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === pages}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

export function OrderDetail({
  order,
  onClose,
  onUpdate,
}: {
  order: Order;
  onClose: () => void;
  onUpdate: (status: Status) => void;
}) {
  const [status, setStatus] = useState(order.status);
  return (
    <Modal title={`Order #${order.id}`} onClose={onClose}>
      <div className="order-detail">
        <div className="detail-customer">
          <Avatar name={order.name} />
          <div>
            <h3>{order.name}</h3>
            <p>{order.email}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="detail-grid">
          <div>
            <MapPin size={18} />
            <span>
              Shipping destination
              <strong>
                {order.city}, {order.state} {order.zip}
              </strong>
              <small>United States</small>
            </span>
          </div>
          <div>
            <Calendar size={18} />
            <span>
              Order placed<strong>{dateLabel(order.date)}</strong>
            </span>
          </div>
          <div>
            <Package size={18} />
            <span>
              Items in this order
              <strong>
                {order.items} item{order.items > 1 ? "s" : ""}
              </strong>
            </span>
          </div>
          <div>
            <CreditCard size={18} />
            <span>
              Order total<strong>{currency(order.amount)}</strong>
              <small>USD · Tax included</small>
            </span>
          </div>
        </div>
        <div className="order-timeline">
          <h4>Order activity</h4>
          <div>
            <span className="timeline-check">
              <Check size={13} />
            </span>
            <p>
              <strong>Order received</strong>
              <small>{dateLabel(order.date)} · Checkout completed</small>
            </p>
          </div>
          <div>
            <span className="timeline-check">
              <Package size={13} />
            </span>
            <p>
              <strong>{order.status}</strong>
              <small>
                {order.status === "Pending"
                  ? "Awaiting processing by your team"
                  : order.status === "Refunded"
                    ? "Payment returned to the customer"
                    : order.status === "In Transit"
                      ? "Package is on its way to the customer"
                      : "Order delivered to the customer"}
              </small>
            </p>
          </div>
        </div>
        <div className="status-editor">
          <label htmlFor="order-status">Update order status</label>
          <SelectLabel>
            <select
              id="order-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              {(
                ["Fulfilled", "In Transit", "Pending", "Refunded"] as const
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </SelectLabel>
        </div>
        <div className="modal-actions">
          <button className="button secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="button primary"
            disabled={status === order.status}
            onClick={() => {
              onUpdate(status);
              onClose();
            }}
          >
            <Check size={15} />
            Save changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
