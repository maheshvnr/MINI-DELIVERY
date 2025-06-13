import jwt from "jsonwebtoken";
import { database } from "./database.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const setupWebSocket = (io) => {
  console.log("🔌 Setting up WebSocket server...");

  // Store connected users
  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // Handle authentication
    socket.on("authenticate", (token) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = database.findUserById(decoded.userId);

        if (user) {
          socket.userId = user.id;
          socket.userRole = user.role;
          socket.userName = user.name;

          connectedUsers.set(socket.id, {
            userId: user.id,
            role: user.role,
            name: user.name,
          });

          socket.emit("authenticated", {
            message: "Successfully authenticated",
            user: {
              id: user.id,
              name: user.name,
              role: user.role,
            },
          });

          // Join role-specific rooms
          socket.join(`role_${user.role}`);

          // Join user-specific room
          socket.join(`user_${user.id}`);

          console.log(`✅ User authenticated: ${user.name} (${user.role})`);
        } else {
          socket.emit("authentication_error", { message: "User not found" });
        }
      } catch (error) {
        socket.emit("authentication_error", { message: "Invalid token" });
      }
    });

    // Handle order updates subscription
    socket.on("subscribe_to_orders", () => {
      if (!socket.userId) {
        socket.emit("error", { message: "Not authenticated" });
        return;
      }

      if (socket.userRole === "customer") {
        // Subscribe to own orders
        socket.join(`customer_${socket.userId}`);
      } else if (socket.userRole === "delivery") {
        // Subscribe to assigned orders
        socket.join(`delivery_${socket.userId}`);
      } else if (socket.userRole === "admin") {
        // Subscribe to all orders
        socket.join("admin_orders");
      }

      socket.emit("subscribed", { message: "Subscribed to order updates" });
    });

    // Handle real-time location updates (for delivery personnel)
    socket.on("location_update", (data) => {
      if (socket.userRole !== "delivery") {
        socket.emit("error", {
          message: "Only delivery personnel can send location updates",
        });
        return;
      }

      const { orderId, latitude, longitude } = data;

      // Validate the order belongs to this delivery person
      const order = database.getOrderById(orderId);
      if (!order || order.deliveryPersonId !== socket.userId) {
        socket.emit("error", {
          message: "Order not found or not assigned to you",
        });
        return;
      }

      // Broadcast location to customer and admin
      io.to(`customer_${order.customerId}`).emit("delivery_location", {
        orderId,
        latitude,
        longitude,
        deliveryPersonName: socket.userName,
        timestamp: new Date().toISOString(),
      });

      io.to("admin_orders").emit("delivery_location", {
        orderId,
        latitude,
        longitude,
        deliveryPersonId: socket.userId,
        deliveryPersonName: socket.userName,
        customerId: order.customerId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle custom events
    socket.on("join_room", (room) => {
      socket.join(room);
      socket.emit("joined_room", { room });
    });

    socket.on("leave_room", (room) => {
      socket.leave(room);
      socket.emit("left_room", { room });
    });

    // Handle ping/pong for connection health
    socket.on("ping", () => {
      socket.emit("pong");
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`👋 User disconnected: ${socket.id}`);
      connectedUsers.delete(socket.id);
    });
  });

  // Global event emitters for other parts of the application
  const emitToCustomer = (customerId, event, data) => {
    io.to(`customer_${customerId}`).emit(event, data);
  };

  const emitToDeliveryPerson = (deliveryPersonId, event, data) => {
    io.to(`delivery_${deliveryPersonId}`).emit(event, data);
  };

  const emitToAdmins = (event, data) => {
    io.to("admin_orders").emit(event, data);
  };

  const emitToAll = (event, data) => {
    io.emit(event, data);
  };

  const getConnectedUsers = () => {
    return Array.from(connectedUsers.values());
  };

  const getConnectedUsersByRole = (role) => {
    return Array.from(connectedUsers.values()).filter(
      (user) => user.role === role,
    );
  };

  // Export helper functions
  return {
    emitToCustomer,
    emitToDeliveryPerson,
    emitToAdmins,
    emitToAll,
    getConnectedUsers,
    getConnectedUsersByRole,
  };
};

// Order-specific event handlers
export const notifyOrderCreated = (io, order) => {
  // Notify admins about new order
  io.to("admin_orders").emit("new_order", {
    orderId: order.id,
    customerId: order.customerId,
    pickupAddress: order.pickupAddress,
    dropAddress: order.dropAddress,
    itemDescription: order.itemDescription,
    timestamp: order.createdAt,
  });
};

export const notifyOrderAssigned = (io, order, deliveryPersonName) => {
  // Notify customer
  io.to(`customer_${order.customerId}`).emit("order_assigned", {
    orderId: order.id,
    deliveryPersonName,
    message: `Your order has been assigned to ${deliveryPersonName}`,
  });

  // Notify delivery person
  io.to(`delivery_${order.deliveryPersonId}`).emit("new_assignment", {
    orderId: order.id,
    pickupAddress: order.pickupAddress,
    dropAddress: order.dropAddress,
    itemDescription: order.itemDescription,
    message: "You have a new delivery assignment",
  });
};

export const notifyOrderStatusUpdate = (io, order, oldStatus, newStatus) => {
  const statusMessages = {
    assigned: "Your order has been assigned to a delivery person",
    "picked-up": "Your order has been picked up and is on the way",
    delivered: "Your order has been delivered successfully",
  };

  // Notify customer
  io.to(`customer_${order.customerId}`).emit("order_status_update", {
    orderId: order.id,
    oldStatus,
    newStatus,
    message:
      statusMessages[newStatus] || `Order status updated to ${newStatus}`,
  });

  // Notify admins
  io.to("admin_orders").emit("order_status_update", {
    orderId: order.id,
    customerId: order.customerId,
    deliveryPersonId: order.deliveryPersonId,
    oldStatus,
    newStatus,
  });
};
