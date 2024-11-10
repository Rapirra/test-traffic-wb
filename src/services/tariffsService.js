import knexDb from '#knexDB.js';

/**
 * Updates or inserts tariff data for warehouses into the database.
 *
 * @param {object} data - The data object containing general and warehouse-specific information.
 * @param {string} data.dtNextBox - The date of the next box delivery (format: YYYY-MM-DD).
 * @param {string} data.dtTillMax - The date until which the maximum tariff is valid (format: YYYY-MM-DD).
 * @param {object[]} data.warehouseList - An array of warehouse data objects.
 * @param {string} data.warehouseList[].warehouseName - The name of the warehouse.
 * @param {string} data.warehouseList[].boxDeliveryAndStorageExpr - The expression for box delivery and storage.
 * @param {string} data.warehouseList[].boxDeliveryBase - The base delivery cost of the box.
 * @param {string} data.warehouseList[].boxDeliveryLiter - The delivery cost per liter for the box.
 * @param {string} data.warehouseList[].boxStorageBase - The base storage cost of the box.
 * @param {string} data.warehouseList[].boxStorageLiter - The storage cost per liter for the box.
 * @returns {Promise<any[]>} A promise that resolves when all warehouse data has been processed, with results of updates and inserts.
 */

export const updateOrInsertTariffs = (data) => {
    const { dtNextBox, dtTillMax, warehouseList } = data;
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    console.log('wareho', warehouseList[0]);

    return Promise.all(
        warehouseList.map((warehouse) => {
            console.log('warehouse', warehouse);
            return knexDb('warehouses')
                .where('date', today)
                .andWhere('warehouse_name', warehouse.warehouseName)
                .first()
                .then((existingEntry) => {
                    const formattedData = {
                        dt_next_box: dtNextBox,
                        dt_till_max: dtTillMax,
                        box_delivery_and_storage_expr: warehouse.boxDeliveryAndStorageExpr,
                        box_delivery_base: warehouse.boxDeliveryBase,
                        box_delivery_liter: warehouse.boxDeliveryLiter,
                        box_storage_base: warehouse.boxStorageBase,
                        box_storage_liter: warehouse.boxStorageLiter,
                        updated_at: new Date(),
                    };

                    if (existingEntry) {
                        return knexDb('warehouses')
                            .where('date', today)
                            .andWhere('warehouse_name', warehouse.warehouseName)
                            .update(formattedData)
                            .then((updatedRows) => {
                                console.log(`${updatedRows} row(s) updated for warehouse: ${warehouse.warehouseName}`);
                                return updatedRows;
                            });
                    } else {
                        return knexDb('warehouses')
                            .insert({
                                ...formattedData,
                                date: today,
                                warehouse_name: warehouse.warehouseName,
                                created_at: new Date(),
                            })
                            .then((insertedRows) => {
                                console.log(`${insertedRows} row(s) inserted for warehouse: ${warehouse.warehouseName}`);
                                return insertedRows;
                            });
                    }
                })
                .catch((error) => {
                    console.error(`Error during update or insert for warehouse: ${warehouse.warehouseName}`, error);
                });
        }),
    );
};
