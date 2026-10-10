export type Status = "Fulfilled" | "In Transit" | "Pending" | "Refunded";
export interface Order {
  id: number;
  name: string;
  email: string;
  city: string;
  state: string;
  zip: string;
  date: string;
  amount: number;
  status: Status;
  items: number;
}
export type View =
  "Dashboard" | "Orders" | "Customers" | "Analytics" | "Settings";
export const currency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  );
export const dateLabel = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
export const initials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
const people: [string, string, string, string][] = [
  ["Olivia Rhye", "Los Angeles", "CA", "90012"],
  ["Phoenix Baker", "New York", "NY", "10001"],
  ["Lana Steiner", "Austin", "TX", "78701"],
  ["Demi Wilkinson", "Miami", "FL", "33101"],
  ["Drew Cano", "San Francisco", "CA", "94103"],
  ["Natali Craig", "Dallas", "TX", "75201"],
  ["Orlando Diggs", "San Diego", "CA", "92101"],
  ["Andi Lane", "Brooklyn", "NY", "11201"],
  ["Kate Morrison", "Orlando", "FL", "32801"],
  ["Koray Okumus", "Houston", "TX", "77002"],
  ["Alex Morgan", "Sacramento", "CA", "95814"],
  ["Sophie Moore", "Buffalo", "NY", "14201"],
  ["James Wilson", "Tampa", "FL", "33602"],
  ["Emma Davis", "Fort Worth", "TX", "76102"],
  ["Noah Kim", "Oakland", "CA", "94612"],
  ["Mia Thompson", "Rochester", "NY", "14604"],
  ["Lucas Martinez", "Jacksonville", "FL", "32202"],
  ["Ava Anderson", "San Antonio", "TX", "78205"],
  ["Ethan Garcia", "Irvine", "CA", "92612"],
  ["Isabella Lee", "Albany", "NY", "12207"],
  ["Mason Clark", "Naples", "FL", "34102"],
  ["Harper Lewis", "Plano", "TX", "75074"],
  ["Benjamin Hall", "Pasadena", "CA", "91101"],
  ["Charlotte Young", "Syracuse", "NY", "13202"],
  ["Oliver Allen", "Sarasota", "FL", "34236"],
  ["Amelia Wright", "El Paso", "TX", "79901"],
  ["Henry Scott", "Santa Monica", "CA", "90401"],
  ["Evelyn Green", "Queens", "NY", "11354"],
  ["Sebastian Adams", "St. Petersburg", "FL", "33701"],
  ["Abigail Nelson", "Frisco", "TX", "75034"],
  ["Jack Carter", "Long Beach", "CA", "90802"],
  ["Emily Mitchell", "New York", "NY", "10002"],
];
const amounts = [
  128.5, 84.0, 249.99, 56.75, 172.0, 93.4, 68.9, 312.5, 45.0, 159.99,
];
const statuses: Status[] = [
  "Fulfilled",
  "In Transit",
  "Pending",
  "Fulfilled",
  "Refunded",
  "Fulfilled",
  "Pending",
  "In Transit",
];
export const initialOrders: Order[] = people.map(
  ([name, city, state, zip], i) => ({
    id: 1042 - i,
    name,
    email: `${name.toLowerCase().replace(" ", ".")}@gmail.com`,
    city,
    state,
    zip,
    date: `2026-10-${String(10 - Math.floor(i / 4)).padStart(2, "0")}`,
    amount: amounts[i % amounts.length],
    status: statuses[i % statuses.length],
    items: 1 + (i % 4),
  }),
);
export const monthlyRevenue = [
  { label: "Oct 01", revenue: 3200, profit: 1640 },
  { label: "Oct 02", revenue: 4100, profit: 2070 },
  { label: "Oct 03", revenue: 3650, profit: 1790 },
  { label: "Oct 04", revenue: 4850, profit: 2640 },
  { label: "Oct 05", revenue: 4380, profit: 2240 },
  { label: "Oct 06", revenue: 5500, profit: 3040 },
  { label: "Oct 07", revenue: 4820, profit: 2560 },
  { label: "Oct 08", revenue: 6150, profit: 3580 },
  { label: "Oct 09", revenue: 5320, profit: 2870 },
  { label: "Oct 10", revenue: 6320.5, profit: 3540 },
];
export const weeklyRevenue = monthlyRevenue
  .slice(-7)
  .map((item, i) => ({
    ...item,
    label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
  }));
export const categories = [
  { name: "Apparel", value: 42, orders: 241, color: "#087f5b" },
  { name: "Accessories", value: 28, orders: 161, color: "#5caa8e" },
  { name: "Home & living", value: 18, orders: 103, color: "#a2ccbc" },
  { name: "Beauty", value: 8, orders: 46, color: "#c9ded5" },
  { name: "Other", value: 4, orders: 23, color: "#e8efeb" },
];
