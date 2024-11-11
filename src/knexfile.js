import dotenv from 'dotenv';

dotenv.config();

export default {
    client: 'postgresql',
    connection: {
        host: process.env.DBHOST ?? 'localhost',
        user: process.env.DBUSER ?? 'postgres',
        password: process.env.DBPASSWORD ?? 'postgres',
        database: process.env.DBNAME ?? 'testtraffic',
        port: process.env.DBPORT ? Number(process.env.DB_PORT) : 5432,
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
