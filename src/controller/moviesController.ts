import express, { NextFunction, Response, Request } from "express";
import { MovieModel } from "../model/moviesModel";
import { User } from "../model/userModel";
import { addMovieSchema, editMovieSchema, variables } from "../utils/utils";
import slugifyFilename from "../utils/upload";
import multer from "multer";

const upload = multer({ dest: "public/uploads" });

/*========Create Movie========*/

export const CreateMovie = async (req: Request | any, res: Response) => {
  try {
    const { title, description, price } = req.body;
    const validationResult = addMovieSchema.validate(req.body, variables);

    if (validationResult.error) {
      return res.render("Dashboard", {
        error: validationResult.error.details[0].message,
      });
    }

    if (!req.file) {
      return res.render("Dashboard", { error: "No file uploaded" });
    }

    const name = slugifyFilename(req.file.originalname);

    const image = {
      fieldname: req.file.fieldname,
      originalname: name,
      encoding: req.file.encoding,
      destination: req.file.destination,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      path: req.file.path,
      size: req.file.size,
    };

    const movie = await MovieModel.create({
      title,
      description,
      image,
      price,
      userId: req.user.id,
    });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.render("Dashboard", { error: "User not found" });
    }
    user.movies.push(movie);
    await user.save();

    return res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
};

/*=======Update Movie Info==========*/

export const UpdateMovie = async (req: Request | any, res: Response) => {
  try {
    const { id } = req.user;
    const { title, description, price } = req.body;
    const validationResult = editMovieSchema.validate(req.body, variables);

    if (validationResult.error) {
      res.render("Dashboard", {
        error: validationResult.error.details[0].message,
      });
    }

    const movieId = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return res.render("Dashboard", { message: "User not found" });
    }

    await MovieModel.updateOne(
      { _id: movieId },
      { $set: { title, description, price } }
    );

    const updatedMovies = user.movies.map((movie) =>
      movie._id == movieId
        ? { ...(<any>movie)._doc, title, description, price }
        : movie
    );

    await User.updateOne({ _id: id }, { $set: { movies: updatedMovies } });

    return res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
};

/*========Delete Movie=========*/

export const DeleteMovie = async (req: Request | any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.render("Dashboard", { message: "User not found" });
    }

    const deletedMovie = await MovieModel.findByIdAndDelete(id);

    if (!deletedMovie) {
      return res.render("Dashboard", { message: "Movie not found" });
    }

    const updatedMovies = user.movies.filter(
      (movie) => movie._id.toString() !== id
    );

    user.movies = updatedMovies;
    await user.save();

    return res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
};
