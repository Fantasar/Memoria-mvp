CREATE TABLE test_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    pays VARCHAR(50),
    UNIQUE (name)
);
