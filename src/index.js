import axios from 'axios';
import { updateOrInsertTariffs } from '#services/tariffsService.js';
import dotenv from 'dotenv';

dotenv.config();

function fetchTariffData() {
    const appUrl = process.env.API_WB_ENDPOINT;
    const apiKey = process.env.API_WB_KEY;
    if (appUrl === undefined || apiKey === undefined) return;
    const today = new Date().toISOString().split('T')[0];
    // console.log(`Fetching tariff data from ${apiKey}`, appUrl);

    return axios
        .get(appUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            params: {
                date: today,
            },
        })
        .then((response) => {
            console.log('response, response.data', response.data);
            const data = response.data;
            return updateOrInsertTariffs(data?.response?.data);
        })
        .catch((error) => {
            console.error('Ошибка при получении данных:', error);
        });
}

fetchTariffData();
//
// setInterval(
//     () => {
//         fetchTariffData();
//     },
//     60 * 60 * 1000,
// );
