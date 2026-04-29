export const adminVendors = [
  {
    id: 1,
    name: "StarFood",
    category: "Fast Food",
    status: "verified",
    orders: 28,
    cancelled: 2,
    amount: 7840,
    earnings: 7840,
    joined: "May 01, 2025"
  },
  {
    id: 2,
    name: "Tandoori Nights",
    category: "Indian",
    status: "unverified",
    orders: 15,
    cancelled: 0,
    amount: 4500,
    earnings: 4500,
    joined: "May 02, 2025"
  },
  {
    id: 3,
    name: "Burger Queen",
    category: "Fast Food",
    status: "verified",
    orders: 42,
    cancelled: 5,
    amount: 12600,
    earnings: 12600,
    joined: "April 28, 2025"
  },
  {
    id: 4,
    name: "Pizza Heaven",
    category: "Italian",
    status: "unverified",
    orders: 8,
    cancelled: 1,
    amount: 2400,
    earnings: 2400,
    joined: "May 03, 2025"
  },
  {
    id: 5,
    name: "Spicy Treats",
    category: "Fast Food",
    status: "verified",
    orders: 34,
    cancelled: 3,
    amount: 9520,
    earnings: 9520,
    joined: "May 01, 2025"
  }
];

export const adminOrders = [
  {
    id: "ORD-1001",
    customer: "Sanuj Kumar",
    vendor: "StarFood",
    status: "completed",
    amount: 450,
    time: "10:30 AM"
  },
  {
    id: "ORD-1002",
    customer: "Aditi Roy",
    vendor: "Burger Queen",
    status: "pending",
    amount: 280,
    time: "11:15 AM"
  },
  {
    id: "ORD-1003",
    customer: "Rahul Singh",
    vendor: "Pizza Heaven",
    status: "cancelled",
    amount: 650,
    time: "11:45 AM"
  },
  {
    id: "ORD-1004",
    customer: "Priya Sharma",
    vendor: "StarFood",
    status: "completed",
    amount: 120,
    time: "12:10 PM"
  },
  {
    id: "ORD-1005",
    customer: "Ishaan Gupta",
    vendor: "Tandoori Nights",
    status: "pending",
    amount: 890,
    time: "12:35 PM"
  }
];

export const adminCustomers = [
  {
    id: 1,
    name: "Sanuj Kumar",
    phone: "+91 9876543210",
    email: "sanuj@example.com",
    orders: 12,
    joined: "April 15, 2025"
  },
  {
    id: 2,
    name: "Aditi Roy",
    phone: "+91 8765432109",
    email: "aditi@example.com",
    orders: 5,
    joined: "April 20, 2025"
  },
  {
    id: 3,
    name: "Rahul Singh",
    phone: "+91 7654321098",
    email: "rahul@example.com",
    orders: 8,
    joined: "May 01, 2025"
  },
  {
    id: 4,
    name: "Priya Sharma",
    phone: "+91 6543210987",
    email: "priya@example.com",
    orders: 3,
    joined: "May 02, 2025"
  }
];

export const adminPayments = [
  { id: "PAY-5001", orderId: "ORD-1001", vendor: "StarFood", amount: 450, status: "success", date: "May 01, 2025" },
  { id: "PAY-5002", orderId: "ORD-1002", vendor: "Burger Queen", amount: 280, status: "pending", date: "May 01, 2025" },
  { id: "PAY-5003", orderId: "ORD-1003", vendor: "Pizza Heaven", amount: 650, status: "failed", date: "May 01, 2025" },
  { id: "PAY-5004", orderId: "ORD-1004", vendor: "StarFood", amount: 120, status: "success", date: "May 02, 2025" },
  { id: "PAY-5005", orderId: "ORD-1005", vendor: "Tandoori Nights", amount: 890, status: "success", date: "May 02, 2025" },
];

export const adminCommissions = [
  { vendor: "StarFood", totalSales: 15400, rate: 10, amount: 1540, status: "paid", date: "May 01, 2025" },
  { vendor: "Burger Queen", totalSales: 12600, rate: 10, amount: 1260, status: "pending", date: "May 02, 2025" },
  { vendor: "Pizza Heaven", totalSales: 8400, rate: 10, amount: 840, status: "paid", date: "April 30, 2025" },
  { vendor: "Tandoori Nights", totalSales: 4500, rate: 10, amount: 450, status: "pending", date: "May 03, 2025" },
];

export const adminComplaints = [
  { id: "CMP-7001", customer: "Sanuj Kumar", vendor: "StarFood", subject: "Wrong item delivered", status: "open", priority: "high", date: "May 01, 2025" },
  { id: "CMP-7002", customer: "Aditi Roy", vendor: "Burger Queen", subject: "Delayed delivery", status: "in-progress", priority: "medium", date: "May 02, 2025" },
  { id: "CMP-7003", customer: "Rahul Singh", vendor: "Pizza Heaven", subject: "Cold food", status: "resolved", priority: "low", date: "May 02, 2025" },
  { id: "CMP-7004", customer: "Priya Sharma", vendor: "StarFood", subject: "Payment double charged", status: "open", priority: "high", date: "May 03, 2025" },
];

export const reportsData = {
  revenue: [
    { name: 'Mon', value: 4500 },
    { name: 'Tue', value: 5200 },
    { name: 'Wed', value: 3800 },
    { name: 'Thu', value: 6100 },
    { name: 'Fri', value: 7500 },
    { name: 'Sat', value: 9200 },
    { name: 'Sun', value: 8400 },
  ],
  ordersStatus: [
    { name: 'Completed', value: 850, fill: '#d4ff00' },
    { name: 'Pending', value: 120, fill: '#fbbf24' },
    { name: 'Cancelled', value: 45, fill: '#ef4444' },
  ]
};

export const adminKPIs = [
  { label: "Commission Earned", value: "₹2,450", trend: "+12.5%", positive: true },
  { label: "Total Vendors", value: "32", trend: "+4", positive: true },
  { label: "Verified Vendors", value: "24", trend: "+2", positive: true },
  { label: "Unverified Vendors", value: "8", trend: "-1", positive: false }
];
