import knex from 'knex';
import knexConfig from './knexfile.js';

const knexDb = knex(knexConfig);

export default knexDb;
