import { Router } from "express";
import { login, signup, logout, getMe } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/register", signup);
router.post("/logout", logout);
router.get("/me", getMe);

export default router;
