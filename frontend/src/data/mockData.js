// Mock vendor and menu data for Qzaam

export const vendor = {
  id: 'v001',
  name: 'The Spice Room',
  cuisine: 'Indian Fusion',
  status: 'open',
  waitTime: 12,
  rating: 4.8,
  reviews: 342,
  image: null,
  description: 'Artisanal Indian fusion with bold flavors and modern twists.',
};

export const categories = ['All', 'Starters', 'Mains', 'Sides', 'Drinks', 'Desserts'];

export const menuItems = [
  {
    id: 'm001',
    name: 'Tandoori Sliders',
    description: 'Soft brioche buns with spiced chicken tikka and mint chutney.',
    price: 249,
    category: 'Starters',
    popular: true,
    veg: false,
    prepTime: 8,
  },
  {
    id: 'm002',
    name: 'Paneer Tikka Bites',
    description: 'Smoky cottage cheese cubes marinated in yogurt spices.',
    price: 199,
    category: 'Starters',
    popular: true,
    veg: true,
    prepTime: 7,
  },
  {
    id: 'm003',
    name: 'Butter Chicken Bowl',
    description: 'Classic tomato-cashew gravy with aromatic spices on basmati rice.',
    price: 349,
    category: 'Mains',
    popular: true,
    veg: false,
    prepTime: 15,
  },
  {
    id: 'm004',
    name: 'Dal Makhani Platter',
    description: 'Slow-cooked black lentils in rich butter and cream sauce.',
    price: 299,
    category: 'Mains',
    popular: false,
    veg: true,
    prepTime: 12,
  },
  {
    id: 'm005',
    name: 'Biryani Fusion',
    description: 'Layered saffron rice with your choice of protein and raita.',
    price: 399,
    category: 'Mains',
    popular: true,
    veg: false,
    prepTime: 18,
  },
  {
    id: 'm006',
    name: 'Masala Fries',
    description: 'Crispy fries tossed with chaat masala and lime.',
    price: 149,
    category: 'Sides',
    popular: false,
    veg: true,
    prepTime: 6,
  },
  {
    id: 'm007',
    name: 'Garlic Naan Basket',
    description: 'Fluffy tandoor-baked naan with garlic butter glaze.',
    price: 99,
    category: 'Sides',
    popular: true,
    veg: true,
    prepTime: 5,
  },
  {
    id: 'm008',
    name: 'Mango Lassi',
    description: 'Velvety chilled yogurt drink with Alphonso mango.',
    price: 129,
    category: 'Drinks',
    popular: true,
    veg: true,
    prepTime: 3,
  },
  {
    id: 'm009',
    name: 'Cold Brew Chai',
    description: 'House-brewed masala chai served over ice.',
    price: 119,
    category: 'Drinks',
    popular: false,
    veg: true,
    prepTime: 3,
  },
  {
    id: 'm010',
    name: 'Gulab Jamun Sundae',
    description: 'Warm gulab jamun on vanilla bean ice cream with rose syrup.',
    price: 179,
    category: 'Desserts',
    popular: true,
    veg: true,
    prepTime: 5,
  },
  {
    id: 'm011',
    name: 'Chai Crème Brûlée',
    description: 'French custard infused with cardamom and cinnamon.',
    price: 199,
    category: 'Desserts',
    popular: false,
    veg: true,
    prepTime: 8,
  },
];

export const orderStatuses = [
  { id: 1, label: 'Payment Confirmed', icon: '✓', time: '2:14 PM' },
  { id: 2, label: 'Preparing Your Order', icon: '🔥', time: '2:16 PM' },
  { id: 3, label: 'Ready for Pickup', icon: '🛎', time: null },
  { id: 4, label: 'Completed', icon: '✓', time: null },
];

export const features = [
  {
    icon: '⚡',
    title: 'Instant Access',
    description: 'Scan any QR code and land directly on the vendor\'s live menu. No app download, no signup friction.',
  },
  {
    icon: '💳',
    title: 'Frictionless Pay',
    description: 'Pay securely in seconds with UPI, cards, or wallets. Your receipt is instant.',
  },
  {
    icon: '🚀',
    title: 'Rapid Fulfillment',
    description: 'Your order lands in the kitchen the moment you confirm. Real-time status so you always know.',
  },
];

export const vendorSteps = [
  {
    number: '01',
    title: 'Register Your Outlet',
    description: 'Create your vendor account, add your outlet details, and upload your menu in minutes.',
  },
  {
    number: '02',
    title: 'Generate Your QR',
    description: 'Get a unique QR code for each table, counter, or location. Print and display — that\'s it.',
  },
  {
    number: '03',
    title: 'Start Receiving Orders',
    description: 'Customers scan, order, and pay. You see orders in real-time on your dashboard.',
  },
];

export const mockOrders = [
  { id: 'ORD-01', customer: 'Alice', items: '2x Tandoori Sliders, 1x Mango Lassi', status: 'pending', total: 627, time: '2 mins ago' },
  { id: 'ORD-02', customer: 'Bob', items: '1x Butter Chicken Bowl', status: 'preparing', total: 349, time: '8 mins ago' },
  { id: 'ORD-03', customer: 'Charlie', items: '1x Biryani Fusion, 1x Masala Fries', status: 'ready', total: 548, time: '15 mins ago' },
  { id: 'ORD-04', customer: 'David', items: '2x Cold Brew Chai', status: 'completed', total: 238, time: '30 mins ago' },
];

export const mockVendorsExt = [
  { id: 'v001', name: 'The Spice Room', status: 'active', sales: 124500, rating: 4.8 },
  { id: 'v002', name: 'Neon Bites', status: 'pending', sales: 0, rating: 0 },
  { id: 'v003', name: 'Waffle House', status: 'active', sales: 45200, rating: 4.2 },
  { id: 'v004', name: 'Burger Station', status: 'suspended', sales: 8400, rating: 3.5 },
];

export const mockComplaints = [
  { id: 'c01', user: 'Emma W.', text: 'Order was delayed by 30 mins.', status: 'open' },
  { id: 'c02', user: 'Liam J.', text: 'Wrong item delivered.', status: 'resolved' },
];

export const adminKPIs = [
  { label: 'Order Success Rate', value: '98.5%', trend: '+1.2%' },
  { label: 'Avg Prep Time', value: '14 mins', trend: '-2 mins' },
  { label: 'Cancellation Rate', value: '1.5%', trend: '-0.3%' },
];
