import express from "express";
import { genOtp, verifyOtp, resetPassword } from "../controllers/passwordController";

const router = express.Router();

router.post("/forgot", genOtp);

router.post("/verify/:id", verifyOtp);

router.post("/reset/:id", resetPassword);

export default router;