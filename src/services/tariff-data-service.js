import axios from 'axios';
import knexDb from '#knexDB.js';
import { GoogleSheetsService } from '#services/google-sheets-service.js';

export class TariffDataService {
    /**
     * Creates an instance of TariffDataService.
     *
     * @class
     */
    constructor() {
        this.appUrl = 'https://common-api.wildberries.ru/api/v1/tariffs/box';
        this.apiKey =
            'eyJhbGciOiJFUzI1NiIsImtpZCI6IjIwMjQxMDE2djEiLCJ0eXAiOiJKV1QifQ.eyJlbnQiOjEsImV4cCI6MTc0NjA2ODAxNywiaWQiOiIwMTkyZGRlYS1mOWU2LTcxNzItODk0Ny1iMjE1Y2I5MmU5NDgiLCJpaWQiOjQ1OTExNjA5LCJvaWQiOjExMzA0NiwicyI6MTA3Mzc0MTgzMiwic2lkIjoiOTMyYzE3NmEtNTA4NS01YzZmLWJjMzMtNGU4NGNkZjU4ZDdlIiwidCI6ZmFsc2UsInVpZCI6NDU5MTE2MDl9.l2C-kGr-1YptJ5iyp_q1RYSxDOgENHXfGepnmo709g2UsGDnT90NnBt5K-nVLVH14XaEFi81dcmeZvF6qz-oxQ';
        this.googleSheetsService = new GoogleSheetsService();
    }
    /**
     * Main method to fetch data from the API and handle database and Google Sheets operations.
     *
     * @async
     * @function fetchAndProcessTariffData
     * @returns {Promise<void>}
     */
    async fetchAndProcessTariffData() {
        if (!this.appUrl || !this.apiKey) return;

        const today = new Date().toISOString().split('T')[0];

        try {
            const response = await axios.get(this.appUrl, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                params: {
                    date: today,
                },
            });
            const data = response.data;

            if (data?.response?.data) {
                const formattedData = await this.updateOrInsertTariffs(data.response.data);
                if (formattedData) {
                    const columnsName = [
                        [
                            'Склад',
                            'dt_next_box',
                            'dt_till_max',
                            'box_delivery_and_storage_expr',
                            'box_delivery_base',
                            'box_delivery_liter',
                            'box_storage_base',
                            'box_storage_liter',
                            'Дата',
                        ],
                    ];
                    const dataToPost = columnsName.concat(formattedData);
                    await this.googleSheetsService.postToAllSheets(dataToPost);
                }
            }
        } catch (error) {
            console.error('Error while fetching data:', error);
        }
    }

    /**
     * Private method to update or insert tariff data into the database.
     *
     * @async
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
    }

    async getAllData() {
        const dataToPass = await knexDb('warehouses').select();
        const columnsName = [
            [
                'Склад',
                'dt_next_box',
                'dt_till_max',
                'box_delivery_and_storage_expr',
                'box_delivery_base',
                'box_delivery_liter',
                'box_storage_base',
                'box_storage_liter',
                'Дата',
            ],
        ];
        const reformattedData = dataToPass.map((item) => {
            return [
                item.warehouse_name,
                item.dt_next_box,
                item.dt_till_max,
                item.box_delivery_and_storage_expr + '',
                item.box_delivery_base + '',
                item.box_delivery_liter + '',
                item.box_storage_base + '',
                item.box_storage_liter + '',
                item.updated_at + '',
            ];
        });
        const pastData = columnsName.concat(reformattedData);
        await this.googleSheetsService.postToAllSheets(pastData);
    }
}
