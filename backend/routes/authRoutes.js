import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";

const router = express.Router();

// Register new user (Admin creates accounts)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    // require department for manager/employee roles
    if ((role === "manager" || role === "employee") && !department) {
      return res.status(400).json({ error: "Department is required for manager/employee roles" });
    }

    // if department provided, validate it exists
    if (department) {
      const dept = await Department.findById(department);
      if (!dept) return res.status(400).json({ error: "Invalid department id" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await Employee.create({
      name,
      email,
      password: hashed,
      role,
      department,
    });
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await Employee.findOne({ email }).populate("department");
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid email or password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  });
});

export default router;
