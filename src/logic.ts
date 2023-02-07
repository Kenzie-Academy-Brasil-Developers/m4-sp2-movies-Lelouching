import { client } from "./database"
import { iMoviesResult, iPaginationResult, iRequiredKeys, iRequiredQueryOrder } from "./interfaces"
import { Request, Response } from "express";
import format from "pg-format";
import { QueryConfig } from "pg";

export const allMovies = async (req: Request, res: Response): Promise<Response> => {
    try {
        let page: number = Number(req.query.page) || 1
        let perPage: number = Number(req.query.perPage) || 5

        if(perPage < 1 || perPage > 5 || typeof perPage !== "number") {
            perPage = 5
        }

        if(page < 1 || typeof page !== "number") {
            page = 1
        }

        let queryString: string = `
            SELECT
                *
            FROM
                "movies"
            OFFSET $1 LIMIT $2;
        `

        let queryConfig: QueryConfig = {
            text: queryString,
            values: [perPage * (page - 1), perPage]
        }

        if(req.query.sort === "price" || req.query.sort === "duration") {
            if(req.query.order === "ASC" || req.query.order === "asc" || req.query.order === "DESC" || req.query.order === "desc") {
                let order: iRequiredQueryOrder = "ASC"
                if(req.query.order === "DESC" || req.query.order === "desc") {
                    order = "DESC"
                }

                queryString = format(
                    `
                        SELECT
                            *
                        FROM
                            "movies"
                        ORDER BY %I %s
                        OFFSET $1 LIMIT $2;
                    `,
                    req.query.sort,
                    order
                )

                queryConfig = {
                    text: queryString,
                    values: [perPage * (page - 1), perPage]
                }
            }
        }

        const queryResult: iMoviesResult = await client.query(queryConfig)

        const queryStringNextPage: string = `
            SELECT
                *
            FROM
                "movies"
            OFFSET $1 LIMIT $2;
        `

        const queryConfigNextPage: QueryConfig = {
            text: queryStringNextPage,
            values: [perPage * page, perPage]
        }

        const queryResultNextPage: iMoviesResult = await client.query(queryConfigNextPage)

        const baseUrl: string = "http://localhost:3000/movies"

        const pagination: iPaginationResult = {
            previousPage: page - 1 < 1 ? null : `${baseUrl}?page=${page - 1}&perPage=${perPage}`,
            nextPage: !queryResultNextPage.rows.length ? null : `${baseUrl}?page=${page + 1}&perPage${perPage}`,
            count: queryResult.rowCount,
            data: queryResult.rows
        }

        return res.status(200).json(pagination)
    } catch (error: unknown) {
        console.log(error)
        return res.status(500).json({
            message: error
        })
    }
}

export const createMovie = async (req: Request, res: Response): Promise<Response> => {
    try {
        let requiredKeys: iRequiredKeys[] = ["name", "description", "duration", "price"]

        if(Object.keys(req.body).length === 3) {
            requiredKeys = ["name", "duration", "price"]
        }

        const validateKeys: boolean = requiredKeys.every((key: string) => Object.keys(req.body).includes(key))

        if(!validateKeys) {
            return res.status(400).json({
                message: `Required keys are: ${requiredKeys.join(", ")}`
            })
        }

        if(Object.keys(req.body).length > requiredKeys.length) {
            return res.status(400).json({
                message: `Only allowed keys are: ${requiredKeys.join(", ")}`
            })
        }

        if(typeof req.body.name !== "string" || typeof req.body.duration !== "number" || typeof req.body.price !== "number") {
            return res.status(400).json({
                message: `The values field should be: name and description = string, duration and price = number`
            })
        }

        if(Object.keys(req.body).length > 3 && typeof req.body.description !== "string") {
            return res.status(400).json({
                message: `The values field should be: name and description = string, duration and price = number`
            })
        }

        const queryString: string = format(
            `
                INSERT INTO "movies"
                    (%I)
                VALUES
                    (%L)
                RETURNING *;
            `,
            Object.keys(req.body),
            Object.values(req.body)
        )
    
        const queryResult: iMoviesResult = await client.query(queryString)
        return res.status(201).json(queryResult.rows[0])
    } catch (error: unknown) {
        return res.status(500).json({
            message: error
        })
    }
}

export const updateMovie = async (req: Request, res: Response): Promise<Response> => {
    try {

        const requiredKeys: string[] = ["name", "description", "duration", "price"]

        const validateKeys: boolean = Object.keys(req.body).every((key: string) => requiredKeys.includes(key))

        if(!validateKeys) {
            return res.status(400).json({
                message: `Only allowed keys are: ${requiredKeys.join(", ")}`
            })
        }

        if(req.body.name) {
            if(typeof req.body.name !== "string") {
                return res.status(400).json({
                    message: `The field values should be: name and description = string, duration and price = number`
                })
            }
        }

        if(req.body.description) {
            if(typeof req.body.description !== "string") {
                return res.status(400).json({
                    message: `The field values should be: name and description = string, duration and price = number`
                })
            }
        }

        if(req.body.duration) {
            if(typeof req.body.duration !== "number") {
                return res.status(400).json({
                    message: `The field values should be: name and description = string, duration and price = number`
                })
            }
        }

        if(req.body.price) {
            if(typeof req.body.price !== "number") {
                return res.status(400).json({
                    message: `The field values should be: name and description = string, duration and price = number`
                })
            }
        }

        const queryString: string = format(
            `
                UPDATE 
                    "movies"
                SET(%I) = ROW(%L)
                WHERE 
                    "id" = $1
                RETURNING *;
            `,
            Object.keys(req.body),
            Object.values(req.body)
        )

        const queryConfig: QueryConfig = {
            text: queryString,
            values: [Number(req.params.id)]
        }

        const queryResult: iMoviesResult = await client.query(queryConfig)

        return res.status(200).json(queryResult.rows[0])
    } catch (error: unknown) {
        return res.status(500).json({
            message: error
        })
    }
}

export const deleteMovies = async (req: Request, res: Response): Promise<Response> => {
    try {

        const queryString: string = `
            DELETE FROM
                "movies"
            WHERE
                "id" = $1
        `

        const queryConfig: QueryConfig = {
            text: queryString,
            values: [Number(req.params.id)]
        }

        await client.query(queryConfig)

        return res.status(204).send()
    } catch (error: unknown) {
        return res.status(500).json({
            message: error
        })
    }
}