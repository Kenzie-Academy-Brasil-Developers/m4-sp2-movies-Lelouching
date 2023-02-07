import { iMovie, iMovieCreate } from "./../../interfaces"

declare global {
    namespace Express {
        interface Request {
            movieCreate: iMovieCreate,
            movieSelected: iMovie
        }
    }
}