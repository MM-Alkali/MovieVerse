import express, { NextFunction, Response, Request } from "express";
import { isUser } from "../middleware/authorization";
import { User } from "../model/userModel";
import { addMovieSchema, editMovieSchema, variables } from "../utils/utils";

const router = express.Router();

router.get("/register", (req: Request, res: Response, next: NextFunction) => {
  res.render("Register");
});

router.get("/login", (req: Request, res: Response, next: NextFunction) => {
  res.render("Login");
});

// Landing page

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const movieCount = await User.countDocuments({ movies: { $exists: true, $ne: [] } }); // count only users with non-empty movie array
    const totalPages = Math.ceil(movieCount / limit);

    const getAllMovies = await User.find({ movies: { $exists: true, $ne: [] } })
      .populate("movies") // populate the movies array with actual movie documents
      .skip(skip)
      .limit(limit);

    return res.render("Home", {
      movieList: getAllMovies.flatMap((user: { movies: any; }) => user.movies), // flatten the array of movie arrays to a single array of movies
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.log(error);
  }
});
  
  // User Dashboard (Consuming and displaying the created movie)
  
  router.get("/dashboard", isUser, async (req: Request | any, res: Response) => {
    try {
      const { id } = req.user;
      const perPage = 8;
      const page = parseInt(req.query.page) || 1;
  
      const user = await User.findOne({ _id: id }).populate({
        path: "movies",
        options: {
          skip: (page - 1) * perPage,
          limit: perPage,
        },
      });
  
      if (!user) {
        return res.render("Dashboard", { message: "User not found" });
      }
  
      const movieList = user.movies;
      const movieListCount = movieList.length;
      const totalPages = Math.ceil(movieListCount / perPage);
  
      return res.render("Dashboard", { movieList, currentPage: page, totalPages });
    } catch (error) {
      console.log(error);
    }
  });

  export default router;