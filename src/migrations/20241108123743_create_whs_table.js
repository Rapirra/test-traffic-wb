/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export function up(knex) {
    return knex.schema.createTable('warehouses', (table) => {
        table.increments('id').primary();
        table.string('date').notNullable();
        table.string('dt_next_box').notNullable();
        table.string('dt_till_max').notNullable();

        table.string('warehouse_name').notNullable();
        table.string('box_delivery_and_storage_expr').notNullable();
        table.string('box_delivery_base').notNullable();
        table.string('box_delivery_liter').notNullable();
        table.string('box_storage_base').notNullable();
        table.string('box_storage_liter').notNullable();

        table.timestamps(true, true);
    });
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export function down(knex) {
    return knex.schema.dropTable('warehouses');
}
