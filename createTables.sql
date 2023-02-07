CREATE TABLE IF NOT EXISTS "movies" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL UNIQUE,
    "description" TEXT DEFAULT NULL,
    "duration" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    CHECK("price" > 0)
);