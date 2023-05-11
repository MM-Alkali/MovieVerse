import express from "express";
import {
  Register,
  Login,
  Logout,
  Verify,
} from "../controllers/userContoller";

const router = express.Router();

router.post("/register", Register);

router.post('/verify/:id', Verify);

router.post("/login", Login);

router.get("/logout", Logout);

export default router;
