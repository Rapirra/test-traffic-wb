import axios from 'axios';
import knexDb from '#knexDB.js';
import { GoogleSheetsService } from '#services/google-sheets-service.js';

export const TariffDataService = {
    /**
     * Main method to fetch data from the API and handle database and Google Sheets operations.
     *
     * @async
     * @function fetchAndProcessTariffData
     * @returns {Promise<void>}
     */
    async fetchAndProcessTariffData() {
        const appUrl = process.env.API_WB_ENDPOINT;
        const apiKey = process.env.API_WB_KEY;
        if (!appUrl || !apiKey) return;

        const today = new Date().toISOString().split('T')[0];

        try {
            const response = await axios.get(appUrl, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
                params: {
                    date: today,
                },
            });

            console.log('response.data', response.data);
            const data = response.data;

            if (data?.response?.data) {
                const formattedData = await this.updateOrInsertTariffs(data.response.data);
                if (formattedData) {
                    await GoogleSheetsService.postToAllSheets(formattedData, 'stocks_coefs');
                }
            }
        } catch (error) {
            console.error('Error while fetching data:', error);
        }
    },
    /**
     * Private method to update or insert tariff data into the database.
     *
     * @private
     * @param {object} data - The tariff data.
     * @param {string} data.dtNextBox - The next box date.
     * @param {string} data.dtTillMax - The maximum date.
     * @param {object[]} data.warehouseList - List of warehouses.
     * @param {string} data.warehouseList[].warehouseName - The name of the warehouse.
     * @param {string} data.warehouseList[].boxDeliveryAndStorageExpr - The delivery and storage expression for the warehouse.
     * @param {number} data.warehouseList[].boxDeliveryBase - The base delivery price.
     * @param {number} data.warehouseList[].boxDeliveryLiter - The delivery price per liter.
     * @param {number} data.warehouseList[].boxStorageBase - The base storage price.
     * @param {number} data.warehouseList[].boxStorageLiter - The storage price per liter.
     * @returns {Promise<string[][]>} The formatted data for Google Sheets as an array of rows, where each row is an object with the properties: warehouseName,
     *   dtNextBox, dtTillMax, boxDeliveryAndStorageExpr, boxDeliveryBase, boxDeliveryLiter, boxStorageBase, boxStorageLiter, and today.
     */
    async updateOrInsertTariffs(data) {
        const { dtNextBox, dtTillMax, warehouseList } = data;
        const today = new Date().toISOString().split('T')[0];
        console.log('First warehouse:', warehouseList[0]);

        const formattedDataForSheets = [];

        for (const warehouse of warehouseList) {
            const existingEntry = await knexDb('warehouses').where('date', today).andWhere('warehouse_name', warehouse.warehouseName).first();

            const row = [
                warehouse.warehouseName,
                dtNextBox,
                dtTillMax,
                warehouse.boxDeliveryAndStorageExpr + '',
                warehouse.boxDeliveryBase + '',
                warehouse.boxDeliveryLiter + '',
                warehouse.boxStorageBase + '',
                warehouse.boxStorageLiter + '',
                today,
            ];

            formattedDataForSheets.push(row);

            const dbFormattedData = {
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
                await knexDb('warehouses').where('date', today).andWhere('warehouse_name', warehouse.warehouseName).update(dbFormattedData);
            } else {
                await knexDb('warehouses').insert({
                    ...dbFormattedData,
                    date: today,
                    warehouse_name: warehouse.warehouseName,
                    created_at: new Date(),
                });
            }
        }

        return formattedDataForSheets;
    },
};
