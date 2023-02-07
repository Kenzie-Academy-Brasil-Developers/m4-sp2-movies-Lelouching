import format from "pg-format"
import { iMoviesResult } from "./interfaces"
import { NextFunction, Request, Response } from "express";
import { client } from "./database";

export const ifIdExists = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const queryString: string = format(
            `
            SELECT
                *
            FROM
                "movies"
            WHERE
                "id" = %L
            `,
            Number(req.params.id)
        )

        const queryResult: iMoviesResult = await client.query(queryString)
        if(!queryResult.rows.length) {
            return res.status(404).json({
                message: `Movie id ${Number(req.params.id)} does not exist`
            })
        }

    } catch (error: unknown) {
        return res.status(500).json({
            message: error
        })
    }

    next()
}

export const ifMovieNameExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        let name: string = req.body.name

        if(name) {
            const queryString: string = format(
                `
                    SELECT
                        *
                    FROM
                        "movies"
                    WHERE
                        LOWER("name") = %L
                `,
                name.toLowerCase()
            )
    
            const queryResult: iMoviesResult = await client.query(queryString)
    
            if(queryResult.rows[0]) {
                return res.status(409).json({
                    message: `The movie ${name} already exists`
                })
            }
        }
        
    } catch (error: unknown) {
        return res.status(500).json({
            message: error
        })
    }

    next()
}