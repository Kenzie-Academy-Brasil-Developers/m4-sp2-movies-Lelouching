import { Client } from "pg"

export const client: Client = new Client({
    user: "Lelouching",
    password: "1234",
    host: "localhost",
    database: "Lelouching",
    port: 5432
})

export const startDatabase = async (): Promise<void> => {
    await client.connect()
}