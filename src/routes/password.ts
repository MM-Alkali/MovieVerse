import express from "express";
import { genOtp, verifyOtp, resetPassword } from "../controllers/passwordController";

const router = express.Router();

router.post("/reset", genOtp);

router.post("/verify", verifyOtp);

router.post("/reset/:token", resetPassword);