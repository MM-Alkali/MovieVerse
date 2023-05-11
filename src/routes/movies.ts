import express from "express";
import {
  CreateMovie,
  UpdateMovie,
  DeleteMovie
} from "../controllers/moviesController";

import { isUser } from "../middleware/authorization";
import { upload } from "../utils/uploads";

const router = express.Router();

router.post("/add", isUser, upload.single("image"), CreateMovie);

router.post("/update/:id", isUser, UpdateMovie);

router.get("/delete/:id", isUser, DeleteMovie);

export default router;
