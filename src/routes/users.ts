import express from "express";
import {
  Register,
  Login,
  Logout,
//   getUserAndMovies,
} from "../controller/userContoller";

const router = express.Router();

router.post("/register", Register);

router.post("/login", Login);

router.get("/logout", Logout);

// router.get("/allusers", getUserAndMovies);

export default router;
