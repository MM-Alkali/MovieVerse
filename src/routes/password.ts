import express from "express";
import { genOtp, verifyOtp, resetPassword } from "../controllers/passwordController";

const router = express.Router();

router.post("/reset", genOtp);

router.post("/verify/:id", verifyOtp);

router.post("/reset/:token", resetPassword);

export default router;