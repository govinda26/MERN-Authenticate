import express from "express";
import { verifyRole, verifyToken } from "../middleware/auth.middleware.js";
import {
  deleteUser,
  getProfile,
  getUsers,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", verifyToken, verifyRole("admin"), getUsers);
router.delete("/:id", verifyToken, verifyRole("admin"), deleteUser);
router.get("/me", verifyToken, getProfile);

export default router;
