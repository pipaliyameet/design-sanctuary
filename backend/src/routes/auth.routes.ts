import { Router } from "express";
import { login, ownerLogin, signup, logout, getMe, updateProfile } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/role.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/owner-login", ownerLogin);
router.post("/quick-login", ownerLogin);
router.post("/signup", signup);
router.post("/register", signup);
router.post("/logout", logout);
router.get("/me", getMe);
router.patch("/profile", requireAuth, updateProfile);

export default router;


