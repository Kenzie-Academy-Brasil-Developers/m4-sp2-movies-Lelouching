import { QueryResult } from "pg"

export interface iMovie {
    id: number,
    name: string,
    description: number,
    duration: number,
    price: number
}

export type iMovieCreate = Omit<iMovie, "id">
export type iMoviesResult = QueryResult<iMovie>
export type iRequiredKeys = "name" | "description" | "duration" | "price"
export type iRequiredQueryOrder = "ASC" | "DESC"

export interface iPaginationResult {
    previousPage: string | null,
    nextPage: string | null,
    count: number,
    data: iMovie[]
}