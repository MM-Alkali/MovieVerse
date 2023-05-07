// import mongoose from "mongoose";
// import { dbConnect, dbDisconnect, dbDropCollection } from "./test.config";
// import { describe, test, beforeAll, afterAll } from "@jest/globals";
// import { expect } from "@jest/globals";
// import { UserModel } from "../model/userModel";
// import { MovieModel } from "../model/moviesModel";

// beforeAll(async () => await dbConnect());
// afterAll(async () => await dbDisconnect());

// describe("User Model Test Suite", () => {
//   test("should create a User data successfully", async () => {
//     const UserData = {
//       email: "test@email.com",
//       fullname: "Testing",
//       username: "Test",
//       password: "1234",
//     };

//     const newUserData = new UserModel(UserData);
//     await newUserData.save();
//     expect(newUserData._id).toBeDefined();
//     expect(newUserData.email).toBe(UserData.email);
//     expect(newUserData.fullname).toBe(UserData.fullname);
//     expect(newUserData.username).toBe(UserData.username);
//     expect(newUserData.password).toBe(UserData.password);
//   });

//   test("should fail for User data without required fields", async () => {
//     const invalidUserData = {};
  
//     try {
//       const newUserData = new UserModel(invalidUserData);
//       await newUserData.save();
//     } catch (error) {
//       const err = error as mongoose.Error.ValidationError
//       expect(err.errors?.fullname).toBeDefined();
//       expect(err.errors?.username).toBeDefined();
//       expect(err.errors?.email).toBeDefined();
//       expect(err.errors?.password).toBeDefined();
//     }
//   });  
// });

// describe("Movie Model Test Suite", () => {
//   test("should create a Movie data successfully", async () => {
//     const MovieData = {
//       userId: new mongoose.Types.ObjectId("643fde22de5bcc975ec75806"),
//       title: "Game of Thrones",
//       description:
//         "Nine noble families wage war against each other in order to gain control over the mythical land of Westeros. Meanwhile, a force is rising after millenniums and threatens the existence of living men",
//       image:
//         "https://pixel.nymag.com/imgs/daily/vulture/2019/04/04/got-recap/02-got-seasons-recap-illo.w1100.h733.jpg",
//       price: 5000,
//     };

//     const newMovieData = new MovieModel({
//       userId: new mongoose.Types.ObjectId(MovieData.userId),
//       title: MovieData.title,
//       description: MovieData.description,
//       image: MovieData.image,
//       price: MovieData.price,
//     });

//     await newMovieData.save();

//     expect(newMovieData._id).toBeDefined();
//     expect(newMovieData.userId).toEqual(MovieData.userId);
//     expect(newMovieData.title).toEqual(MovieData.title);
//     expect(newMovieData.description).toEqual(MovieData.description);
//     expect(newMovieData.image).toEqual(MovieData.image);
//     expect(newMovieData.price).toEqual(MovieData.price);
//   });

//   test("should fail for Movie data without required fields", async () => {
//     const invalidMovieData = {
//       userId: new mongoose.Types.ObjectId("643fde22de5bcc975ec75806"),
//       title: "Game of Thrones",
//       description:
//         "Nine noble families wage war against each other in order to gain control over the mythical land of Westeros. Meanwhile, a force is rising after millenniums and threatens the existence of living men",
//       image:
//         "https://pixel.nymag.com/imgs/daily/vulture/2019/04/04/got-recap/02-got-seasons-recap-illo.w1100.h733.jpg",
//       price: 5000,
//     };

//     try {
//       const newMovieData = new MovieModel(invalidMovieData);
//       await newMovieData.save();
//     } catch (error) {
//       const err = error as mongoose.Error.ValidationError;
//       expect(err.errors.userId).toBeDefined();
//     }
//   });

//   test("should update a Movie successfully", async () => {
//     // Create a new Movie document
//     const newMovieData = {
//       userId: new mongoose.Types.ObjectId(),
//       title: "Game of Thrones",
//       description:
//         "Nine noble families wage war against each other in order to gain control over the mythical land of Westeros. Meanwhile, a force is rising after millenniums and threatens the existence of living men",
//       image:
//         "https://pixel.nymag.com/imgs/daily/vulture/2019/04/04/got-recap/02-got-seasons-recap-illo.w1100.h733.jpg",
//       price: 3000,
//     };
//     const createdMovie = await MovieModel.create(newMovieData);

//     // Update the Movie document
//     const updatedData = {
//       title: "Games of Thrones - Updated",
//       description: "Updated description",
//       image:
//         "https://pixel.nymag.com/imgs/daily/vulture/2019/04/04/got-recap/02-got-seasons-recap-illo.w1100.h733.jpg",
//       price: 3000,
//     };

//     // Update the movie document by calling findByIdAndUpdate with the valid _id
//     const updatedMovie = await MovieModel.findByIdAndUpdate(
//       createdMovie._id,
//       updatedData,
//       { new: true }
//     );

//     // Assert that the Movie document was updated successfully
//     expect(updatedMovie).not.toBeNull();
//     expect(updatedMovie?.userId).toEqual(newMovieData.userId);
//     expect(updatedMovie?.title).toEqual(updatedData.title);
//     expect(updatedMovie?.description).toEqual(updatedData.description);
//     expect(updatedMovie?.image).toEqual(updatedData.image);
//     expect(updatedMovie?.price).toEqual(updatedData.price);
//   });

//   test("should fail to update a non-existent Movie", async () => {
//     const nonExistentMovieId = new mongoose.Types.ObjectId();
//     const updatedData = {
//       title: "Games of Thrones - Updated",
//       description: "Updated description",
//       image:
//         "https://pixel.nymag.com/imgs/daily/vulture/2019/04/04/got-recap/02-got-seasons-recap-illo.w1100.h733.jpg",
//       price: 3000,
//     };

//     const updatedMovie = await MovieModel.findByIdAndUpdate(
//       nonExistentMovieId,
//       updatedData
//     );

//     expect(updatedMovie).toBeNull();
//   });

//   test("should delete a Movie successfully", async () => {
//     const MovieData = {
//       userId: new mongoose.Types.ObjectId("643f09f8978e60f5de08fdc8"),
//       title: "Game of Thrones",
//       description:
//         "Nine noble families wage war against each other in order to gain control over the mythical land of Westeros. Meanwhile, a force is rising after millenniums and threatens the existence of living men",
//       image:
//         "https://pixel.nymag.com/imgs/daily/vulture/2019/04/04/got-recap/02-got-seasons-recap-illo.w1100.h733.jpg",
//       price: 3000,
//     };

//     const newMovieData = new MovieModel({
//       userId: new mongoose.Types.ObjectId(MovieData.userId),
//       title: MovieData.title,
//       description: MovieData.description,
//       image: MovieData.image,
//       price: MovieData.price,
//     });

//     await newMovieData.save();

//     const deleteResult = await MovieModel.deleteOne({ _id: newMovieData._id });

//     expect(deleteResult.deletedCount).toEqual(1);
//   });

//   test("should fail to delete a non-existent Movie", async () => {
//     const nonExistentMovieId = new mongoose.Types.ObjectId();
//     const deleteResult = await MovieModel.deleteOne({
//       _id: nonExistentMovieId,
//     });

//     expect(deleteResult.deletedCount).toEqual(0);
//   });
// });
