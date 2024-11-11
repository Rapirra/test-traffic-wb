import dotenv from 'dotenv';

dotenv.config();

export default {
    client: 'postgresql',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: 'postgres',
        database: 'testtraffic',
        port: 5432,
    },
    migrations: {
        tableName: 'knex_migrations',
        directory: './src/migrations',
    },
    seeds: {
        directory: './seeds',
    },
    pool: {
        min: 2,
        max: 10,
    },
};
