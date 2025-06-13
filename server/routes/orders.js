import express from "express";
import { v4 as uuidv4 } from "uuid";
import { database } from "../utils/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Create order (Customer only)
router.post("/", authenticateToken, (req, res) => {
  try {
    const {
      pickupAddress,
      dropAddress,
      itemDescription,
      pickupCoords,
      dropCoords,
    } = req.body;

    if (req.user.role !== "customer") {
      return res
        .status(403)
        .json({ message: "Only customers can create orders" });
    }

    // Validation
    if (!pickupAddress || !dropAddress || !itemDescription) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const order = {
      id: uuidv4(),
      customerId: req.user.userId,
      pickupAddress,
      dropAddress,
      itemDescription,
      pickupCoords: pickupCoords || null,
      dropCoords: dropCoords || null,
      status: "pending",
      deliveryPersonId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    database.addOrder(order);

    // Emit real-time update
    const io = req.app.get("io");
    io.emit("orderCreated", order);
    io.emit("orderUpdate", { orderId: order.id, status: "pending" });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get orders
router.get("/", authenticateToken, (req, res) => {
  try {
    let orders;

    if (req.user.role === "customer") {
      orders = database.getOrdersByCustomerId(req.user.userId);
    } else if (req.user.role === "delivery") {
      orders = database.getOrdersByDeliveryPersonId(req.user.userId);
    } else if (req.user.role === "admin") {
      orders = database.getAllOrders();
    } else {
      return res.status(403).json({ message: "Invalid role" });
    }

    res.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get order by ID
router.get("/:id", authenticateToken, (req, res) => {
  try {
    const order = database.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    if (req.user.role === "customer" && order.customerId !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    if (
      req.user.role === "delivery" &&
      order.deliveryPersonId !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Assign order to delivery person (Admin only)
router.put("/:id/assign", authenticateToken, (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can assign orders" });
    }

    const { deliveryPersonId } = req.body;

    if (!deliveryPersonId) {
      return res
        .status(400)
        .json({ message: "Delivery person ID is required" });
    }

    const order = database.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Order is not in pending status" });
    }

    const deliveryPerson = database.findUserById(deliveryPersonId);
    if (!deliveryPerson || deliveryPerson.role !== "delivery") {
      return res.status(400).json({ message: "Invalid delivery person" });
    }

    const updatedOrder = database.updateOrder(req.params.id, {
      deliveryPersonId,
      status: "assigned",
      updatedAt: new Date().toISOString(),
    });

    // Emit real-time update
    const io = req.app.get("io");
    io.emit("orderAssigned", {
      orderId: updatedOrder.id,
      deliveryPersonId,
      deliveryPersonName: deliveryPerson.name,
    });
    io.emit("orderUpdate", { orderId: updatedOrder.id, status: "assigned" });

    res.json({
      message: "Order assigned successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Assign order error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update order status (Delivery person only)
router.put("/:id/status", authenticateToken, (req, res) => {
  try {
    if (req.user.role !== "delivery") {
      return res
        .status(403)
        .json({ message: "Only delivery personnel can update order status" });
    }

    const { status } = req.body;
    const validStatuses = ["picked-up", "delivered"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = database.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.deliveryPersonId !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });
    }

    // Validate status transition
    if (status === "picked-up" && order.status !== "assigned") {
      return res
        .status(400)
        .json({ message: "Order must be assigned before it can be picked up" });
    }

    if (status === "delivered" && order.status !== "picked-up") {
      return res
        .status(400)
        .json({
          message: "Order must be picked up before it can be delivered",
        });
    }

    const updatedOrder = database.updateOrder(req.params.id, {
      status,
      updatedAt: new Date().toISOString(),
    });

    // Emit real-time update
    const io = req.app.get("io");
    io.emit("orderStatusUpdated", {
      orderId: updatedOrder.id,
      status,
      deliveryPersonId: req.user.userId,
    });
    io.emit("orderUpdate", { orderId: updatedOrder.id, status });

    res.json({
      message: `Order marked as ${status.replace("-", " ")}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get order statistics (Admin only)
router.get("/stats/overview", authenticateToken, (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can view statistics" });
    }

    const orders = database.getAllOrders();

    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      assigned: orders.filter((o) => o.status === "assigned").length,
      pickedUp: orders.filter((o) => o.status === "picked-up").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };

    res.json({ stats });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
