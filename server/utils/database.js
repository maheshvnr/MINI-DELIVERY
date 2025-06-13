// Simple in-memory database for demo purposes
// In production, you would use a real database like MongoDB, PostgreSQL, etc.

class Database {
  constructor() {
    this.users = [];
    this.orders = [];
    this.init();
  }

  init() {
    // Initialize with some demo data
    console.log("🗄️  Initializing in-memory database...");
  }

  // User operations
  addUser(user) {
    this.users.push(user);
    return user;
  }

  findUserByEmail(email) {
    return this.users.find((user) => user.email === email);
  }

  findUserById(id) {
    return this.users.find((user) => user.id === id);
  }

  getUsersByRole(role) {
    return this.users.filter((user) => user.role === role);
  }

  getAllUsers() {
    return this.users;
  }

  updateUser(id, updates) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  deleteUser(id) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  // Order operations
  addOrder(order) {
    this.orders.push(order);
    return order;
  }

  getOrderById(id) {
    return this.orders.find((order) => order.id === id);
  }

  getAllOrders() {
    return this.orders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }

  getOrdersByCustomerId(customerId) {
    return this.orders
      .filter((order) => order.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getOrdersByDeliveryPersonId(deliveryPersonId) {
    return this.orders
      .filter(
        (order) =>
          order.deliveryPersonId === deliveryPersonId &&
          order.status !== "delivered",
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getOrdersByStatus(status) {
    return this.orders
      .filter((order) => order.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  updateOrder(id, updates) {
    const orderIndex = this.orders.findIndex((order) => order.id === id);
    if (orderIndex === -1) return null;

    this.orders[orderIndex] = { ...this.orders[orderIndex], ...updates };
    return this.orders[orderIndex];
  }

  deleteOrder(id) {
    const orderIndex = this.orders.findIndex((order) => order.id === id);
    if (orderIndex === -1) return false;

    this.orders.splice(orderIndex, 1);
    return true;
  }

  // Statistics
  getOrderStats() {
    const total = this.orders.length;
    const pending = this.orders.filter((o) => o.status === "pending").length;
    const assigned = this.orders.filter((o) => o.status === "assigned").length;
    const pickedUp = this.orders.filter((o) => o.status === "picked-up").length;
    const delivered = this.orders.filter(
      (o) => o.status === "delivered",
    ).length;

    return { total, pending, assigned, pickedUp, delivered };
  }

  getUserStats() {
    const total = this.users.length;
    const customers = this.users.filter((u) => u.role === "customer").length;
    const delivery = this.users.filter((u) => u.role === "delivery").length;
    const admins = this.users.filter((u) => u.role === "admin").length;

    return { total, customers, delivery, admins };
  }

  // Clear data (for testing)
  clearAll() {
    this.users = [];
    this.orders = [];
  }

  // Export data (for backup)
  exportData() {
    return {
      users: this.users.map((user) => ({ ...user, password: "[HIDDEN]" })),
      orders: this.orders,
      stats: {
        users: this.getUserStats(),
        orders: this.getOrderStats(),
      },
    };
  }
}

// Create and export database instance
export const database = new Database();
