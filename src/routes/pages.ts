import express, { NextFunction, Response, Request } from "express";
import { MovieModel } from "../model/moviesModel";
import { isUser } from "../middleware/authorization";

const router = express.Router();

// Registration Page
router.get("/register", (req: Request, res: Response, next: NextFunction) => {
  res.render("Register");
});

// Login Page
router.get("/login", (req: Request, res: Response, next: NextFunction) => {
  res.render("Login");
});

// Landing Page
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = 7;
    const skipIndex: number = (page - 1) * limit;

    const movieList = await MovieModel.find()
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limit);
    const count = await MovieModel.countDocuments();
    const totalPages = Math.ceil(count / limit);
    const currentPage = page;

    return res.render("Home", {
      movieList,
      totalPages,
      currentPage,
    });
  } catch (error) {
    console.log(error);
  }
});

// User Dashboard 
router.get("/dashboard", isUser, async (req: Request | any, res: Response) => {
  try {
    const { id } = req.user;
    const perPage = 8; 
    const page = parseInt(req.query.page) || 1; 

    const movieListCount = await MovieModel.countDocuments({ userId: id });
    const totalPages = Math.ceil(movieListCount / perPage); 

    const movieList = await MovieModel.find({ userId: id })
      .skip((page - 1) * perPage)
      .limit(perPage);

    if (!movieList) {
      return res.render("Dashboard", { message: "No movies found" });
    }

    return res.render("Dashboard", {
      movieList,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log(error);
  }
});

export default router;
