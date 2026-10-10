import type { Order, Status } from "./data";
export type Sort = { field: "amount" | "date"; direction: "asc" | "desc" };
export function filterOrders(
  orders: Order[],
  query: string,
  status: Status | "All statuses",
  sort: Sort,
): Order[] {
  const normalized = query.toLowerCase().trim();
  return orders
    .filter(
      (o) =>
        (status === "All statuses" || o.status === status) &&
        (!normalized ||
          `${o.id} #${o.id} ${o.name} ${o.email}`
            .toLowerCase()
            .includes(normalized)),
    )
    .sort((a, b) => {
      const diff =
        (sort.field === "amount"
          ? a.amount - b.amount
          : a.date.localeCompare(b.date)) || a.id - b.id;
      return sort.direction === "asc" ? diff : -diff;
    });
}
export function ordersCsv(orders: Order[]): string {
  const cell = (value: string | number) => {
    const text = String(value);
    return `"${(/^[=+\-@\t\r]/.test(text) ? "'" : "") + text.replace(/"/g, '""')}"`;
  };
  return (
    "\uFEFF" +
    [
      [
        "Order ID",
        "Customer Name",
        "Email",
        "City",
        "State",
        "ZIP",
        "Date",
        "Amount (USD)",
        "Status",
      ],
      ...orders.map((o) => [
        `#${o.id}`,
        o.name,
        o.email,
        o.city,
        o.state,
        o.zip,
        `${o.date.slice(5, 7)}/${o.date.slice(8, 10)}/${o.date.slice(0, 4)}`,
        o.amount.toFixed(2),
        o.status,
      ]),
    ]
      .map((row) => row.map(cell).join(","))
      .join("\r\n")
  );
}
