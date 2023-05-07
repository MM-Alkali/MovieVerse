// import { MovieModel } from "../model/moviesModel";
// import { User } from "../model/userModel";

// async function moveMoviesToUserCollection() {
//   try {
//     const movies = await MovieModel.find().lean();

//     // Group movies by userId
//     const moviesByUserId: { [userId: string]: any[] } = {};
//     movies.forEach((movie) => {
//       if (!moviesByUserId[movie.userId]) {
//         moviesByUserId[movie.userId] = [];
//       }
//       moviesByUserId[movie.userId].push(movie);
//     });

//     // Update users with their movies
//     for (const userId of Object.keys(moviesByUserId)) {
//       const user = await User.findById(userId);
//       if (user) {
//         const moviesToAdd = moviesByUserId[userId].map(({ _id, title, description, image, price }) => ({ _id, title, description, image, price }));
//         user.movies = [...user.movies, ...moviesToAdd];
//         await user.save();
//       }
//     }

//     // Delete movies collection
//     await MovieModel.deleteMany({});
//     console.log("Movies moved to User collection successfully");
//   } catch (error) {
//     console.log("Error occurred while moving movies:", error);
//   }
// }
