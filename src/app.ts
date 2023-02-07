import { ifIdExists, ifMovieNameExists } from "./middlewares"
import { allMovies, createMovie, deleteMovies, updateMovie } from "./logic"
import express, { Application } from "express";
import { startDatabase } from "./database";

const app: Application = express()
app.use(express.json())

const PORT: number = 3000

app.post("/movies", ifMovieNameExists, createMovie)
app.get("/movies/", allMovies)
app.patch("/movies/:id", ifIdExists, ifMovieNameExists, updateMovie)
app.delete("/movies/:id", ifIdExists, deleteMovies)

app.listen(PORT, async (): Promise<void> => {
    await startDatabase()
    console.log(`Server is running on http://localhost:${PORT}`)
})