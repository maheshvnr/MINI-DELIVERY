import express from "express";
import { database } from "../utils/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get all delivery personnel (Admin only)
router.get("/delivery-personnel", authenticateToken, (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can view delivery personnel" });
    }

    const deliveryPersonnel = database.getUsersByRole("delivery");

    // Remove sensitive information
    const safePersonnel = deliveryPersonnel.map((person) => ({
      id: person.id,
      name: person.name,
      email: person.email,
      createdAt: person.createdAt,
    }));

    res.json({ deliveryPersonnel: safePersonnel });
  } catch (error) {
    console.error("Get delivery personnel error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user profile
router.get("/profile", authenticateToken, (req, res) => {
  try {
    const user = database.findUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove sensitive information
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.json({ user: safeUser });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Name must be at least 2 characters long" });
    }

    const updatedUser = database.updateUser(req.user.userId, {
      name: name.trim(),
      updatedAt: new Date().toISOString(),
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove sensitive information
    const safeUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    };

    res.json({
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user statistics
router.get("/stats", authenticateToken, (req, res) => {
  try {
    let stats = {};

    if (req.user.role === "customer") {
      const orders = database.getOrdersByCustomerId(req.user.userId);
      stats = {
        totalOrders: orders.length,
        pending: orders.filter((o) => o.status === "pending").length,
        inProgress: orders.filter((o) =>
          ["assigned", "picked-up"].includes(o.status),
        ).length,
        delivered: orders.filter((o) => o.status === "delivered").length,
      };
    } else if (req.user.role === "delivery") {
      const orders = database.getOrdersByDeliveryPersonId(req.user.userId);
      const allOrders = database
        .getAllOrders()
        .filter((o) => o.deliveryPersonId === req.user.userId);

      stats = {
        totalAssigned: allOrders.length,
        active: orders.length,
        pickedUp: orders.filter((o) => o.status === "picked-up").length,
        completed: allOrders.filter((o) => o.status === "delivered").length,
      };
    } else if (req.user.role === "admin") {
      const allOrders = database.getAllOrders();
      const allUsers = database.getAllUsers();

      stats = {
        totalOrders: allOrders.length,
        totalUsers: allUsers.length,
        customers: allUsers.filter((u) => u.role === "customer").length,
        deliveryPersonnel: allUsers.filter((u) => u.role === "delivery").length,
        pending: allOrders.filter((o) => o.status === "pending").length,
        inProgress: allOrders.filter((o) =>
          ["assigned", "picked-up"].includes(o.status),
        ).length,
        delivered: allOrders.filter((o) => o.status === "delivered").length,
      };
    }

    res.json({ stats });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
